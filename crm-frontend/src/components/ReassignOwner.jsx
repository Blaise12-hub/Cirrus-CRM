import React, { useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { accountsApi, contactsApi, opportunitiesApi, usersApi } from "../api/resources";
import { useAuth } from "../context/AuthContext";

// ASSUMPTIONS — verify against your actual files:
//   1. useAuth() (from AuthContext.jsx) returns { user } where user.role is
//      "admin" | "manager" | "sales_rep".
//   2. accountsApi / contactsApi / opportunitiesApi each expose
//      .update(id, data) -> PATCH /:id, separate from opportunitiesApi.updateStage().
// If either name differs in your code, swap it here — everything else works as-is.

const API_MAP = {
  account: accountsApi,
  contact: contactsApi,
  opportunity: opportunitiesApi,
};

// entityType: "account" | "contact" | "opportunity"
// entityId: numeric id of the record being reassigned
// currentOwnerId: current owner_id on that record
// onReassigned: called with the updated record after a successful save
//   (pass your page's setAccount/setContact/setOpp so the UI reflects it immediately)
export default function ReassignOwner({ entityType, entityId, currentOwnerId, onReassigned }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(currentOwnerId || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canReassign = user && (user.role === "admin" || user.role === "manager");

  // Load the assignable user list lazily, only when someone actually opens
  // the editor — avoids an extra request on every detail-page view.
  useEffect(() => {
    if (!editing || users.length) return;
    usersApi.list().then(setUsers).catch(() => {});
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSelected(currentOwnerId || "");
  }, [currentOwnerId]);

  const currentOwner = users.find((u) => u.user_id === currentOwnerId);

  // sales_rep: read-only owner display, no edit affordance
  if (!canReassign) {
    return (
      <span className="owner-display">
        Owner: {currentOwner ? `${currentOwner.first_name} ${currentOwner.last_name}` : `#${currentOwnerId}`}
      </span>
    );
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
      <span className="owner-display">
        Owner: {currentOwner ? `${currentOwner.first_name} ${currentOwner.last_name}` : `#${currentOwnerId}`}
        <button className="icon-btn owner-edit-btn" onClick={() => setEditing(true)} title="Reassign owner">
          <Pencil size={12} />
        </button>
      </span>
    );
  }

  return (
    <span className="owner-reassign">
      {error && <span className="form-error" style={{ marginRight: 8 }}>{error}</span>}
      <select value={selected} onChange={(e) => setSelected(e.target.value)} disabled={saving}>
        {users.map((u) => (
          <option key={u.user_id} value={u.user_id}>{u.first_name} {u.last_name}</option>
        ))}
      </select>
      <button className="icon-btn" onClick={save} disabled={saving} title="Save">
        <Check size={14} />
      </button>
      <button
        className="icon-btn"
        onClick={() => { setEditing(false); setSelected(currentOwnerId); setError(""); }}
        disabled={saving}
        title="Cancel"
      >
        <X size={14} />
      </button>
    </span>
  );
}
//skeleton here