import React, { useState, useMemo } from "react";
import { Plus, Search, X, GripVertical } from "lucide-react";

const STAGES = [
  { key: "prospecting", label: "Prospecting", accent: "#8A8D91" },
  { key: "qualification", label: "Qualification", accent: "#5E7CE2" },
  { key: "proposal", label: "Proposal", accent: "#0B5CAB" },
  { key: "negotiation", label: "Negotiation", accent: "#B25E09" },
  { key: "won", label: "Won", accent: "#2E7D46" },
  { key: "lost", label: "Lost", accent: "#B3261E" },
];

const INITIAL_DEALS = [
  { id: 1, name: "Pro Rollout", account: "Kivu Logistics", amount: 3600, stage: "proposal", probability: 60, close_date: "2026-09-15", owner: "EN" },
  { id: 2, name: "Starter Pilot", account: "Rwanda AgriTech", amount: 1500, stage: "negotiation", probability: 75, close_date: "2026-08-01", owner: "DM" },
  { id: 3, name: "Fleet Expansion", account: "Kivu Logistics", amount: 8200, stage: "prospecting", probability: 20, close_date: "2026-10-20", owner: "EN" },
  { id: 4, name: "Enterprise License", account: "Umucyo Bank", amount: 15400, stage: "qualification", probability: 35, close_date: "2026-09-30", owner: "AU" },
  { id: 5, name: "Renewal 2026", account: "Rwanda AgriTech", amount: 1500, stage: "won", probability: 100, close_date: "2026-06-10", owner: "DM" },
  { id: 6, name: "Trial Extension", account: "Kigali Freight Co.", amount: 900, stage: "lost", probability: 0, close_date: "2026-05-02", owner: "EN" },
  { id: 7, name: "Multi-site Deal", account: "Umucyo Bank", amount: 22000, stage: "prospecting", probability: 15, close_date: "2026-11-05", owner: "AU" },
];

const OWNER_COLORS = { EN: "#0B5CAB", DM: "#2E7D46", AU: "#8A3FFC" };

function formatMoney(n) {
  return "$" + n.toLocaleString("en-US");
}

function formatDate(d) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ProbabilityMeter({ value }) {
  const filled = Math.round(value / 20);
  return (
    <div className="prob-meter" title={`${value}% probability`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`prob-seg ${i < filled ? "filled" : ""}`} />
      ))}
      <span className="prob-num">{value}%</span>
    </div>
  );
}

function DealCard({ deal, onDragStart, isDragging }) {
  return (
    <div
      className={`deal-card ${isDragging ? "dragging" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
    >
      <div className="deal-card-top">
        <span className="deal-name">{deal.name}</span>
        <GripVertical size={14} className="grip" />
      </div>
      <div className="deal-account">{deal.account}</div>
      <div className="deal-amount">{formatMoney(deal.amount)}</div>
      <ProbabilityMeter value={deal.probability} />
      <div className="deal-footer">
        <span className="deal-date">{formatDate(deal.close_date)}</span>
        <span
          className="owner-badge"
          style={{ background: OWNER_COLORS[deal.owner] || "#6B6B6B" }}
        >
          {deal.owner}
        </span>
      </div>
    </div>
  );
}

function NewDealModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    account: "",
    amount: "",
    close_date: "",
    stage: "prospecting",
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.account || !form.amount) return;
    onCreate({
      id: Date.now(),
      name: form.name,
      account: form.account,
      amount: Number(form.amount),
      stage: form.stage,
      probability: form.stage === "won" ? 100 : form.stage === "lost" ? 0 : 20,
      close_date: form.close_date || "2026-12-31",
      owner: "EN",
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>New opportunity</span>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={submit} className="modal-body">
          <label>
            Deal name
            <input value={form.name} onChange={set("name")} placeholder="e.g. Fleet Expansion" autoFocus />
          </label>
          <label>
            Account
            <input value={form.account} onChange={set("account")} placeholder="e.g. Kivu Logistics" />
          </label>
          <div className="form-row">
            <label>
              Amount (USD)
              <input value={form.amount} onChange={set("amount")} type="number" placeholder="0" />
            </label>
            <label>
              Close date
              <input value={form.close_date} onChange={set("close_date")} type="date" />
            </label>
          </div>
          <label>
            Stage
            <select value={form.stage} onChange={set("stage")}>
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Create opportunity</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PipelineBoard() {
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState("");

  const filteredDeals = useMemo(() => {
    if (!query.trim()) return deals;
    const q = query.toLowerCase();
    return deals.filter(
      (d) => d.name.toLowerCase().includes(q) || d.account.toLowerCase().includes(q)
    );
  }, [deals, query]);

  const columns = useMemo(() => {
    const map = {};
    STAGES.forEach((s) => (map[s.key] = []));
    filteredDeals.forEach((d) => map[d.stage]?.push(d));
    return map;
  }, [filteredDeals]);

  const openTotal = deals
    .filter((d) => d.stage !== "won" && d.stage !== "lost")
    .reduce((sum, d) => sum + d.amount, 0);
  const wonTotal = deals.filter((d) => d.stage === "won").reduce((sum, d) => sum + d.amount, 0);

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (stageKey) => {
    if (draggedId == null) return;
    setDeals((prev) =>
      prev.map((d) =>
        d.id === draggedId
          ? { ...d, stage: stageKey, probability: stageKey === "won" ? 100 : stageKey === "lost" ? 0 : d.probability }
          : d
      )
    );
    setDraggedId(null);
    setDragOverStage(null);
  };

  return (
    <div className="pipeline-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .pipeline-root {
          --color-bg: #F3F2F2;
          --color-surface: #FFFFFF;
          --color-border: #D8D8D8;
          --color-primary: #0B5CAB;
          --color-primary-dark: #063970;
          --color-text: #1A1A1A;
          --color-text-muted: #6B6B6B;
          font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
          background: var(--color-bg);
          color: var(--color-text);
          min-height: 100%;
          padding: 24px;
          box-sizing: border-box;
        }
        .pipeline-root * { box-sizing: border-box; }

        .pb-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .pb-title-block h1 {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 4px 0;
          letter-spacing: -0.01em;
        }
        .pb-stats {
          display: flex;
          gap: 20px;
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
          font-size: 13px;
          color: var(--color-text-muted);
        }
        .pb-stats b {
          color: var(--color-text);
          font-weight: 600;
        }
        .pb-stats .won-figure b { color: #2E7D46; }

        .pb-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 7px 10px;
          color: var(--color-text-muted);
        }
        .search-box input {
          border: none;
          outline: none;
          font-family: inherit;
          font-size: 13px;
          background: transparent;
          color: var(--color-text);
          width: 160px;
        }
        .btn-primary {
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 9px 14px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .btn-primary:hover { background: var(--color-primary-dark); }
        .btn-secondary {
          background: transparent;
          color: var(--color-text);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 9px 14px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-secondary:hover { background: var(--color-bg); }

        .board {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          padding-bottom: 12px;
        }
        .column {
          flex: 0 0 272px;
          background: #EDECEC;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - 160px);
          transition: background 0.15s ease;
        }
        .column.drag-over { background: #E1EBF7; }

        .column-header {
          padding: 12px 12px 10px 12px;
          border-top: 3px solid var(--accent);
          border-radius: 8px 8px 0 0;
        }
        .column-header-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .column-title {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--color-text);
        }
        .column-count {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: var(--color-text-muted);
        }
        .column-sum {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 15px;
          font-weight: 600;
          margin-top: 4px;
          color: var(--color-text);
        }

        .column-body {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .empty-col {
          font-size: 12px;
          color: var(--color-text-muted);
          text-align: center;
          padding: 24px 8px;
          border: 1px dashed var(--color-border);
          border-radius: 6px;
        }

        .deal-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 10px 12px;
          cursor: grab;
          transition: box-shadow 0.15s ease, transform 0.1s ease;
        }
        .deal-card:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
        .deal-card.dragging { opacity: 0.4; }

        .deal-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .deal-name {
          font-size: 13.5px;
          font-weight: 600;
          line-height: 1.3;
        }
        .grip { color: #C4C4C4; flex-shrink: 0; margin-top: 2px; }
        .deal-account {
          font-size: 12px;
          color: var(--color-text-muted);
          margin-top: 2px;
        }
        .deal-amount {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 15px;
          font-weight: 600;
          margin-top: 8px;
        }

        .prob-meter {
          display: flex;
          align-items: center;
          gap: 3px;
          margin-top: 8px;
        }
        .prob-seg {
          width: 14px;
          height: 4px;
          border-radius: 2px;
          background: #E1DFDD;
        }
        .prob-seg.filled { background: var(--color-primary); }
        .prob-num {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10.5px;
          color: var(--color-text-muted);
          margin-left: 4px;
        }

        .deal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }
        .deal-date {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--color-text-muted);
        }
        .owner-badge {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          color: white;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
        .modal {
          background: var(--color-surface);
          border-radius: 8px;
          width: 380px;
          max-width: 90vw;
          box-shadow: 0 12px 32px rgba(0,0,0,0.2);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-bottom: 1px solid var(--color-border);
          font-weight: 600;
          font-size: 14px;
        }
        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-muted);
          display: flex;
        }
        .modal-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .modal-body label {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-muted);
        }
        .modal-body input,
        .modal-body select {
          font-family: inherit;
          font-size: 13px;
          padding: 8px 10px;
          border: 1px solid var(--color-border);
          border-radius: 5px;
          color: var(--color-text);
          outline: none;
        }
        .modal-body input:focus,
        .modal-body select:focus {
          border-color: var(--color-primary);
        }
        .form-row {
          display: flex;
          gap: 10px;
        }
        .form-row label { flex: 1; }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 6px;
        }
      `}</style>

      <div className="pb-header">
        <div className="pb-title-block">
          <h1>Pipeline</h1>
          <div className="pb-stats">
            <span>Open pipeline: <b>{formatMoney(openTotal)}</b></span>
            <span className="won-figure">Won this period: <b>{formatMoney(wonTotal)}</b></span>
          </div>
        </div>
        <div className="pb-actions">
          <div className="search-box">
            <Search size={14} />
            <input
              placeholder="Search deals or accounts"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={14} /> New opportunity
          </button>
        </div>
      </div>

      <div className="board">
        {STAGES.map((stage) => {
          const dealsInStage = columns[stage.key] || [];
          const sum = dealsInStage.reduce((s, d) => s + d.amount, 0);
          return (
            <div
              key={stage.key}
              className={`column ${dragOverStage === stage.key ? "drag-over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage.key);
              }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className="column-header" style={{ "--accent": stage.accent }}>
                <div className="column-header-top">
                  <span className="column-title">{stage.label}</span>
                  <span className="column-count">{dealsInStage.length}</span>
                </div>
                <div className="column-sum">{formatMoney(sum)}</div>
              </div>
              <div className="column-body">
                {dealsInStage.length === 0 && (
                  <div className="empty-col">No deals in this stage</div>
                )}
                {dealsInStage.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onDragStart={handleDragStart}
                    isDragging={draggedId === deal.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <NewDealModal
          onClose={() => setShowModal(false)}
          onCreate={(deal) => setDeals((prev) => [...prev, deal])}
        />
      )}
    </div>
  );
}
