import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, GripVertical } from "lucide-react";
import { opportunitiesApi } from "../api/resources";
import { money, shortDate } from "../components/Shared";
import { ProbabilityMeter } from "../components/Badges";
import { KanbanSkeleton } from "../components/Skeleton";

//mock data
const STAGES = [
  { key: "prospecting", label: "Prospecting", accent: "#8A8D91" },
  { key: "qualification", label: "Qualification", accent: "#5E7CE2" },
  { key: "proposal", label: "Proposal", accent: "#0B5CAB" },
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

    // Optimistic update, roll back on failure
    setOpportunities((prev) => prev.map((o) => (o.opportunity_id === id ? { ...o, stage: stageKey } : o)));
    try {
      await opportunitiesApi.updateStage(id, stageKey);
    } catch (err) {
      setOpportunities((prev) => prev.map((o) => (o.opportunity_id === id ? { ...o, stage: current.stage } : o)));
      setError(`Failed to move deal: ${err.message}`);
    }
  };

  //kanban-shaped skeleton loader
  if (loading) return <div className="view"><h1 className="page-title">Pipeline</h1><KanbanSkeleton /></div>;

  return (
    <div className="view">
      <div className="pb-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Pipeline</h1>
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search deals or accounts" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="board">
        {STAGES.map((stage) => {
          const list = columns[stage.key] || [];
          const sum = list.reduce((s, o) => s + Number(o.amount), 0);
          return (
            <div
              key={stage.key}
              className={`column ${dragOverStage === stage.key ? "drag-over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.key); }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className="column-header" style={{ "--accent": stage.accent }}>
                <div className="column-header-top">
                  <span className="column-title">{stage.label}</span>
                  <span className="column-count">{list.length}</span>
                </div>
                <div className="column-sum">{money(sum)}</div>
              </div>
              <div className="column-body">
                {list.length === 0 && <div className="empty-col">No deals in this stage</div>}
                {list.map((deal) => (
                  <div
                    key={deal.opportunity_id}
                    className={`deal-card ${draggedId === deal.opportunity_id ? "dragging" : ""}`}
                    draggable
                    onDragStart={(e) => { setDraggedId(deal.opportunity_id); e.dataTransfer.effectAllowed = "move"; }}
                    onClick={() => navigate(`/opportunities/${deal.opportunity_id}`)}
                  >
                    <div className="deal-card-top">
                      <span className="deal-name">{deal.name}</span>
                      <GripVertical size={14} className="grip" />
                    </div>
                    <div className="deal-account">{deal.account_name}</div>
                    <div className="deal-amount">{money(deal.amount)}</div>
                    <ProbabilityMeter value={deal.probability} />
                    <div className="deal-footer">
                      <span className="deal-date">{shortDate(deal.close_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
