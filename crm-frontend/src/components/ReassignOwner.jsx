import React, { useEffect, useState } from "react";
import { Box, Select, MenuItem, IconButton, Typography, CircularProgress } from "@mui/material";
import { Pencil, Check, X } from "lucide-react";
import { accountsApi, contactsApi, opportunitiesApi, usersApi } from "../api/resources";
import { useAuth } from "../context/AuthContext";

// Same assumptions flagged as before: useAuth() shape and each *Api's
// .update(id, data) method — verify against your real files.

const API_MAP = {
  account: accountsApi,
  contact: contactsApi,
  opportunity: opportunitiesApi,
};

export default function ReassignOwner({ entityType, entityId, currentOwnerId, onReassigned }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(currentOwnerId || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canReassign = user && (user.role === "admin" || user.role === "manager");

  useEffect(() => {
    if (!editing || users.length) return;
    usersApi.list().then(setUsers).catch(() => {});
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSelected(currentOwnerId || "");
  }, [currentOwnerId]);

  const currentOwner = users.find((u) => u.user_id === currentOwnerId);
  const ownerLabel = currentOwner ? `${currentOwner.first_name} ${currentOwner.last_name}` : `#${currentOwnerId}`;

  if (!canReassign) {
    return <Typography variant="body2" color="text.secondary">Owner: {ownerLabel}</Typography>;
  }

  const save = async () => {
    if (Number(selected) === Number(currentOwnerId)) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await API_MAP[entityType].update(entityId, { owner_id: Number(selected) });
      onReassigned(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
        <Typography variant="body2" color="text.secondary">Owner: {ownerLabel}</Typography>
        <IconButton size="small" onClick={() => setEditing(true)} title="Reassign owner" sx={{ opacity: 0.6, "&:hover": { opacity: 1 } }}>
          <Pencil size={12} />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      {error && <Typography variant="body2" color="error" sx={{ mr: 1 }}>{error}</Typography>}
      <Select
        size="small"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={saving}
        sx={{ fontSize: 13, minWidth: 140 }}
      >
        {users.map((u) => (
          <MenuItem key={u.user_id} value={u.user_id}>{u.first_name} {u.last_name}</MenuItem>
        ))}
      </Select>
      <IconButton size="small" onClick={save} disabled={saving} title="Save" color="primary">
        {saving ? <CircularProgress size={14} /> : <Check size={14} />}
      </IconButton>
      <IconButton
        size="small"
        onClick={() => { setEditing(false); setSelected(currentOwnerId); setError(""); }}
        disabled={saving}
        title="Cancel"
      >
        <X size={14} />
      </IconButton>
    </Box>
  );
}