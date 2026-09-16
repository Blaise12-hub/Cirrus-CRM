import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import { opportunitiesApi, leadsApi, dashboardApi } from "../api/resources";
import { money } from "../components/Shared";
import { useAuth } from "../context/AuthContext";
import { DetailSkeleton } from "../components/Skeleton";
import { STAGE_COLORS, STAGE_LABELS, LEAD_STATUS_COLORS, tickStyle, monoTickStyle, tooltipStyle, WinRateGauge } from "./dashboardShared";

export default function TeamDashboard() {
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

  const pipelineData = summary ? summary.pipeline.map((p) => ({ stage: STAGE_LABELS[p.stage], amount: p.total_amount, fill: STAGE_COLORS[p.stage] })) : [];
  const leadsStatusData = summary ? summary.leads_by_status.map((s) => ({ name: s.status, value: s.count, fill: LEAD_STATUS_COLORS[s.status] || "#8A8D91" })) : [];
  const leadsSourceData = summary ? summary.leads_by_source : [];
  const overdue = summary?.activity_load.overdue ?? 0;

  const cumulativeData = summary
    ? summary.cumulative_sales.map((d) => ({ day: new Date(d.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }), cumulative: d.cumulative }))
    : [];
  const activityByRep = summary
    ? summary.activity_by_rep.map((r) => ({ rep: `${r.first_name} ${r.last_name}`, calls: r.calls, meetings: r.meetings }))
    : [];
  const overdueDeals = summary?.overdue_deals;

  return (
    <div className="view">
      <h1 className="page-title">Good morning, {user?.first_name || ""}</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Open pipeline</div>
          <div className="stat-value">{money(openTotal)}</div>
          <div className="stat-sub">{open.length} open deals</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Won this period</div>
          <div className="stat-value" style={{ color: "#2E7D46" }}>{money(wonTotal)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total deals</div>
          <div className="stat-value">{opportunities.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">New leads</div>
          <div className="stat-value">{newLeads.length}</div>
        </div>
      </div>

      {overdueDeals && overdueDeals.count > 0 && (
        <div className="alert-banner">
          <strong>{overdueDeals.count}</strong> open deal{overdueDeals.count !== 1 ? "s" : ""} past their close date
          <span className="alert-banner-amount">{money(overdueDeals.total_amount)} at stake</span>
        </div>
      )}

      <div className="dash-columns">
        <div className="dash-panel">
          <div className="panel-title">Deals closing soon</div>
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
          <div className="panel-title">New leads</div>
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
        <>
          <h2 className="section-heading">Pipeline & Activity</h2>

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Weighted pipeline</div>
              <div className="stat-value">{money(summary.weighted_value)}</div>
              <div className="stat-sub">amount × probability</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Overdue activities</div>
              <div className="stat-value" style={overdue > 0 ? { color: "#B3261E" } : undefined}>{overdue}</div>
              <div className="stat-sub">{summary.activity_load.due_today} due today</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Due next 7 days</div>
              <div className="stat-value">{summary.activity_load.upcoming_7d}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Recent deals value</div>
              <div className="stat-value">{money(summary.recent_deals.reduce((s, d) => s + Number(d.amount || 0), 0))}</div>
              <div className="stat-sub">last {summary.recent_deals.length} deals</div>
            </div>
          </div>

          <div className="dash-columns">
            <div className="dash-panel">
              <div className="panel-title">Pipeline by stage</div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={pipelineData} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                  <XAxis dataKey="stage" tick={tickStyle} axisLine={{ stroke: "#D8D8D8" }} tickLine={false} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={monoTickStyle} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => money(v)} contentStyle={tooltipStyle} cursor={{ fill: "#F3F2F2" }} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={64}>
                    {pipelineData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="dash-panel">
              <div className="panel-title">Win rate</div>
              <WinRateGauge pct={summary.win_rate.win_rate_pct} />
              <div className="empty-block" style={{ textAlign: "center", padding: 0 }}>
                {summary.win_rate.won} won / {summary.win_rate.lost} lost
              </div>
            </div>
          </div>

          <div className="dash-columns" style={{ marginTop: 16 }}>
            <div className="dash-panel">
              <div className="panel-title">Cumulative sales — last 30 days</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={cumulativeData}>
                  <defs>
                    <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0B5CAB" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#0B5CAB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                  <XAxis dataKey="day" tick={tickStyle} axisLine={{ stroke: "#D8D8D8" }} tickLine={false} interval={4} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={monoTickStyle} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => money(v)} contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="cumulative" stroke="#0B5CAB" strokeWidth={2} fill="url(#cumFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="dash-panel">
              <div className="panel-title">SDR activity — calls vs meetings</div>
              {activityByRep.length === 0 ? (
                <div className="empty-block">No activity logged yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={activityByRep} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                    <XAxis dataKey="rep" tick={tickStyle} axisLine={{ stroke: "#D8D8D8" }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={monoTickStyle} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F3F2F2" }} />
                    <Legend wrapperStyle={{ fontSize: 11.5, fontFamily: "IBM Plex Sans" }} />
                    <Bar dataKey="calls" name="Calls" fill="#0B5CAB" radius={[3, 3, 0, 0]} maxBarSize={48} />
                    <Bar dataKey="meetings" name="Meetings" fill="#5E7CE2" radius={[3, 3, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="dash-columns" style={{ marginTop: 16 }}>
            <div className="dash-panel">
              <div className="panel-title">Recent deals</div>
              {summary.recent_deals.length === 0 ? (
                <div className="empty-block">No deals yet.</div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Deal</th><th>Account</th><th>Amount</th></tr></thead>
                  <tbody>
                    {summary.recent_deals.map((d) => (
                      <tr key={d.opportunity_id} onClick={() => navigate(`/opportunities/${d.opportunity_id}`)}>
                        <td>{d.name}</td><td>{d.account_name}</td><td>{money(d.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="dash-panel">
              <div className="panel-title">Deals closed this month — by rep</div>
              {summary.rep_leaderboard.length === 0 ? (
                <div className="empty-block">No deals closed this month yet.</div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Rep</th><th>Deals</th><th>Value</th></tr></thead>
                  <tbody>
                    {summary.rep_leaderboard.map((r) => (
                      <tr key={r.owner_id}>
                        <td>{r.first_name} {r.last_name}</td><td>{r.deals}</td><td>{money(r.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="dash-panel" style={{ marginTop: 16 }}>
            <div className="panel-title">Leads by status & source</div>
            <div className="dash-columns" style={{ marginTop: 0 }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={leadsStatusData} dataKey="value" nameKey="name" outerRadius={75} label={{ fontSize: 11, fontFamily: "IBM Plex Sans" }}>
                    {leadsStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11.5, fontFamily: "IBM Plex Sans" }} />
                </PieChart>
              </ResponsiveContainer>
              {leadsSourceData.length === 0 ? (
                <div className="empty-block">No lead source data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={leadsSourceData} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEEEEE" />
                    <XAxis type="number" allowDecimals={false} tick={monoTickStyle} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="lead_source" width={90} tick={tickStyle} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F3F2F2" }} />
                    <Bar dataKey="count" fill="#0B5CAB" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}