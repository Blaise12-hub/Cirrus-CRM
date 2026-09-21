import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import {
  Box, Card, CardContent, Typography, Alert,
  Table, TableHead, TableBody, TableRow, TableCell,
} from "@mui/material";
import { opportunitiesApi, leadsApi, dashboardApi } from "../api/resources";
import { money } from "../components/Shared";
import { useAuth } from "../context/AuthContext";
import { DetailSkeleton } from "../components/Skeleton";
import { STAGE_COLORS, STAGE_LABELS, LEAD_STATUS_COLORS, tickStyle, monoTickStyle, tooltipStyle, WinRateGauge } from "./dashboardShared";

// Plain CSS Grid via sx — see RepDashboard.jsx for why (MUI Grid v5 vs v6+ API split).
const statGridSx = { display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 1.75, mb: 3 };
const twoColGridSx = { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 };

function StatCard({ label, value, sub, color }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }} color="text.secondary">
          {label}
        </Typography>
        <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 24, fontWeight: 600, mt: 0.5, color }}>
          {value}
        </Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </CardContent>
    </Card>
  );
}

function MiniRow({ onClick, primary, secondary }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        p: 1, fontSize: 13, cursor: "pointer", borderRadius: 1,
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      {primary}
      {secondary}
    </Box>
  );
}

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
  if (error) return <Box className="view"><Alert severity="error">{error}</Alert></Box>;

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
    <Box className="view">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>Good morning, {user?.first_name || ""}</Typography>

      <Box sx={statGridSx}>
        <StatCard label="Open pipeline" value={money(openTotal)} sub={`${open.length} open deals`} />
        <StatCard label="Won this period" value={money(wonTotal)} color="success.main" />
        <StatCard label="Total deals" value={opportunities.length} />
        <StatCard label="New leads" value={newLeads.length} />
      </Box>

      {overdueDeals && overdueDeals.count > 0 && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          <strong>{overdueDeals.count}</strong> open deal{overdueDeals.count !== 1 ? "s" : ""} past their close date
          {" — "}
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{money(overdueDeals.total_amount)} at stake</span>
        </Alert>
      )}

      <Box sx={twoColGridSx}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Deals closing soon</Typography>
            {open.length === 0 && <Typography variant="caption" color="text.secondary">No open deals.</Typography>}
            {open.slice(0, 6).map((o) => (
              <MiniRow
                key={o.opportunity_id}
                onClick={() => navigate(`/opportunities/${o.opportunity_id}`)}
                primary={<span>{o.name}</span>}
                secondary={<span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 12.5 }}>{money(o.amount)}</span>}
              />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>New leads</Typography>
            {newLeads.length === 0 && <Typography variant="caption" color="text.secondary">No new leads.</Typography>}
            {newLeads.slice(0, 6).map((l) => (
              <MiniRow
                key={l.lead_id}
                onClick={() => navigate("/leads")}
                primary={<span>{l.first_name} {l.last_name}</span>}
                secondary={<Typography variant="caption" color="text.secondary">{l.company_name}</Typography>}
              />
            ))}
          </CardContent>
        </Card>
      </Box>

      {summary && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3.5, mb: 1.75 }}>Pipeline & Activity</Typography>

          <Box sx={statGridSx}>
            <StatCard label="Weighted pipeline" value={money(summary.weighted_value)} sub="amount × probability" />
            <StatCard
              label="Overdue activities" value={overdue}
              sub={`${summary.activity_load.due_today} due today`}
              color={overdue > 0 ? "error.main" : undefined}
            />
            <StatCard label="Due next 7 days" value={summary.activity_load.upcoming_7d} />
            <StatCard
              label="Recent deals value"
              value={money(summary.recent_deals.reduce((s, d) => s + Number(d.amount || 0), 0))}
              sub={`last ${summary.recent_deals.length} deals`}
            />
          </Box>

          <Box sx={twoColGridSx}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Pipeline by stage</Typography>
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
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Win rate</Typography>
                <WinRateGauge pct={summary.win_rate.win_rate_pct} />
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
                  {summary.win_rate.won} won / {summary.win_rate.lost} lost
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ ...twoColGridSx, mt: 0.25 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Cumulative sales — last 30 days</Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={cumulativeData}>
                    <defs>
                      <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1160B7" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#1160B7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                    <XAxis dataKey="day" tick={tickStyle} axisLine={{ stroke: "#D8D8D8" }} tickLine={false} interval={4} />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={monoTickStyle} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => money(v)} contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="cumulative" stroke="#1160B7" strokeWidth={2} fill="url(#cumFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>SDR activity — calls vs meetings</Typography>
                {activityByRep.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">No activity logged yet.</Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={activityByRep} barCategoryGap="35%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                      <XAxis dataKey="rep" tick={tickStyle} axisLine={{ stroke: "#D8D8D8" }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={monoTickStyle} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F3F2F2" }} />
                      <Legend wrapperStyle={{ fontSize: 11.5, fontFamily: "IBM Plex Sans" }} />
                      <Bar dataKey="calls" name="Calls" fill="#1160B7" radius={[3, 3, 0, 0]} maxBarSize={48} />
                      <Bar dataKey="meetings" name="Meetings" fill="#5E7CE2" radius={[3, 3, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ ...twoColGridSx, mt: 0.25 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Recent deals</Typography>
                {summary.recent_deals.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">No deals yet.</Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow><TableCell>Deal</TableCell><TableCell>Account</TableCell><TableCell>Amount</TableCell></TableRow>
                    </TableHead>
                    <TableBody>
                      {summary.recent_deals.map((d) => (
                        <TableRow key={d.opportunity_id} hover onClick={() => navigate(`/opportunities/${d.opportunity_id}`)} sx={{ cursor: "pointer" }}>
                          <TableCell>{d.name}</TableCell>
                          <TableCell>{d.account_name}</TableCell>
                          <TableCell>{money(d.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Deals closed this month — by rep</Typography>
                {summary.rep_leaderboard.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">No deals closed this month yet.</Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow><TableCell>Rep</TableCell><TableCell>Deals</TableCell><TableCell>Value</TableCell></TableRow>
                    </TableHead>
                    <TableBody>
                      {summary.rep_leaderboard.map((r) => (
                        <TableRow key={r.owner_id}>
                          <TableCell>{r.first_name} {r.last_name}</TableCell>
                          <TableCell>{r.deals}</TableCell>
                          <TableCell>{money(r.total_amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Box>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Leads by status & source</Typography>
              <Box sx={twoColGridSx}>
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
                  <Typography variant="caption" color="text.secondary">No lead source data yet.</Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={leadsSourceData} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEEEEE" />
                      <XAxis type="number" allowDecimals={false} tick={monoTickStyle} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="lead_source" width={90} tick={tickStyle} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F3F2F2" }} />
                      <Bar dataKey="count" fill="#1160B7" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}