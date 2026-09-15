import { Router } from "express";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// ASSUMPTIONS — verify against src/middleware/auth.js:
//   req.user.user_id -> logged-in user's id
//   req.user.role    -> "admin" | "manager" | "sales_rep"
// All tables live in the `crm` schema (confirmed from the "relation does
// not exist" error last round) — every query below is schema-qualified.

const STAGES = ["prospecting", "qualification", "proposal", "negotiation", "won", "lost"];

function scopeClause(req, prefix = "") {
  if (req.user.role === "sales_rep") {
    return { clause: `${prefix}owner_id = $1`, params: [req.user.user_id] };
  }
  return { clause: "TRUE", params: [] };
}

router.get("/summary", requireAuth, async (req, res) => {
  try {
    const scope = scopeClause(req);
    const scopeO = scopeClause(req, "o.");
    const scopeAc = scopeClause(req, "ac.");

    const [
      pipelineRows, valueRow, winRateRow, leadsByStatus, leadsBySource, activityLoad,
      recentDeals, repLeaderboard, activityByRep, cumulativeSales, overdueDeals,
    ] = await Promise.all([
      pool.query(
        `SELECT stage, COUNT(*)::int AS count, COALESCE(SUM(amount),0)::numeric AS total_amount
         FROM crm.opportunities WHERE ${scope.clause} GROUP BY stage`,
        scope.params
      ),
      pool.query(
        `SELECT COALESCE(SUM(amount),0)::numeric AS open_value,
                COALESCE(SUM(amount * probability / 100.0),0)::numeric AS weighted_value
         FROM crm.opportunities WHERE stage NOT IN ('won','lost') AND ${scope.clause}`,
        scope.params
      ),
      pool.query(
        `SELECT COUNT(*) FILTER (WHERE stage='won')::int AS won_count,
                COUNT(*) FILTER (WHERE stage='lost')::int AS lost_count
         FROM crm.opportunities WHERE stage IN ('won','lost') AND ${scope.clause}`,
        scope.params
      ),
      pool.query(
        `SELECT status, COUNT(*)::int AS count FROM crm.leads WHERE ${scope.clause} GROUP BY status`,
        scope.params
      ),
      pool.query(
        `SELECT COALESCE(lead_source, 'Unknown') AS lead_source, COUNT(*)::int AS count
         FROM crm.leads WHERE ${scope.clause} GROUP BY lead_source ORDER BY count DESC LIMIT 8`,
        scope.params
      ),
      pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status='pending')::int AS overdue,
           COUNT(*) FILTER (WHERE due_date = CURRENT_DATE AND status='pending')::int AS due_today,
           COUNT(*) FILTER (WHERE due_date > CURRENT_DATE AND due_date <= CURRENT_DATE + INTERVAL '7 days' AND status='pending')::int AS upcoming_7d
         FROM crm.activities WHERE ${scope.clause}`,
        scope.params
      ),
      // Recent deals — last 8 opportunities by creation date, any stage
      pool.query(
        `SELECT o.opportunity_id, o.name, o.amount, o.stage, a.account_name
         FROM crm.opportunities o
         JOIN crm.accounts a ON a.account_id = o.account_id
         WHERE ${scopeO.clause}
         ORDER BY o.created_at DESC LIMIT 8`,
        scopeO.params
      ),
      // Deals closed (won) this calendar month, grouped by owner
      pool.query(
        `SELECT o.owner_id, u.first_name, u.last_name,
                COUNT(*)::int AS deals, COALESCE(SUM(o.amount),0)::numeric AS total_amount
         FROM crm.opportunities o
         JOIN crm.users u ON u.user_id = o.owner_id
         WHERE o.stage = 'won'
           AND date_trunc('month', o.close_date) = date_trunc('month', CURRENT_DATE)
           AND ${scopeO.clause}
         GROUP BY o.owner_id, u.first_name, u.last_name
         ORDER BY total_amount DESC LIMIT 8`,
        scopeO.params
      ),
      // Calls vs meetings logged per rep — the "SDR activity" chart
      pool.query(
        `SELECT ac.owner_id, u.first_name, u.last_name,
                COUNT(*) FILTER (WHERE ac.type = 'call')::int AS calls,
                COUNT(*) FILTER (WHERE ac.type = 'meeting')::int AS meetings
         FROM crm.activities ac
         JOIN crm.users u ON u.user_id = ac.owner_id
         WHERE ${scopeAc.clause}
         GROUP BY ac.owner_id, u.first_name, u.last_name
         ORDER BY (COUNT(*) FILTER (WHERE ac.type = 'call') + COUNT(*) FILTER (WHERE ac.type = 'meeting')) DESC
         LIMIT 8`,
        scopeAc.params
      ),
      // Cumulative won revenue over the last 30 days
      pool.query(
        `WITH days AS (
           SELECT generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day')::date AS day
         ),
         daily AS (
           SELECT close_date AS day, SUM(amount) AS amt
           FROM crm.opportunities
           WHERE stage = 'won' AND close_date >= CURRENT_DATE - INTERVAL '29 days' AND ${scope.clause}
           GROUP BY close_date
         )
         SELECT d.day,
                COALESCE(SUM(daily.amt) OVER (ORDER BY d.day ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 0)::numeric AS cumulative
         FROM days d
         LEFT JOIN daily ON daily.day = d.day
         ORDER BY d.day`,
        scope.params
      ),
      // Open deals whose close_date has already passed — the honest
      // substitute for "renewals at risk" (your schema has no renewal concept)
      pool.query(
        `SELECT COUNT(*)::int AS count, COALESCE(SUM(amount),0)::numeric AS total_amount
         FROM crm.opportunities
         WHERE stage NOT IN ('won','lost') AND close_date < CURRENT_DATE AND ${scope.clause}`,
        scope.params
      ),
    ]);

    const byStage = Object.fromEntries(pipelineRows.rows.map((r) => [r.stage, r]));
    const pipeline = STAGES.map((stage) => ({
      stage,
      count: byStage[stage]?.count || 0,
      total_amount: Number(byStage[stage]?.total_amount || 0),
    }));

    const won = winRateRow.rows[0].won_count;
    const lost = winRateRow.rows[0].lost_count;
    const closedTotal = won + lost;

    res.json({
      pipeline,
      open_value: Number(valueRow.rows[0].open_value),
      weighted_value: Number(valueRow.rows[0].weighted_value),
      win_rate: {
        won,
        lost,
        win_rate_pct: closedTotal ? Math.round((won / closedTotal) * 1000) / 10 : null,
      },
      leads_by_status: leadsByStatus.rows,
      leads_by_source: leadsBySource.rows,
      activity_load: activityLoad.rows[0],
      recent_deals: recentDeals.rows,
      rep_leaderboard: repLeaderboard.rows,
      activity_by_rep: activityByRep.rows,
      cumulative_sales: cumulativeSales.rows.map((r) => ({ day: r.day, cumulative: Number(r.cumulative) })),
      overdue_deals: overdueDeals.rows[0],
    });
  } catch (err) {
    console.error("dashboard summary error:", err);
    res.status(500).json({ error: "Failed to load dashboard summary" });
  }
});

export default router;