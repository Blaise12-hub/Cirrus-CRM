import React, { useState } from "react";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import { activitiesApi } from "../api/resources";
import { shortDate, todayISO } from "./Shared";

const ACTIVITY_TYPES = ["call", "email", "meeting", "task", "note"];

function icon(type) {
  return { call: "\u260E", email: "\u2709", meeting: "\uD83D\uDC65", task: "\u2611", note: "\uD83D\uDCDD" }[type] || "\u2022";
}

export function ActivityTimeline({ activities, loading }) {
  if (loading) return <div className="table-state">Loading…</div>;
  if (!activities || activities.length === 0) {
    return <div className="empty-block">No activity logged yet.</div>;
  }
  return (
    <div className="timeline">
      {activities.map((a) => (
        <div key={a.activity_id} className="timeline-row">
          <div className={`timeline-status ${a.status === "completed" ? "done" : ""}`}>
            {a.status === "completed" ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          </div>
          <div className="timeline-content">
            <div className="timeline-top">
              <span className="timeline-subject">{icon(a.type)} {a.subject}</span>
              <span className="timeline-date">{shortDate(a.due_date)}</span>
            </div>
            <div className="timeline-meta">{a.type}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// parentType/parentId map straight onto the activities API's
// contact_id / account_id / opportunity_id / lead_id fields.
export function ActivityLogForm({ parentType, parentId, onCreated }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("call");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setSaving(true);
    setError("");
    try {
      const created = await activitiesApi.create({
        type,
        subject: subject.trim(),
        due_date: dueDate,
        [`${parentType}_id`]: parentId,
      });
      onCreated(created);
      setSubject("");
      setType("call");
      setDueDate(todayISO());
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button className="btn-ghost-add" onClick={() => setOpen(true)}>
        <Plus size={13} /> Log activity
      </button>
    );
  }

  return (
    <form className="activity-log-form" onSubmit={submit}>
      <div className="alf-row">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          type="text"
          placeholder="What happened or what's planned?"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          autoFocus
        />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="alf-actions">
        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
