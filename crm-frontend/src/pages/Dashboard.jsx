import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { opportunitiesApi, leadsApi, dashboardApi } from "../api/resources";
import { money } from "../components/Shared";
import { useAuth } from "../context/AuthContext";
import { DetailSkeleton } from "../components/Skeleton";

// Same accent colors OpportunityDetail.jsx uses for its stage buttons —
// reused here so "Won" means the same color on the pipeline chart as it
// does on the opportunity detail page, instead of a separate palette.
const STAGE_COLORS = {
  prospecting: "#8A8D91",
  qualification: "#5E7CE2",
  proposal: "#0B5CAB",
  negotiation: "#B25E09",
  won: "#2E7D46",
  lost: "#B3261E",
};
const STAGE_LABELS = {
  prospecting: "Prospecting",
  qualification: "Qualification",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};
const LEAD_STATUS_COLORS = {
  new: "#5E7CE2",
  contacted: "#0B5CAB",
  qualified: "#B25E09",
  converted: "#2E7D46",
  disqualified: "#B3261E",
};

const tickStyle = { fontSize: 11.5, fontFamily: "IBM Plex Sans", fill: "#6B6B6B" };
const tooltipStyle = {
  fontFamily: "IBM Plex Sans", fontSize: 12.5, border: "1px solid #D8D8D8",
  borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

export default function Dashboard() {
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
          opportunitiesApi.list(),
          leadsApi.list(),
          dashboardApi.summary(),
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

  const pipelineData = summary
    ? summary.pipeline.map((p) => ({ stage: STAGE_LABELS[p.stage], amount: p.total_amount, fill: STAGE_COLORS[p.stage] }))
    : [];
  const leadsStatusData = summary
    ? summary.leads_by_status.map((s) => ({ name: s.status, value: s.count, fill: LEAD_STATUS_COLORS[s.status] || "#8A8D91" }))
    : [];
  const leadsSourceData = summary ? summary.leads_by_source : [];
  const overdue = summary?.activity_load.overdue ?? 0;

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
              <div className="stat-label">Win rate</div>
              <div className="stat-value">{summary.win_rate.win_rate_pct !== null ? `${summary.win_rate.win_rate_pct}%` : "—"}</div>
              <div className="stat-sub">{summary.win_rate.won} won / {summary.win_rate.lost} lost</div>
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
          </div>

          <div className="dash-columns">
            <div className="dash-panel">
              <div className="panel-title">Pipeline by stage</div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                  <XAxis dataKey="stage" tick={tickStyle} axisLine={{ stroke: "#D8D8D8" }} tickLine={false} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ ...tickStyle, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => money(v)} contentStyle={tooltipStyle} cursor={{ fill: "#F3F2F2" }} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {pipelineData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="dash-panel">
              <div className="panel-title">Leads by status</div>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={leadsStatusData} dataKey="value" nameKey="name" outerRadius={80} label={{ fontSize: 11, fontFamily: "IBM Plex Sans" }}>
                    {leadsStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11.5, fontFamily: "IBM Plex Sans" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="dash-panel">
              <div className="panel-title">Leads by source</div>
              {leadsSourceData.length === 0 ? (
                <div className="empty-block">No lead source data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={leadsSourceData} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEEEEE" />
                    <XAxis type="number" allowDecimals={false} tick={{ ...tickStyle, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
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
