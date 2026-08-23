import React, { useState, useMemo } from "react";
import {
  LayoutDashboard, Building2, Users, UserPlus, Target, Search, Plus, X,
  ArrowLeft, Phone, Mail, Globe, Calendar, CheckCircle2, Circle, ChevronRight,
  GripVertical,
} from "lucide-react";

/* ============================== MOCK DATA ============================== */

const STAGES = [
  { key: "prospecting", label: "Prospecting", accent: "#8A8D91" },
  { key: "qualification", label: "Qualification", accent: "#5E7CE2" },
  { key: "proposal", label: "Proposal", accent: "#0B5CAB" },
  { key: "negotiation", label: "Negotiation", accent: "#B25E09" },
  { key: "won", label: "Won", accent: "#2E7D46" },
  { key: "lost", label: "Lost", accent: "#B3261E" },
];

const OWNER_COLORS = { EN: "#0B5CAB", DM: "#2E7D46", AU: "#8A3FFC" };
const OWNER_NAMES = { EN: "Eric Nshuti", DM: "Diane Mukiza", AU: "Amara Uwase" };

const ACCOUNTS = [
  { id: 1, name: "Kivu Logistics", industry: "Transportation", phone: "+250 788 100 001", website: "kivulogistics.com", owner: "EN" },
  { id: 2, name: "Rwanda AgriTech", industry: "Agriculture", phone: "+250 788 100 002", website: "rwandaagritech.com", owner: "DM" },
  { id: 3, name: "Umucyo Bank", industry: "Financial Services", phone: "+250 788 100 003", website: "umucyobank.com", owner: "AU" },
  { id: 4, name: "Kigali Freight Co.", industry: "Transportation", phone: "+250 788 100 004", website: "kigalifreight.com", owner: "EN" },
];

const CONTACTS = [
  { id: 1, account_id: 1, first_name: "Jean", last_name: "Habimana", email: "jean.habimana@kivulogistics.com", phone: "+250 788 200 001", job_title: "Operations Manager", owner: "EN" },
  { id: 2, account_id: 2, first_name: "Grace", last_name: "Ingabire", email: "grace.ingabire@rwandaagritech.com", phone: "+250 788 200 002", job_title: "Procurement Lead", owner: "DM" },
  { id: 3, account_id: 3, first_name: "Samuel", last_name: "Mugisha", email: "samuel.mugisha@umucyobank.com", phone: "+250 788 200 003", job_title: "IT Director", owner: "AU" },
  { id: 4, account_id: 4, first_name: "Alice", last_name: "Uwimana", email: "alice.uwimana@kigalifreight.com", phone: "+250 788 200 004", job_title: "Fleet Manager", owner: "EN" },
];

const INITIAL_OPPORTUNITIES = [
  { id: 1, account_id: 1, contact_id: 1, name: "Pro Rollout", stage: "proposal", amount: 3600, probability: 60, close_date: "2026-09-15", owner: "EN" },
  { id: 2, account_id: 2, contact_id: 2, name: "Starter Pilot", stage: "negotiation", amount: 1500, probability: 75, close_date: "2026-08-01", owner: "DM" },
  { id: 3, account_id: 1, contact_id: 1, name: "Fleet Expansion", stage: "prospecting", amount: 8200, probability: 20, close_date: "2026-10-20", owner: "EN" },
  { id: 4, account_id: 3, contact_id: 3, name: "Enterprise License", stage: "qualification", amount: 15400, probability: 35, close_date: "2026-09-30", owner: "AU" },
  { id: 5, account_id: 2, contact_id: 2, name: "Renewal 2026", stage: "won", amount: 1500, probability: 100, close_date: "2026-06-10", owner: "DM" },
  { id: 6, account_id: 4, contact_id: 4, name: "Trial Extension", stage: "lost", amount: 900, probability: 0, close_date: "2026-05-02", owner: "EN" },
  { id: 7, account_id: 3, contact_id: 3, name: "Multi-site Deal", stage: "prospecting", amount: 22000, probability: 15, close_date: "2026-11-05", owner: "AU" },
];

const LEADS = [
  { id: 1, first_name: "Eric", last_name: "Mugabo", company_name: "Kagabo Traders", email: "eric.mugabo@kagabotraders.com", status: "new", source: "Website", owner: "EN" },
  { id: 2, first_name: "Sarah", last_name: "Nyirahabimana", company_name: "NyiraTech", email: "sarah@nyiratech.com", status: "contacted", source: "Referral", owner: "DM" },
  { id: 3, first_name: "Moses", last_name: "Bizimana", company_name: "Bizimana & Co", email: "moses@bizimanaco.com", status: "qualified", source: "Cold call", owner: "AU" },
];

const INITIAL_ACTIVITIES = [
  { id: 1, type: "call", subject: "Discovery call", status: "completed", due_date: "2026-07-10", parent_type: "opportunity", parent_id: 1, owner: "EN" },
  { id: 2, type: "meeting", subject: "Contract walkthrough", status: "pending", due_date: "2026-08-05", parent_type: "opportunity", parent_id: 1, owner: "EN" },
  { id: 3, type: "email", subject: "Pricing follow-up", status: "completed", due_date: "2026-07-15", parent_type: "opportunity", parent_id: 2, owner: "DM" },
  { id: 4, type: "task", subject: "Send onboarding docs", status: "pending", due_date: "2026-08-10", parent_type: "contact", parent_id: 1, owner: "EN" },
  { id: 5, type: "note", subject: "Prefers email over calls", status: "completed", due_date: "2026-07-01", parent_type: "contact", parent_id: 2, owner: "DM" },
  { id: 6, type: "call", subject: "Intro call", status: "pending", due_date: "2026-07-28", parent_type: "lead", parent_id: 1, owner: "EN" },
];

/* ============================== HELPERS ============================== */

const money = (n) => "$" + n.toLocaleString("en-US");
const shortDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
const longDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const initials = (first, last) => (first[0] + last[0]).toUpperCase();

/* ============================== SHARED UI ============================== */

function Avatar({ code, size = 26 }) {
  return (
    <span
      className="avatar"
      style={{ background: OWNER_COLORS[code] || "#6B6B6B", width: size, height: size, fontSize: size * 0.4 }}
      title={OWNER_NAMES[code] || code}
    >
      {code}
    </span>
  );
}

function ProbabilityMeter({ value }) {
  const filled = Math.round(value / 20);
  return (
    <div className="prob-meter">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`prob-seg ${i < filled ? "filled" : ""}`} />
      ))}
      <span className="prob-num">{value}%</span>
    </div>
  );
}

function StagePill({ stage }) {
  const s = STAGES.find((s) => s.key === stage);
  return (
    <span className="stage-pill" style={{ background: `${s.accent}1A`, color: s.accent }}>
      {s.label}
    </span>
  );
}

function LeadStatusPill({ status }) {
  const map = {
    new: "#5E7CE2", contacted: "#B25E09", qualified: "#2E7D46",
    converted: "#0B5CAB", disqualified: "#B3261E",
  };
  const c = map[status] || "#6B6B6B";
  return <span className="stage-pill" style={{ background: `${c}1A`, color: c }}>{status}</span>;
}

function ActivityTimeline({ activities }) {
  const icon = (type) =>
    ({ call: "\u260E", email: "\u2709", meeting: "\uD83D\uDC65", task: "\u2611", note: "\uD83D\uDCDD" }[type] || "\u2022");

  if (activities.length === 0) {
    return <div className="empty-block">No activity logged yet.</div>;
  }
  return (
    <div className="timeline">
      {activities.map((a) => (
        <div key={a.id} className="timeline-row">
          <div className={`timeline-status ${a.status === "completed" ? "done" : ""}`}>
            {a.status === "completed" ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          </div>
          <div className="timeline-content">
            <div className="timeline-top">
              <span className="timeline-subject">{icon(a.type)} {a.subject}</span>
              <span className="timeline-date">{shortDate(a.due_date)}</span>
            </div>
            <div className="timeline-meta">{a.type} · {OWNER_NAMES[a.owner]}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DataTable({ columns, rows, onRowClick }) {
  return (
    <table className="data-table">
      <thead>
        <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} onClick={() => onRowClick(row)}>
            {columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DetailHeader({ eyebrow, title, subtitle, onBack, right }) {
  return (
    <div className="detail-header">
      <button className="back-link" onClick={onBack}><ArrowLeft size={14} /> Back</button>
      <div className="detail-header-row">
        <div>
          <div className="detail-eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          {subtitle && <div className="detail-subtitle">{subtitle}</div>}
        </div>
        {right}
      </div>
    </div>
  );
}

/* ============================== VIEWS ============================== */

function DashboardView({ opportunities, activities, leads, nav }) {
  const open = opportunities.filter((o) => o.stage !== "won" && o.stage !== "lost");
  const openTotal = open.reduce((s, o) => s + o.amount, 0);
  const wonTotal = opportunities.filter((o) => o.stage === "won").reduce((s, o) => s + o.amount, 0);
  const pendingTasks = activities.filter((a) => a.status === "pending");
  const newLeads = leads.filter((l) => l.status === "new");

  return (
    <div className="view">
      <h1 className="page-title">Good morning, Eric</h1>
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
          <div className="stat-label">Open tasks</div>
          <div className="stat-value">{pendingTasks.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">New leads</div>
          <div className="stat-value">{newLeads.length}</div>
        </div>
      </div>

      <div className="dash-columns">
        <div className="dash-panel">
          <div className="panel-title">Your open tasks</div>
          <ActivityTimeline activities={pendingTasks} />
        </div>
        <div className="dash-panel">
          <div className="panel-title">Deals closing soon</div>
          <div className="mini-list">
            {open.slice(0, 5).map((o) => (
              <div key={o.id} className="mini-row" onClick={() => nav("opportunity", o.id)}>
                <span>{o.name}</span>
                <span className="mini-amount">{money(o.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineView({ opportunities, setOpportunities, nav }) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return opportunities;
    const q = query.toLowerCase();
    return opportunities.filter((o) => {
      const acc = ACCOUNTS.find((a) => a.id === o.account_id);
      return o.name.toLowerCase().includes(q) || (acc && acc.name.toLowerCase().includes(q));
    });
  }, [opportunities, query]);

  const columns = useMemo(() => {
    const map = {};
    STAGES.forEach((s) => (map[s.key] = []));
    filtered.forEach((o) => map[o.stage]?.push(o));
    return map;
  }, [filtered]);

  const handleDrop = (stageKey) => {
    if (draggedId == null) return;
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === draggedId
          ? { ...o, stage: stageKey, probability: stageKey === "won" ? 100 : stageKey === "lost" ? 0 : o.probability }
          : o
      )
    );
    setDraggedId(null);
    setDragOverStage(null);
  };

  return (
    <div className="view">
      <div className="pb-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Pipeline</h1>
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search deals or accounts" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="board">
        {STAGES.map((stage) => {
          const list = columns[stage.key] || [];
          const sum = list.reduce((s, o) => s + o.amount, 0);
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
                {list.map((deal) => {
                  const acc = ACCOUNTS.find((a) => a.id === deal.account_id);
                  return (
                    <div
                      key={deal.id}
                      className={`deal-card ${draggedId === deal.id ? "dragging" : ""}`}
                      draggable
                      onDragStart={(e) => { setDraggedId(deal.id); e.dataTransfer.effectAllowed = "move"; }}
                      onClick={() => nav("opportunity", deal.id)}
                    >
                      <div className="deal-card-top">
                        <span className="deal-name">{deal.name}</span>
                        <GripVertical size={14} className="grip" />
                      </div>
                      <div className="deal-account">{acc?.name}</div>
                      <div className="deal-amount">{money(deal.amount)}</div>
                      <ProbabilityMeter value={deal.probability} />
                      <div className="deal-footer">
                        <span className="deal-date">{shortDate(deal.close_date)}</span>
                        <Avatar code={deal.owner} size={22} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AccountsListView({ nav }) {
  const [query, setQuery] = useState("");
  const rows = ACCOUNTS.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="view">
      <div className="pb-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Accounts</h1>
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search accounts" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>
      <DataTable
        columns={[
          { key: "name", label: "Account name", render: (r) => <strong>{r.name}</strong> },
          { key: "industry", label: "Industry" },
          { key: "phone", label: "Phone" },
          { key: "owner", label: "Owner", render: (r) => <Avatar code={r.owner} size={22} /> },
        ]}
        rows={rows}
        onRowClick={(r) => nav("account", r.id)}
      />
    </div>
  );
}

function AccountDetailView({ id, nav, opportunities }) {
  const account = ACCOUNTS.find((a) => a.id === id);
  const contacts = CONTACTS.filter((c) => c.account_id === id);
  const opps = opportunities.filter((o) => o.account_id === id);
  if (!account) return <div className="view">Account not found.</div>;

  return (
    <div className="view">
      <DetailHeader
        eyebrow="Account"
        title={account.name}
        subtitle={account.industry}
        onBack={() => nav("accounts")}
        right={<Avatar code={account.owner} size={36} />}
      />

      <div className="detail-info-row">
        <span><Phone size={13} /> {account.phone}</span>
        <span><Globe size={13} /> {account.website}</span>
      </div>

      <div className="detail-columns">
        <div className="dash-panel">
          <div className="panel-title">Contacts ({contacts.length})</div>
          {contacts.length === 0 && <div className="empty-block">No contacts yet.</div>}
          <div className="mini-list">
            {contacts.map((c) => (
              <div key={c.id} className="mini-row" onClick={() => nav("contact", c.id)}>
                <span>{c.first_name} {c.last_name} <span className="mini-sub">— {c.job_title}</span></span>
                <ChevronRight size={14} className="chev" />
              </div>
            ))}
          </div>
        </div>
        <div className="dash-panel">
          <div className="panel-title">Opportunities ({opps.length})</div>
          {opps.length === 0 && <div className="empty-block">No opportunities yet.</div>}
          <div className="mini-list">
            {opps.map((o) => (
              <div key={o.id} className="mini-row" onClick={() => nav("opportunity", o.id)}>
                <span>{o.name}</span>
                <span className="mini-amount">{money(o.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactsListView({ nav }) {
  const [query, setQuery] = useState("");
  const rows = CONTACTS.filter((c) => `${c.first_name} ${c.last_name}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="view">
      <div className="pb-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Contacts</h1>
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search contacts" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>
      <DataTable
        columns={[
          { key: "name", label: "Name", render: (r) => <strong>{r.first_name} {r.last_name}</strong> },
          { key: "job_title", label: "Title" },
          { key: "account", label: "Account", render: (r) => ACCOUNTS.find((a) => a.id === r.account_id)?.name },
          { key: "email", label: "Email" },
          { key: "owner", label: "Owner", render: (r) => <Avatar code={r.owner} size={22} /> },
        ]}
        rows={rows}
        onRowClick={(r) => nav("contact", r.id)}
      />
    </div>
  );
}

function ContactDetailView({ id, nav, opportunities, activities }) {
  const contact = CONTACTS.find((c) => c.id === id);
  if (!contact) return <div className="view">Contact not found.</div>;
  const account = ACCOUNTS.find((a) => a.id === contact.account_id);
  const opps = opportunities.filter((o) => o.contact_id === id);
  const acts = activities.filter((a) => a.parent_type === "contact" && a.parent_id === id);

  return (
    <div className="view">
      <DetailHeader
        eyebrow="Contact"
        title={`${contact.first_name} ${contact.last_name}`}
        subtitle={`${contact.job_title} at ${account?.name || "—"}`}
        onBack={() => nav("contacts")}
        right={<Avatar code={contact.owner} size={36} />}
      />

      <div className="detail-info-row">
        <span><Mail size={13} /> {contact.email}</span>
        <span><Phone size={13} /> {contact.phone}</span>
        {account && (
          <span className="link-chip" onClick={() => nav("account", account.id)}>
            <Building2 size={13} /> {account.name}
          </span>
        )}
      </div>

      <div className="detail-columns">
        <div className="dash-panel">
          <div className="panel-title">Opportunities ({opps.length})</div>
          {opps.length === 0 && <div className="empty-block">No opportunities yet.</div>}
          <div className="mini-list">
            {opps.map((o) => (
              <div key={o.id} className="mini-row" onClick={() => nav("opportunity", o.id)}>
                <span>{o.name}</span>
                <span className="mini-amount">{money(o.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dash-panel">
          <div className="panel-title">Activity</div>
          <ActivityTimeline activities={acts} />
        </div>
      </div>
    </div>
  );
}

function OpportunityDetailView({ id, nav, opportunities, setOpportunities, activities }) {
  const opp = opportunities.find((o) => o.id === id);
  if (!opp) return <div className="view">Opportunity not found.</div>;
  const account = ACCOUNTS.find((a) => a.id === opp.account_id);
  const contact = CONTACTS.find((c) => c.id === opp.contact_id);
  const acts = activities.filter((a) => a.parent_type === "opportunity" && a.parent_id === id);

  const setStage = (stage) => {
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, stage, probability: stage === "won" ? 100 : stage === "lost" ? 0 : o.probability } : o
      )
    );
  };

  return (
    <div className="view">
      <DetailHeader
        eyebrow="Opportunity"
        title={opp.name}
        subtitle={account?.name}
        onBack={() => nav("pipeline")}
        right={<div className="amount-hero">{money(opp.amount)}</div>}
      />

      <div className="stage-selector">
        {STAGES.map((s) => (
          <button
            key={s.key}
            className={`stage-btn ${opp.stage === s.key ? "active" : ""}`}
            style={opp.stage === s.key ? { background: s.accent, borderColor: s.accent } : {}}
            onClick={() => setStage(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="detail-info-row">
        <span><Calendar size={13} /> Closes {longDate(opp.close_date)}</span>
        <span>Probability <ProbabilityMeter value={opp.probability} /></span>
        <Avatar code={opp.owner} size={24} />
      </div>

      <div className="detail-columns">
        <div className="dash-panel">
          <div className="panel-title">Primary contact</div>
          {contact ? (
            <div className="mini-row" onClick={() => nav("contact", contact.id)}>
              <span>{contact.first_name} {contact.last_name} <span className="mini-sub">— {contact.job_title}</span></span>
              <ChevronRight size={14} className="chev" />
            </div>
          ) : (
            <div className="empty-block">No contact linked.</div>
          )}
        </div>
        <div className="dash-panel">
          <div className="panel-title">Activity</div>
          <ActivityTimeline activities={acts} />
        </div>
      </div>
    </div>
  );
}

function LeadsListView({ nav }) {
  const [query, setQuery] = useState("");
  const rows = LEADS.filter((l) => `${l.first_name} ${l.last_name}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="view">
      <div className="pb-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Leads</h1>
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search leads" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>
      <DataTable
        columns={[
          { key: "name", label: "Name", render: (r) => <strong>{r.first_name} {r.last_name}</strong> },
          { key: "company_name", label: "Company" },
          { key: "source", label: "Source" },
          { key: "status", label: "Status", render: (r) => <LeadStatusPill status={r.status} /> },
          { key: "owner", label: "Owner", render: (r) => <Avatar code={r.owner} size={22} /> },
        ]}
        rows={rows}
        onRowClick={() => {}}
      />
    </div>
  );
}

/* ============================== APP SHELL ============================== */

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "pipeline", label: "Pipeline", icon: Target },
  { key: "accounts", label: "Accounts", icon: Building2 },
  { key: "contacts", label: "Contacts", icon: Users },
  { key: "leads", label: "Leads", icon: UserPlus },
];

export default function CRMPrototype() {
  const [view, setView] = useState({ name: "dashboard", id: null });
  const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
  const [activities] = useState(INITIAL_ACTIVITIES);

  const nav = (name, id = null) => setView({ name, id });
  const topLevel = ["dashboard", "pipeline", "accounts", "contacts", "leads"].includes(view.name) ? view.name : null;

  let content;
  switch (view.name) {
    case "dashboard":
      content = <DashboardView opportunities={opportunities} activities={activities} leads={LEADS} nav={nav} />;
      break;
    case "pipeline":
      content = <PipelineView opportunities={opportunities} setOpportunities={setOpportunities} nav={nav} />;
      break;
    case "accounts":
      content = <AccountsListView nav={nav} />;
      break;
    case "account":
      content = <AccountDetailView id={view.id} nav={nav} opportunities={opportunities} />;
      break;
    case "contacts":
      content = <ContactsListView nav={nav} />;
      break;
    case "contact":
      content = <ContactDetailView id={view.id} nav={nav} opportunities={opportunities} activities={activities} />;
      break;
    case "opportunity":
      content = (
        <OpportunityDetailView
          id={view.id} nav={nav} opportunities={opportunities}
          setOpportunities={setOpportunities} activities={activities}
        />
      );
      break;
    case "leads":
      content = <LeadsListView nav={nav} />;
      break;
    default:
      content = null;
  }

  return (
    <div className="crm-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .crm-root {
          --color-bg: #F3F2F2;
          --color-surface: #FFFFFF;
          --color-border: #D8D8D8;
          --color-primary: #0B5CAB;
          --color-primary-dark: #063970;
          --color-text: #1A1A1A;
          --color-text-muted: #6B6B6B;
          font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
          color: var(--color-text);
          display: flex;
          height: 100vh;
          background: var(--color-bg);
        }
        .crm-root * { box-sizing: border-box; }

        /* ---- Sidebar ---- */
        .sidebar {
          width: 208px;
          flex-shrink: 0;
          background: #16325C;
          color: white;
          display: flex;
          flex-direction: column;
          padding: 18px 12px;
        }
        .brand {
          font-weight: 700;
          font-size: 15px;
          padding: 0 10px 20px 10px;
          letter-spacing: -0.01em;
        }
        .brand span { color: #6FA8E0; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #C9D6E8;
          cursor: pointer;
          margin-bottom: 2px;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          font-family: inherit;
        }
        .nav-item:hover { background: rgba(255,255,255,0.06); color: white; }
        .nav-item.active { background: var(--color-primary); color: white; }

        /* ---- Main area ---- */
        .main-area { flex: 1; overflow-y: auto; padding: 24px 28px; }
        .view { max-width: 1080px; }
        .page-title { font-size: 20px; font-weight: 700; margin: 0 0 18px 0; letter-spacing: -0.01em; }

        /* ---- Stat cards ---- */
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
        .stat-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; padding: 16px; }
        .stat-label { font-size: 12px; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
        .stat-value { font-family: 'IBM Plex Mono', monospace; font-size: 24px; font-weight: 600; margin-top: 6px; }
        .stat-sub { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }

        .dash-columns, .detail-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
        .dash-panel { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; padding: 16px; }
        .panel-title { font-size: 13px; font-weight: 700; margin-bottom: 10px; }

        .mini-list { display: flex; flex-direction: column; gap: 2px; }
        .mini-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 4px; font-size: 13px; cursor: pointer; border-radius: 5px;
        }
        .mini-row:hover { background: var(--color-bg); }
        .mini-amount { font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 12.5px; }
        .mini-sub { color: var(--color-text-muted); font-weight: 400; }
        .chev { color: #C4C4C4; }

        .empty-block { font-size: 12.5px; color: var(--color-text-muted); padding: 14px 4px; }

        /* ---- Search / header row ---- */
        .pb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; gap: 12px; flex-wrap: wrap; }
        .search-box { display: flex; align-items: center; gap: 6px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 6px; padding: 7px 10px; color: var(--color-text-muted); }
        .search-box input { border: none; outline: none; font-family: inherit; font-size: 13px; background: transparent; color: var(--color-text); width: 180px; }

        /* ---- Table ---- */
        .data-table { width: 100%; border-collapse: collapse; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
        .data-table th { text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.03em; color: var(--color-text-muted); padding: 10px 14px; border-bottom: 1px solid var(--color-border); background: #FAFAFA; }
        .data-table td { padding: 11px 14px; font-size: 13px; border-bottom: 1px solid #EEEEEE; }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tbody tr { cursor: pointer; }
        .data-table tbody tr:hover { background: #F7FAFD; }

        /* ---- Avatar ---- */
        .avatar { border-radius: 50%; color: white; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; font-family: 'IBM Plex Sans', sans-serif; }

        /* ---- Pills ---- */
        .stage-pill { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11.5px; font-weight: 600; text-transform: capitalize; }

        /* ---- Probability meter ---- */
        .prob-meter { display: inline-flex; align-items: center; gap: 3px; vertical-align: middle; margin-left: 6px; }
        .prob-seg { width: 14px; height: 4px; border-radius: 2px; background: #E1DFDD; }
        .prob-seg.filled { background: var(--color-primary); }
        .prob-num { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: var(--color-text-muted); margin-left: 4px; }

        /* ---- Kanban board (reused) ---- */
        .board { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 12px; }
        .column { flex: 0 0 260px; background: #EDECEC; border-radius: 8px; display: flex; flex-direction: column; max-height: calc(100vh - 220px); transition: background 0.15s ease; }
        .column.drag-over { background: #E1EBF7; }
        .column-header { padding: 12px 12px 10px 12px; border-top: 3px solid var(--accent); border-radius: 8px 8px 0 0; }
        .column-header-top { display: flex; justify-content: space-between; align-items: baseline; }
        .column-title { font-size: 12.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
        .column-count { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--color-text-muted); }
        .column-sum { font-family: 'IBM Plex Mono', monospace; font-size: 15px; font-weight: 600; margin-top: 4px; }
        .column-body { flex: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 8px; }
        .empty-col { font-size: 12px; color: var(--color-text-muted); text-align: center; padding: 24px 8px; border: 1px dashed var(--color-border); border-radius: 6px; }
        .deal-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 6px; padding: 10px 12px; cursor: pointer; transition: box-shadow 0.15s ease; }
        .deal-card:hover { box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
        .deal-card.dragging { opacity: 0.4; }
        .deal-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .deal-name { font-size: 13.5px; font-weight: 600; line-height: 1.3; }
        .grip { color: #C4C4C4; flex-shrink: 0; margin-top: 2px; cursor: grab; }
        .deal-account { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }
        .deal-amount { font-family: 'IBM Plex Mono', monospace; font-size: 15px; font-weight: 600; margin-top: 8px; }
        .deal-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
        .deal-date { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--color-text-muted); }

        /* ---- Detail header ---- */
        .detail-header { margin-bottom: 16px; }
        .back-link { display: inline-flex; align-items: center; gap: 5px; background: none; border: none; color: var(--color-text-muted); font-family: inherit; font-size: 12.5px; cursor: pointer; padding: 0; margin-bottom: 12px; }
        .back-link:hover { color: var(--color-primary); }
        .detail-header-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .detail-eyebrow { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-primary); margin-bottom: 2px; }
        .detail-header h1 { font-size: 21px; font-weight: 700; margin: 0; letter-spacing: -0.01em; }
        .detail-subtitle { font-size: 13px; color: var(--color-text-muted); margin-top: 3px; }
        .amount-hero { font-family: 'IBM Plex Mono', monospace; font-size: 24px; font-weight: 700; color: var(--color-primary); }

        .detail-info-row { display: flex; gap: 20px; align-items: center; font-size: 12.5px; color: var(--color-text-muted); margin-bottom: 18px; flex-wrap: wrap; }
        .detail-info-row span { display: inline-flex; align-items: center; gap: 5px; }
        .link-chip { cursor: pointer; color: var(--color-primary); font-weight: 600; }
        .link-chip:hover { text-decoration: underline; }

        /* ---- Timeline ---- */
        .timeline { display: flex; flex-direction: column; gap: 12px; }
        .timeline-row { display: flex; gap: 10px; }
        .timeline-status { color: #C4C4C4; margin-top: 1px; }
        .timeline-status.done { color: #2E7D46; }
        .timeline-content { flex: 1; }
        .timeline-top { display: flex; justify-content: space-between; }
        .timeline-subject { font-size: 13px; font-weight: 500; }
        .timeline-date { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--color-text-muted); }
        .timeline-meta { font-size: 11.5px; color: var(--color-text-muted); text-transform: capitalize; margin-top: 1px; }

        /* ---- Stage selector (opportunity detail) ---- */
        .stage-selector { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
        .stage-btn { font-family: inherit; font-size: 12px; font-weight: 600; padding: 7px 12px; border-radius: 20px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text-muted); cursor: pointer; }
        .stage-btn.active { color: white; }
      `}</style>

      <div className="sidebar">
        <div className="brand">Cirrus <span>CRM</span></div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${topLevel === item.key ? "active" : ""}`}
            onClick={() => nav(item.key)}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="main-area">{content}</div>
    </div>
  );
}
