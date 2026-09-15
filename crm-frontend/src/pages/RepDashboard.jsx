import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { opportunitiesApi, leadsApi, dashboardApi } from "../api/resources";
import { money } from "../components/Shared";
import { useAuth } from "../context/AuthContext";
import { DetailSkeleton } from "../components/Skeleton";
import { STAGE_COLORS, STAGE_LABELS, tickStyle, monoTickStyle, tooltipStyle, WinRateGauge } from "./dashboardShared";

// Personal dashboard for sales_rep: everything here is already scoped to
// "my records only" by the existing owner_id row-level scoping — no team
// or org-wide data appears here by design.
export default function RepDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [opps, leadList, summaryData] = await Promise.all([
          opportunitiesApi.list(), leadsApi.list(), dashboardApi.summary(),
        ]);
        if (cancelled) return;
        setOpportunities(opps);
        setLeads(leadList);
        setSummary(summaryData);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <DetailSkeleton />;
  if (error) return <div className="view"><div className="form-error">{error}</div></div>;

  const open = opportunities.filter((o) => o.stage !== "won" && o.stage !== "lost");
  const openTotal = open.reduce((s, o) => s + Number(o.amount), 0);
  const wonTotal = opportunities.filter((o) => o.stage === "won").reduce((s, o) => s + Number(o.amount), 0);
  const newLeads = leads.filter((l) => l.status === "new");
  const overdue = summary?.activity_load.overdue ?? 0;
  const overdueDeals = summary?.overdue_deals;

  const pipelineData = summary
    ? summary.pipeline.filter((p) => p.count > 0).map((p) => ({ stage: STAGE_LABELS[p.stage], amount: p.total_amount, fill: STAGE_COLORS[p.stage] }))
    : [];

  return (
    <div className="view">
      <h1 className="page-title">Good morning, {user?.first_name || ""}</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">My open pipeline</div>
          <div className="stat-value">{money(openTotal)}</div>
          <div className="stat-sub">{open.length} open deals</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Won this period</div>
          <div className="stat-value" style={{ color: "#2E7D46" }}>{money(wonTotal)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overdue activities</div>
          <div className="stat-value" style={overdue > 0 ? { color: "#B3261E" } : undefined}>{overdue}</div>
          <div className="stat-sub">{summary?.activity_load.due_today ?? 0} due today</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">New leads</div>
          <div className="stat-value">{newLeads.length}</div>
        </div>
      </div>

      {overdueDeals && overdueDeals.count > 0 && (
        <div className="alert-banner">
          <strong>{overdueDeals.count}</strong> of my open deal{overdueDeals.count !== 1 ? "s" : ""} past close date
          <span className="alert-banner-amount">{money(overdueDeals.total_amount)}</span>
        </div>
      )}

      <div className="dash-columns">
        <div className="dash-panel">
          <div className="panel-title">My deals closing soon</div>
          <div className="mini-list">
            {open.length === 0 && <div className="empty-block">No open deals.</div>}
            {open.slice(0, 6).map((o) => (
              <div key={o.opportunity_id} className="mini-row" onClick={() => navigate(`/opportunities/${o.opportunity_id}`)}>
                <span>{o.name}</span>
                <span className="mini-amount">{money(o.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dash-panel">
          <div className="panel-title">My new leads</div>
          <div className="mini-list">
            {newLeads.length === 0 && <div className="empty-block">No new leads.</div>}
            {newLeads.slice(0, 6).map((l) => (
              <div key={l.lead_id} className="mini-row" onClick={() => navigate("/leads")}>
                <span>{l.first_name} {l.last_name}</span>
                <span className="mini-sub">{l.company_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {summary && (
        <div className="dash-columns" style={{ marginTop: 16 }}>
          <div className="dash-panel">
            <div className="panel-title">My pipeline by stage</div>
            {pipelineData.length === 0 ? (
              <div className="empty-block">No open deals to chart yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                  <XAxis dataKey="stage" tick={tickStyle} axisLine={{ stroke: "#D8D8D8" }} tickLine={false} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={monoTickStyle} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => money(v)} contentStyle={tooltipStyle} cursor={{ fill: "#F3F2F2" }} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {pipelineData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="dash-panel">
            <div className="panel-title">My win rate</div>
            <WinRateGauge pct={summary.win_rate.win_rate_pct} />
            <div className="empty-block" style={{ textAlign: "center", padding: 0 }}>
              {summary.win_rate.won} won / {summary.win_rate.lost} lost
            </div>
          </div>
        </div>
      )}
    </div>
  );
}