import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Box, Card, CardContent, Typography, Alert } from "@mui/material";
import { opportunitiesApi, leadsApi, dashboardApi } from "../api/resources";
import { money } from "../components/Shared";
import { useAuth } from "../context/AuthContext";
import { DetailSkeleton } from "../components/Skeleton";
import { STAGE_COLORS, STAGE_LABELS, tickStyle, monoTickStyle, tooltipStyle, WinRateGauge } from "./dashboardShared";

// Plain CSS Grid via sx, not MUI's <Grid> component — sidesteps the
// item/xs/sm/md vs size={} API split between MUI v5 and v6+. Works
// identically regardless of which version actually got installed.
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
  if (error) return <Box className="view"><Alert severity="error">{error}</Alert></Box>;

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
    <Box className="view">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>Good morning, {user?.first_name || ""}</Typography>

      <Box sx={statGridSx}>
        <StatCard label="My open pipeline" value={money(openTotal)} sub={`${open.length} open deals`} />
        <StatCard label="Won this period" value={money(wonTotal)} color="success.main" />
        <StatCard
          label="Overdue activities"
          value={overdue}
          sub={`${summary?.activity_load.due_today ?? 0} due today`}
          color={overdue > 0 ? "error.main" : undefined}
        />
        <StatCard label="New leads" value={newLeads.length} />
      </Box>

      {overdueDeals && overdueDeals.count > 0 && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          <strong>{overdueDeals.count}</strong> of my open deal{overdueDeals.count !== 1 ? "s" : ""} past close date
          {" — "}
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{money(overdueDeals.total_amount)}</span>
        </Alert>
      )}

      <Box sx={twoColGridSx}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>My deals closing soon</Typography>
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
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>My new leads</Typography>
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
        <Box sx={{ ...twoColGridSx, mt: 0.5 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>My pipeline by stage</Typography>
              {pipelineData.length === 0 ? (
                <Typography variant="caption" color="text.secondary">No open deals to chart yet.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
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
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>My win rate</Typography>
              <WinRateGauge pct={summary.win_rate.win_rate_pct} />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
                {summary.win_rate.won} won / {summary.win_rate.lost} lost
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}