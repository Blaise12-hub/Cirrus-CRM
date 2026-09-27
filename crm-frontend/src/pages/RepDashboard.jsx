import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  Box, Card, CardContent, Typography, Alert,
  Table, TableHead, TableBody, TableRow, TableCell,
  TextField, InputAdornment, Button, IconButton,
} from "@mui/material";
import { Search, ChevronDown, Plus, RotateCw } from "lucide-react";
import { opportunitiesApi, leadsApi, contactsApi, dashboardApi } from "../api/resources";
import { money } from "../components/Shared";
import { useAuth } from "../context/AuthContext";
import { DetailSkeleton } from "../components/Skeleton";
import {
  STAGE_COLORS, STAGE_LABELS, LEAD_STATUS_COLORS,
  tickStyle, tooltipStyle, WinRateGauge,
} from "./dashboardShared";
import QuickStartCards from "../components/QuickStartCards";

// Plain CSS Grid via sx, not MUI's <Grid> component — sidesteps the
// item/xs/sm/md vs size={} API split between MUI v5 and v6+.
const statGridSx = { display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 1.75, mb: 3 };
const threeColGridSx = { display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr 1fr" }, gap: 2, mb: 2 };
const twoColGridSx = { display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 };

const LEAD_STATUS_LABELS = {
  new: "New", contacted: "Contacted", nurturing: "Nurturing",
  qualified: "Qualified", unqualified: "Unqualified",
  converted: "Converted", disqualified: "Disqualified",
};

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

// Compact panel header matching the Salesforce "My Leads [New] [▾]" row
function PanelHeader({ title, onRefresh }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25, flexWrap: "wrap" }}>
      <TextField
        size="small"
        value={title}
        InputProps={{
          readOnly: true,
          endAdornment: <InputAdornment position="end"><Search size={13} /></InputAdornment>,
        }}
        sx={{ flex: 1, minWidth: 120, "& .MuiInputBase-input": { fontSize: 12.5, fontWeight: 600, py: "5px" } }}
      />
      <Button
        size="small"
        variant="outlined"
        sx={{ fontSize: 11.5, py: "4px", px: 1.25, minWidth: 0 }}
      >
        New
      </Button>
      <IconButton size="small" sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
        <ChevronDown size={14} />
      </IconButton>
    </Box>
  );
}

export default function RepDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [opps, leadList, contactList, summaryData] = await Promise.all([
          opportunitiesApi.list(), leadsApi.list(), contactsApi.list(), dashboardApi.summary(),
        ]);
        if (cancelled) return;
        setOpportunities(opps);
        setLeads(leadList);
        setContacts(contactList);
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

  // ── Leads by status — horizontal bar chart data ──────────────
  const leadStatusOrder = ["new", "contacted", "nurturing", "qualified", "unqualified"];
  const leadChartData = leadStatusOrder
    .map((status) => ({
      label: LEAD_STATUS_LABELS[status] || status,
      count: leads.filter((l) => l.status === status).length,
      fill: LEAD_STATUS_COLORS[status] || "#1160B7",
    }))
    .filter((d) => d.count > 0);

  // ── Opportunities by stage — horizontal bar chart data ────────
  const oppStageOrder = ["prospecting", "qualification", "proposal", "negotiation", "won", "lost"];
  const oppChartData = oppStageOrder
    .map((stage) => ({
      label: STAGE_LABELS[stage] || stage,
      count: opportunities.filter((o) => o.stage === stage).length,
      fill: STAGE_COLORS[stage] || "#1160B7",
    }))
    .filter((d) => d.count > 0);

  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const todayLabel = `As of Today at ${now}`;

  return (
    <Box className="view">
      <QuickStartCards />

      {/* ── Stat cards ──────────────────────────────────────────── */}
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

      {/* ── Three chart panels matching Salesforce layout ─────── */}
      <Box sx={threeColGridSx}>

        {/* My Leads — horizontal bar by status */}
        <Card>
          <CardContent sx={{ pb: "12px !important" }}>
            <PanelHeader title="My Leads" />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5, fontWeight: 600 }}>
              Record Count
            </Typography>
            {leadChartData.length === 0 ? (
              <Typography variant="caption" color="text.secondary">No leads yet.</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={leadChartData.length * 36 + 20}>
                <BarChart data={leadChartData} layout="vertical" barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEEEEE" />
                  <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis
                    type="category" dataKey="label" width={80}
                    tick={{ ...tickStyle, textAnchor: "end" }} axisLine={false} tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="count" name="Count" radius={[0, 3, 3, 0]} maxBarSize={18}>
                    {leadChartData.map((entry, i) => <Cell key={i} fill="#1160B7" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
              <Typography
                component="button"
                onClick={() => navigate("/leads")}
                sx={{ fontSize: 12, color: "primary.main", fontWeight: 600, background: "none", border: "none", cursor: "pointer", p: 0 }}
              >
                View Report
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">{todayLabel}</Typography>
                <RotateCw size={11} color="#6B6B6B" />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* My Opportunities — horizontal bar by stage */}
        <Card>
          <CardContent sx={{ pb: "12px !important" }}>
            <PanelHeader title="My Opportunities" />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5, fontWeight: 600 }}>
              Record Count
            </Typography>
            {oppChartData.length === 0 ? (
              <Typography variant="caption" color="text.secondary">No opportunities yet.</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={oppChartData.length * 36 + 20}>
                <BarChart data={oppChartData} layout="vertical" barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEEEEE" />
                  <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis
                    type="category" dataKey="label" width={80}
                    tick={{ ...tickStyle, textAnchor: "end" }} axisLine={false} tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="count" name="Count" radius={[0, 3, 3, 0]} maxBarSize={18}>
                    {oppChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
              <Typography
                component="button"
                onClick={() => navigate("/pipeline")}
                sx={{ fontSize: 12, color: "primary.main", fontWeight: 600, background: "none", border: "none", cursor: "pointer", p: 0 }}
              >
                View Report
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">{todayLabel}</Typography>
                <RotateCw size={11} color="#6B6B6B" />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* My Contacts — quick-view table */}
        <Card>
          <CardContent sx={{ pb: "12px !important", px: 1.5 }}>
            <PanelHeader title="My Contacts" />
            <Table size="small" sx={{ "& .MuiTableCell-root": { px: 1, py: 0.75, fontSize: 12.5 } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: 11.5 }}>First Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: 11.5 }}>Last Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: 11.5 }}>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="caption" color="text.secondary">No contacts yet.</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {contacts.slice(0, 7).map((c) => (
                  <TableRow
                    key={c.contact_id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/contacts/${c.contact_id}`)}
                  >
                    <TableCell sx={{ color: "primary.main", fontWeight: 600 }}>{c.first_name}</TableCell>
                    <TableCell sx={{ color: "primary.main", fontWeight: 600 }}>{c.last_name}</TableCell>
                    <TableCell sx={{ color: "text.secondary", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.email}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
              <Typography
                component="button"
                onClick={() => navigate("/contacts")}
                sx={{ fontSize: 12, color: "primary.main", fontWeight: 600, background: "none", border: "none", cursor: "pointer", p: 0 }}
              >
                View Report
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">{todayLabel}</Typography>
                <RotateCw size={11} color="#6B6B6B" />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* ── Win rate gauge ───────────────────────────────────────── */}
      {summary && (
        <Box sx={twoColGridSx}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>My pipeline by stage</Typography>
              {summary.pipeline.filter((p) => p.count > 0).length === 0 ? (
                <Typography variant="caption" color="text.secondary">No open deals to chart yet.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={summary.pipeline.filter((p) => p.count > 0).map((p) => ({
                      stage: STAGE_LABELS[p.stage], amount: p.total_amount, fill: STAGE_COLORS[p.stage],
                    }))}
                    barCategoryGap="35%"
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                    <XAxis dataKey="stage" tick={tickStyle} axisLine={{ stroke: "#D8D8D8" }} tickLine={false} />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ ...tickStyle, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => money(v)} contentStyle={tooltipStyle} cursor={{ fill: "#F3F2F2" }} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={64}>
                      {summary.pipeline.filter((p) => p.count > 0).map((entry, i) => <Cell key={i} fill={STAGE_COLORS[entry.stage]} />)}
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
