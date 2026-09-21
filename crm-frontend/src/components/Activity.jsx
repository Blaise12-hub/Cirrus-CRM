import React, { useState } from "react";
import { Box, Typography, TextField, MenuItem, Button, Alert } from "@mui/material";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import { activitiesApi } from "../api/resources";
import { shortDate, todayISO } from "./Shared";
import { TimelineSkeleton } from "./Skeleton";

const ACTIVITY_TYPES = ["call", "email", "meeting", "task", "note"];

function icon(type) {
  return { call: "\u260E", email: "\u2709", meeting: "\uD83D\uDC65", task: "\u2611", note: "\uD83D\uDCDD" }[type] || "\u2022";
}

export function ActivityTimeline({ activities, loading }) {
  if (loading) return <TimelineSkeleton rows={3} />;
  if (!activities || activities.length === 0) {
    return <Typography variant="body2" color="text.secondary">No activity logged yet.</Typography>;
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {activities.map((a) => (
        <Box key={a.activity_id} sx={{ display: "flex", gap: 1.25 }}>
          <Box sx={{ color: a.status === "completed" ? "success.main" : "text.disabled", mt: 0.25, flexShrink: 0 }}>
            {a.status === "completed" ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{icon(a.type)} {a.subject}</Typography>
              <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }} color="text.secondary">
                {shortDate(a.due_date)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>{a.type}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
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
      <Button size="small" startIcon={<Plus size={13} />} onClick={() => setOpen(true)}>
        Log activity
      </Button>
    );
  }

  return (
    <Box component="form" onSubmit={submit} sx={{ bgcolor: "action.hover", border: 1, borderColor: "divider", borderRadius: 1.5, p: 1.5, mb: 1.5 }}>
      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        <TextField select size="small" value={type} onChange={(e) => setType(e.target.value)} sx={{ flex: "0 0 110px" }}>
          {ACTIVITY_TYPES.map((t) => <MenuItem key={t} value={t} sx={{ textTransform: "capitalize" }}>{t}</MenuItem>)}
        </TextField>
        <TextField
          size="small" placeholder="What happened or what's planned?"
          value={subject} onChange={(e) => setSubject(e.target.value)} autoFocus sx={{ flex: 1 }}
        />
        <TextField type="date" size="small" value={dueDate} onChange={(e) => setDueDate(e.target.value)} sx={{ flex: "0 0 140px" }} />
      </Box>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button size="small" variant="outlined" onClick={() => setOpen(false)}>Cancel</Button>
        <Button size="small" type="submit" variant="contained" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
      </Box>
    </Box>
  );
}