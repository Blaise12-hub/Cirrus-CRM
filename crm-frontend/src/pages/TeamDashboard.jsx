import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import {
  Box, Card, CardContent, Typography, Alert, Table, TableHead, TableBody, TableRow, TableCell,
} from "@mui/material";
import { opportunitiesApi, leadsApi, dashboardApi } from "../api/resources";
import { money } from "../components/Shared";
import { useAuth } from "../context/AuthContext";
import { DetailSkeleton } from "../components/Skeleton";
import AnimatedCounter from "../components/AnimatedCounter";
import {
  STAGE_COLORS, STAGE_LABELS, LEAD_STATUS_COLORS, STAT_ACCENTS,
  useChartStyles, compactMoney, DashboardGreeting, WinRateGauge,
} from "./DashboardShared";
import QuickStartCards from "../components/QuickStartCards";
import { MyTasksWidget } from "../components/Activity";

// Plain CSS Grid via sx — see RepDashboard.jsx for why (MUI Grid v5 vs v6+ API split).
const statGridSx = { display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 1.75, mb: 3 };
const threeColGridSx = { display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr 1fr" }, gap: 2 };
const twoColGridSx = { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 };

function StatCard({ label, value, sub, color, accentFrom, accentTo }) {
  return (
    <Card
      className="stat-card-accent"
      style={{
        "--accent-from": accentFrom || "var(--color-primary)",
        "--accent-to": accentTo || "var(--color-accent)",
      }}
    >
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
  const cs = useChartStyles();
  const A = STAT_ACCENTS;
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
  if (error) return <Box className="view"><Alert severity="error">{error}</Alert></Box>;

  const open = opportunities.filter((o) => o.stage !== "won" && o.stage !== "lost");
  const openTotal = open.reduce((s, o) => s + Number(o.amount), 0);
  const wonTotal = opportunities.filter((o) => o.stage === "won").reduce((s, o) => s + Number(o.amount), 0);
  const newLeads = leads.filter((l) => l.status === "new");

  const pipelineData = summary
    ? summary.pipeline.map((p) => ({ stage: STAGE_LABELS[p.stage], amount: p.total_amount, fill: STAGE_COLORS[p.stage] }))
    : [];
  const leadsStatusData = summary
    ? summary.leads_by_status.map((s) => ({ name: s.status, value: s.count, fill: LEAD_STATUS_COLORS[s.status] || STAGE_COLORS.prospecting }))
    : [];
  const leadsSourceData = summary ? summary.leads_by_source : [];
  const overdue = summary?.activity_load.overdue ?? 0;
  const cumulativeData = summary
    ? summary.cumulative_sales.map((d) => ({
        day: new Date(d.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        cumulative: d.cumulative,
      }))
    : [];
  const activityByRep = summary
    ? summary.activity_by_rep.map((r) => ({ rep: `${r.first_name} ${r.last_name}`, calls: r.calls, meetings: r.meetings }))
    : [];
  const overdueDeals = summary?.overdue_deals;

  return (
    <Box className="view fade-in-up">
      <DashboardGreeting name={user?.first_name} />

      <QuickStartCards />

      <Box sx={statGridSx}>
        <StatCard
          label="Open pipeline"
          value={<AnimatedCounter value={openTotal} format="money" />}
          sub={`${open.length} open deals`}
          accentFrom={A.brand[0]} accentTo={A.brand[1]}
        />
        <StatCard
          label="Won this period"
          value={<AnimatedCounter value={wonTotal} format="money" />}
          color="success.main"
          accentFrom={A.success[0]} accentTo={A.success[1]}
        />
        <StatCard
          label="Total deals"
          value={<AnimatedCounter value={opportunities.length} />}
          accentFrom={A.neutral[0]} accentTo={A.neutral[1]}
        />
        <StatCard
          label="New leads"
          value={<AnimatedCounter value={newLeads.length} />}
          accentFrom={A.info[0]} accentTo={A.info[1]}
        />
      </Box>

      {overdueDeals && overdueDeals.count > 0 && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          <strong>{overdueDeals.count}</strong> open deal{overdueDeals.count !== 1 ? "s" : ""} past their close date
          {" — "}
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{money(overdueDeals.total_amount)} at stake</span>
        </Alert>
      )}

      <Box sx={threeColGridSx}>
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
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Today's priorities</Typography>
            <MyTasksWidget />
          </CardContent>
        </Card>
      </Box>

      {summary && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3.5, mb: 1.75 }}>Pipeline & Activity</Typography>
          <Box sx={statGridSx}>
            <StatCard
              label="Weighted pipeline"
              value={<AnimatedCounter value={summary.weighted_value} format="money" />}
              sub="amount × probability"
              accentFrom={A.brand[0]} accentTo={A.brand[1]}
            />
            <StatCard
              label="Overdue activities"
              value={<AnimatedCounter value={overdue} />}
              sub={`${summary.activity_load.due_today} due today`}
              color={overdue > 0 ? "error.main" : undefined}
              accentFrom={overdue > 0 ? A.danger[0] : A.neutral[0]}
              accentTo={overdue > 0 ? A.danger[1] : A.neutral[1]}
            />
            <StatCard
              label="Due next 7 days"
              value={<AnimatedCounter value={summary.activity_load.upcoming_7d} />}
              accentFrom={A.warning[0]} accentTo={A.warning[1]}
            />
            <StatCard
              label="Recent deals value"
              value={<AnimatedCounter value={summary.recent_deals.reduce((s, d) => s + Number(d.amount || 0), 0)} format="money" />}
              sub={`last ${summary.recent_deals.length} deals`}
              accentFrom={A.info[0]} accentTo={A.info[1]}
            />
          </Box>

          <Box sx={twoColGridSx}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Pipeline by stage</Typography>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={pipelineData} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={cs.gridStroke} />
                    <XAxis dataKey="stage" tick={cs.tickStyle} axisLine={{ stroke: cs.axisStroke }} tickLine={false} />
                    <YAxis tickFormatter={compactMoney} allowDecimals={false} tick={cs.monoTickStyle} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => money(v)} contentStyle={cs.tooltipStyle} cursor={{ fill: cs.cursorFill }} />
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
                        <stop offset="0%" stopColor={cs.brandFill} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={cs.brandFill} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={cs.gridStroke} />
                    <XAxis dataKey="day" tick={cs.tickStyle} axisLine={{ stroke: cs.axisStroke }} tickLine={false} interval={4} />
                    <YAxis tickFormatter={compactMoney} allowDecimals={false} tick={cs.monoTickStyle} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => money(v)} contentStyle={cs.tooltipStyle} />
                    <Area type="monotone" dataKey="cumulative" stroke={cs.brandFill} strokeWidth={2} fill="url(#cumFill)" />
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
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={cs.gridStroke} />
                      <XAxis dataKey="rep" tick={cs.tickStyle} axisLine={{ stroke: cs.axisStroke }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={cs.monoTickStyle} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={cs.tooltipStyle} cursor={{ fill: cs.cursorFill }} />
                      <Legend wrapperStyle={{ fontSize: 11.5, fontFamily: "IBM Plex Sans" }} />
                      <Bar dataKey="calls" name="Calls" fill={cs.brandFill} radius={[3, 3, 0, 0]} maxBarSize={48} />
                      <Bar dataKey="meetings" name="Meetings" fill={cs.forecastWeighted} radius={[3, 3, 0, 0]} maxBarSize={48} />
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
                    <Pie data={leadsStatusData} dataKey="value" nameKey="name" outerRadius={75} label={{ fontSize: 11, fontFamily: "IBM Plex Sans", fill: cs.tickStyle.fill }}>
                      {leadsStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={cs.tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11.5, fontFamily: "IBM Plex Sans" }} />
                  </PieChart>
                </ResponsiveContainer>
                {leadsSourceData.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">No lead source data yet.</Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={leadsSourceData} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={cs.gridStroke} />
                      <XAxis type="number" allowDecimals={false} tick={cs.monoTickStyle} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="lead_source" width={90} tick={cs.tickStyle} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={cs.tooltipStyle} cursor={{ fill: cs.cursorFill }} />
                      <Bar dataKey="count" fill={cs.brandFill} radius={[0, 4, 4, 0]} />
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