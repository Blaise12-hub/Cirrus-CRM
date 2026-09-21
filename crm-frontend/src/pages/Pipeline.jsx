import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, InputAdornment, Card, CardContent, Alert } from "@mui/material";
import { Search, GripVertical } from "lucide-react";
import { opportunitiesApi } from "../api/resources";
import { money, shortDate } from "../components/Shared";
import { ProbabilityMeter } from "../components/Badges";
import { KanbanSkeleton } from "../components/Skeleton";

const STAGES = [
  { key: "prospecting", label: "Prospecting", accent: "#8A8D91" },
  { key: "qualification", label: "Qualification", accent: "#5E7CE2" },
  { key: "proposal", label: "Proposal", accent: "#1160B7" },
  { key: "negotiation", label: "Negotiation", accent: "#B25E09" },
  { key: "won", label: "Won", accent: "#2E7D46" },
  { key: "lost", label: "Lost", accent: "#B3261E" },
];

export default function Pipeline() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    opportunitiesApi.list()
      .then(setOpportunities)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return opportunities;
    const q = query.toLowerCase();
    return opportunities.filter(
      (o) => o.name.toLowerCase().includes(q) || (o.account_name || "").toLowerCase().includes(q)
    );
  }, [opportunities, query]);

  const columns = useMemo(() => {
    const map = {};
    STAGES.forEach((s) => (map[s.key] = []));
    filtered.forEach((o) => map[o.stage]?.push(o));
    return map;
  }, [filtered]);

  const handleDrop = async (stageKey) => {
    const id = draggedId;
    setDraggedId(null);
    setDragOverStage(null);
    if (id == null) return;

    const current = opportunities.find((o) => o.opportunity_id === id);
    if (!current || current.stage === stageKey) return;

    setOpportunities((prev) => prev.map((o) => (o.opportunity_id === id ? { ...o, stage: stageKey } : o)));
    try {
      await opportunitiesApi.updateStage(id, stageKey);
    } catch (err) {
      setOpportunities((prev) => prev.map((o) => (o.opportunity_id === id ? { ...o, stage: current.stage } : o)));
      setError(`Failed to move deal: ${err.message}`);
    }
  };

  if (loading) return <Box className="view"><Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>Pipeline</Typography><KanbanSkeleton /></Box>;

  return (
    <Box className="view">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, gap: 1.5, flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Pipeline</Typography>
        <TextField
          size="small"
          placeholder="Search deals or accounts"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
          sx={{ width: 240 }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

      <Box sx={{ display: "flex", gap: 1.75, overflowX: "auto", pb: 1.5 }}>
        {STAGES.map((stage) => {
          const list = columns[stage.key] || [];
          const sum = list.reduce((s, o) => s + Number(o.amount), 0);
          const isDragOver = dragOverStage === stage.key;
          return (
            <Box
              key={stage.key}
              onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.key); }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={() => handleDrop(stage.key)}
              sx={{
                flex: "0 0 260px", borderRadius: 2, display: "flex", flexDirection: "column",
                maxHeight: "calc(100vh - 220px)", bgcolor: isDragOver ? "#E1EBF7" : "action.hover",
                transition: "background-color 0.15s ease",
              }}
            >
              <Box sx={{ p: 1.5, pb: 1.25, borderTop: 3, borderColor: stage.accent, borderRadius: "8px 8px 0 0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>{stage.label}</Typography>
                  <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }} color="text.secondary">{list.length}</Typography>
                </Box>
                <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, fontWeight: 600, mt: 0.5 }}>{money(sum)}</Typography>
              </Box>
              <Box sx={{ flex: 1, overflowY: "auto", p: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                {list.length === 0 && (
                  <Box sx={{ fontSize: 12, color: "text.secondary", textAlign: "center", p: 3, border: "1px dashed", borderColor: "divider", borderRadius: 1.5 }}>
                    No deals in this stage
                  </Box>
                )}
                {list.map((deal) => (
                  <Card
                    key={deal.opportunity_id}
                    draggable
                    onDragStart={(e) => { setDraggedId(deal.opportunity_id); e.dataTransfer.effectAllowed = "move"; }}
                    onClick={() => navigate(`/opportunities/${deal.opportunity_id}`)}
                    sx={{
                      cursor: "pointer", opacity: draggedId === deal.opportunity_id ? 0.4 : 1,
                      "&:hover": { boxShadow: 2 },
                    }}
                  >
                    <CardContent sx={{ p: "10px 12px !important" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{deal.name}</Typography>
                        <GripVertical size={14} color="#C4C4C4" style={{ flexShrink: 0, marginTop: 2 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{deal.account_name}</Typography>
                      <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, fontWeight: 600, mt: 1 }}>{money(deal.amount)}</Typography>
                      <ProbabilityMeter value={deal.probability} />
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.25 }}>
                        <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }} color="text.secondary">{shortDate(deal.close_date)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}