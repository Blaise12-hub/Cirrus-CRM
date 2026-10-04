import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, InputAdornment, Card, CardContent,
  Alert, Button, Chip, IconButton, Tooltip, Menu, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell, Paper,
  LinearProgress
} from "@mui/material";
import {
  Search, Plus, LayoutGrid, List, ArrowRight,
  CheckCircle, XCircle, MoreVertical, Calendar,
  Building2, TrendingUp, DollarSign, Filter, SlidersHorizontal,
  ChevronRight, GripVertical
} from "lucide-react";
import { opportunitiesApi, accountsApi } from "../api/resources";
import { money, shortDate } from "../components/Shared";
import { KanbanSkeleton } from "../components/Skeleton";
import { Modal, ModalActions, FieldRow } from "../components/Modal";
import { useNotifications } from "../context/NotificationsContext";
import { useSnackbar } from "../context/SnackbarContext";
import AnimatedCounter from "../components/AnimatedCounter";

const STAGES = [
  { key: "prospecting", label: "Prospecting", accent: "#8A8D91", prob: 10 },
  { key: "qualification", label: "Qualification", accent: "#5E7CE2", prob: 25 },
  { key: "proposal", label: "Proposal", accent: "#1160B7", prob: 50 },
  { key: "negotiation", label: "Negotiation", accent: "#B25E09", prob: 75 },
  { key: "won", label: "Closed Won", accent: "#2E7D46", prob: 100 },
  { key: "lost", label: "Closed Lost", accent: "#B3261E", prob: 0 },
];

function NewDealModal({ onClose, onCreated, defaultStage = "prospecting" }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState(defaultStage);
  const [closeDate, setCloseDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [accountId, setAccountId] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    accountsApi.list().then(setAccounts).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Opportunity name is required.");
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) < 0) {
      setError("Please provide a valid deal amount.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const selectedStageObj = STAGES.find((s) => s.key === stage);
      const payload = {
        name: name.trim(),
        amount: Number(amount),
        stage,
        probability: selectedStageObj ? selectedStageObj.prob : 25,
        close_date: closeDate,
        account_id: accountId ? Number(accountId) : null,
      };
      const created = await opportunitiesApi.create(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create deal.");
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Create New Deal" onClose={onClose} maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Deal Name"
            required
            autoFocus
            placeholder="E.g., Global Enterprise Cloud License"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <FieldRow>
            <TextField
              label="Deal Amount ($)"
              required
              type="number"
              placeholder="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <TextField
              label="Target Close Date"
              type="date"
              required
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </FieldRow>

          <FieldRow>
            <TextField
              select
              label="Pipeline Stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              {STAGES.map((s) => (
                <MenuItem key={s.key} value={s.key}>
                  {s.label} ({s.prob}%)
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Associated Account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              <MenuItem value="">None / Unassigned</MenuItem>
              {accounts.map((acc) => (
                <MenuItem key={acc.account_id} value={acc.account_id}>
                  {acc.name}
                </MenuItem>
              ))}
            </TextField>
          </FieldRow>
        </Box>
        <ModalActions onCancel={onClose} submitLabel="Create Opportunity" submitting={submitting} />
      </form>
    </Modal>
  );
}

export default function Pipeline() {
  const navigate = useNavigate();
  const { syncWithBackend } = useNotifications();
  const { showSnackbar } = useSnackbar();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" or "table"
  const [sortBy, setSortBy] = useState("amount-desc");
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [newDealDefaultStage, setNewDealDefaultStage] = useState("prospecting");

  // Context menu for quick stage transition
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    loadPipeline();
  }, []);

  const loadPipeline = async () => {
    try {
      setLoading(true);
      const data = await opportunitiesApi.list();
      setOpportunities(data);
    } catch (err) {
      setError(err.message || "Failed to load pipeline opportunities.");
    } finally {
      setLoading(false);
    }
  };

  // Pipeline Metrics Calculation
  const metrics = useMemo(() => {
    const openDeals = opportunities.filter((o) => o.stage !== "won" && o.stage !== "lost");
    const openTotal = openDeals.reduce((sum, o) => sum + Number(o.amount || 0), 0);
    const weightedTotal = openDeals.reduce(
      (sum, o) => sum + Number(o.amount || 0) * (Number(o.probability || 0) / 100),
      0
    );
    const wonDeals = opportunities.filter((o) => o.stage === "won");
    const wonTotal = wonDeals.reduce((sum, o) => sum + Number(o.amount || 0), 0);
    const avgDeal = openDeals.length > 0 ? openTotal / openDeals.length : 0;

    return {
      openTotal,
      weightedTotal,
      openCount: openDeals.length,
      wonTotal,
      avgDeal,
    };
  }, [opportunities]);

  // Filtered & Sorted deals
  const filteredAndSorted = useMemo(() => {
    let list = [...opportunities];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          (o.account_name || "").toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === "amount-desc") return Number(b.amount || 0) - Number(a.amount || 0);
      if (sortBy === "amount-asc") return Number(a.amount || 0) - Number(b.amount || 0);
      if (sortBy === "date-asc") {
        if (!a.close_date) return 1;
        if (!b.close_date) return -1;
        return new Date(a.close_date) - new Date(b.close_date);
      }
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [opportunities, query, sortBy]);

  const columns = useMemo(() => {
    const map = {};
    STAGES.forEach((s) => (map[s.key] = []));
    filteredAndSorted.forEach((o) => {
      if (map[o.stage]) {
        map[o.stage].push(o);
      } else {
        map.prospecting.push(o);
      }
    });
    return map;
  }, [filteredAndSorted]);

  const handleStageChange = async (dealId, nextStage) => {
    const current = opportunities.find((o) => o.opportunity_id === dealId);
    if (!current || current.stage === nextStage) return;

    // Optimistic UI update
    setOpportunities((prev) =>
      prev.map((o) => (o.opportunity_id === dealId ? { ...o, stage: nextStage } : o))
    );

    try {
      await opportunitiesApi.updateStage(dealId, nextStage);
      syncWithBackend(); // sync notifications
      const stageName = STAGES.find((s) => s.key === nextStage)?.label || nextStage;
      showSnackbar(`Deal moved to ${stageName}`, "success");
    } catch (err) {
      setOpportunities((prev) =>
        prev.map((o) => (o.opportunity_id === dealId ? { ...o, stage: current.stage } : o))
      );
      setError(`Failed to update stage: ${err.message}`);
      showSnackbar(`Failed to update stage: ${err.message}`, "error");
    }
  };

  const handleDrop = async (stageKey) => {
    const id = draggedId;
    setDraggedId(null);
    setDragOverStage(null);
    if (id == null) return;
    await handleStageChange(id, stageKey);
  };

  const openNewDealInStage = (stageKey) => {
    setNewDealDefaultStage(stageKey);
    setIsNewDealOpen(true);
  };

  const isOverdue = (deal) => {
    if (!deal.close_date || deal.stage === "won" || deal.stage === "lost") return false;
    return new Date(deal.close_date) < new Date();
  };

  const getNextStageKey = (currentStage) => {
    const order = ["prospecting", "qualification", "proposal", "negotiation", "won"];
    const idx = order.indexOf(currentStage);
    if (idx !== -1 && idx < order.length - 1) return order[idx + 1];
    return null;
  };

  if (loading && opportunities.length === 0) {
    return (
      <Box className="view">
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Sales Pipeline</Typography>
        <KanbanSkeleton />
      </Box>
    );
  }

  return (
    <Box className="view fade-in-up">
      {/* ── Top Metric Cards Banner ────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 1.75, mb: 2.5 }}>
        <Card className="stat-card-accent" style={{ "--accent-from": "#1160B7", "--accent-to": "#5E7CE2" }}>
          <CardContent sx={{ p: "16px !important" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }} color="text.secondary">
              Open Pipeline Value
            </Typography>
            <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, mt: 0.5 }}>
              <AnimatedCounter value={metrics.openTotal} format="money" />
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {metrics.openCount} active opportunities
            </Typography>
          </CardContent>
        </Card>

        <Card className="stat-card-accent" style={{ "--accent-from": "#4A9EFF", "--accent-to": "#7AB8FF" }}>
          <CardContent sx={{ p: "16px !important" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }} color="text.secondary">
              Weighted Forecast
            </Typography>
            <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, mt: 0.5, color: "primary.main" }}>
              <AnimatedCounter value={metrics.weightedTotal} format="money" />
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Probability-weighted revenue
            </Typography>
          </CardContent>
        </Card>

        <Card className="stat-card-accent" style={{ "--accent-from": "#2E7D46", "--accent-to": "#4CAF50" }}>
          <CardContent sx={{ p: "16px !important" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }} color="text.secondary">
              Closed Won (YTD)
            </Typography>
            <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, mt: 0.5, color: "success.main" }}>
              <AnimatedCounter value={metrics.wonTotal} format="money" />
            </Typography>
            <Typography variant="caption" color="success.main">
              Revenue booked
            </Typography>
          </CardContent>
        </Card>

        <Card className="stat-card-accent" style={{ "--accent-from": "#8A8D91", "--accent-to": "#B0BEC5" }}>
          <CardContent sx={{ p: "16px !important" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }} color="text.secondary">
              Average Deal Size
            </Typography>
            <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, mt: 0.5, color: "text.primary" }}>
              <AnimatedCounter value={metrics.avgDeal} format="money" />
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Per open opportunity
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* ── Toolbar: Search, Filters, View Modes & Add Deal ──── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search deals or accounts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment>,
            }}
            sx={{ width: { xs: 180, sm: 240 } }}
          />

          <TextField
            select
            size="small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ width: 170 }}
          >
            <MenuItem value="amount-desc">Value: High to Low</MenuItem>
            <MenuItem value="amount-asc">Value: Low to High</MenuItem>
            <MenuItem value="date-asc">Close Date: Soonest</MenuItem>
            <MenuItem value="name-asc">Name: A to Z</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ display: "flex", border: 1, borderColor: "divider", borderRadius: 1.5, p: 0.25, bgcolor: "background.paper" }}>
            <Tooltip title="Kanban Board View">
              <IconButton
                size="small"
                color={viewMode === "kanban" ? "primary" : "default"}
                onClick={() => setViewMode("kanban")}
                sx={{ borderRadius: 1 }}
              >
                <LayoutGrid size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Table List View">
              <IconButton
                size="small"
                color={viewMode === "table" ? "primary" : "default"}
                onClick={() => setViewMode("table")}
                sx={{ borderRadius: 1 }}
              >
                <List size={16} />
              </IconButton>
            </Tooltip>
          </Box>

          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={15} />}
            onClick={() => openNewDealInStage("prospecting")}
            sx={{ fontWeight: 600 }}
          >
            New Deal
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* ── KANBAN BOARD VIEW ──────────────────────────────────── */}
      {viewMode === "kanban" && (
        <Box
          sx={{
            display: "flex",
            gap: 1.75,
            overflowX: "auto",
            pb: 2,
            minHeight: "calc(100vh - 270px)",
            alignItems: "stretch",
          }}
        >
          {STAGES.map((stage) => {
            const list = columns[stage.key] || [];
            const sum = list.reduce((s, o) => s + Number(o.amount || 0), 0);
            const isDragOver = dragOverStage === stage.key;

            return (
              <Box
                key={stage.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStage(stage.key);
                }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={() => handleDrop(stage.key)}
                sx={{
                  flex: "0 0 280px",
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: isDragOver ? "rgba(17, 96, 183, 0.08)" : "action.hover",
                  border: 1,
                  borderColor: isDragOver ? "primary.main" : "divider",
                  transition: "all 0.15s ease",
                }}
              >
                {/* Stage Header */}
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "background.paper",
                    borderTop: 3,
                    borderTopColor: stage.accent,
                    borderBottom: 1,
                    borderColor: "divider",
                    borderRadius: "8px 8px 0 0",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                        {stage.label}
                      </Typography>
                      <Chip
                        label={list.length}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10.5,
                          fontWeight: 700,
                          bgcolor: "action.hover",
                        }}
                      />
                    </Box>

                    <IconButton
                      size="small"
                      title={`Add deal to ${stage.label}`}
                      onClick={() => openNewDealInStage(stage.key)}
                      sx={{ p: 0.25 }}
                    >
                      <Plus size={14} />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 700 }}>
                      {money(sum)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                      {stage.prob}% prob
                    </Typography>
                  </Box>
                </Box>

                {/* Stage Cards Stream */}
                <Box
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.25,
                  }}
                >
                  {list.length === 0 && (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: "center",
                        border: "1px dashed",
                        borderColor: "divider",
                        borderRadius: 1.5,
                        color: "text.secondary",
                        fontSize: 12,
                      }}
                    >
                      No deals in this stage
                    </Box>
                  )}

                  {list.map((deal) => {
                    const overdue = isOverdue(deal);
                    const nextStageKey = getNextStageKey(deal.stage);

                    return (
                      <Card
                        key={deal.opportunity_id}
                        draggable
                        onDragStart={(e) => {
                          setDraggedId(deal.opportunity_id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        sx={{
                          cursor: "grab",
                          opacity: draggedId === deal.opportunity_id ? 0.35 : 1,
                          transition: "box-shadow 0.15s ease, transform 0.15s ease",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: "12px 14px !important" }}>
                          {/* Account header */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                              <Building2 size={12} color="#6B6B6B" style={{ flexShrink: 0 }} />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontWeight: 600,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontSize: 11.5,
                                }}
                              >
                                {deal.account_name || "Independent Account"}
                              </Typography>
                            </Box>

                            <GripVertical size={13} color="#C4C4C4" />
                          </Box>

                          {/* Deal Name */}
                          <Typography
                            onClick={() => navigate(`/opportunities/${deal.opportunity_id}`)}
                            sx={{
                              fontSize: 13.5,
                              fontWeight: 700,
                              lineHeight: 1.3,
                              color: "text.primary",
                              cursor: "pointer",
                              mb: 1,
                              "&:hover": { color: "primary.main" },
                            }}
                          >
                            {deal.name}
                          </Typography>

                          {/* Amount */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1 }}>
                            <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 700 }}>
                              {money(deal.amount)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              {deal.probability}%
                            </Typography>
                          </Box>

                          {/* Probability Bar */}
                          <LinearProgress
                            variant="determinate"
                            value={Number(deal.probability || 0)}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              mb: 1.25,
                              bgcolor: "action.hover",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: stage.accent,
                              },
                            }}
                          />

                          {/* Footer: Date & Quick Actions */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 0.5, borderTop: 1, borderColor: "divider" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Calendar size={11} color="#6B6B6B" />
                              <Typography
                                sx={{
                                  fontSize: 11,
                                  fontFamily: "'IBM Plex Mono', monospace",
                                  color: overdue ? "error.main" : "text.secondary",
                                  fontWeight: overdue ? 700 : 500,
                                }}
                              >
                                {shortDate(deal.close_date)}
                              </Typography>
                              {overdue && (
                                <Chip
                                  label="Past Due"
                                  size="small"
                                  color="error"
                                  sx={{ height: 16, fontSize: 9.5, fontWeight: 700 }}
                                />
                              )}
                            </Box>

                            {/* Quick Advance Button */}
                            {nextStageKey && (
                              <Tooltip title={`Advance to ${STAGES.find((s) => s.key === nextStageKey)?.label}`}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStageChange(deal.opportunity_id, nextStageKey);
                                  }}
                                  sx={{ p: 0.5, color: "primary.main" }}
                                >
                                  <ArrowRight size={13} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* ── TABLE LIST VIEW ────────────────────────────────────── */}
      {viewMode === "table" && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Opportunity Name</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>Probability</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Target Close Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                    No opportunities match your search filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSorted.map((deal) => {
                  const stageObj = STAGES.find((s) => s.key === deal.stage) || STAGES[0];
                  const overdue = isOverdue(deal);
                  const nextStageKey = getNextStageKey(deal.stage);

                  return (
                    <TableRow
                      key={deal.opportunity_id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/opportunities/${deal.opportunity_id}`)}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>
                        {deal.name}
                      </TableCell>
                      <TableCell>{deal.account_name || "—"}</TableCell>
                      <TableCell>
                        <Chip
                          label={stageObj.label}
                          size="small"
                          sx={{
                            bgcolor: `${stageObj.accent}18`,
                            color: stageObj.accent,
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {deal.probability}%
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>
                        {money(deal.amount)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{shortDate(deal.close_date)}</span>
                          {overdue && <Chip label="Past Due" size="small" color="error" sx={{ height: 16, fontSize: 9.5 }} />}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {nextStageKey && (
                          <Button
                            size="small"
                            variant="outlined"
                            endIcon={<ArrowRight size={12} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStageChange(deal.opportunity_id, nextStageKey);
                            }}
                            sx={{ fontSize: 11, py: 0.25 }}
                          >
                            Advance
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── New Deal Modal ────────────────────────────────────── */}
      {isNewDealOpen && (
        <NewDealModal
          onClose={() => setIsNewDealOpen(false)}
          defaultStage={newDealDefaultStage}
          onCreated={(created) => {
            setOpportunities((prev) => [created, ...prev]);
            syncWithBackend();
            showSnackbar(`"${created.name}" created successfully`, "success");
          }}
        />
      )}
    </Box>
  );
}

// Small helper import for TableContainer
function TableContainer({ component: Component = "div", children, ...props }) {
  return <Component {...props}>{children}</Component>;
}