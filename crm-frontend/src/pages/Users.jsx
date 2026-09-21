import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Chip, Alert, MenuItem, TextField } from "@mui/material";
import { Plus } from "lucide-react";
import { usersApi } from "../api/resources";
import { DataTable } from "../components/Shared";
import { Modal, FieldRow, ModalActions } from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const ROLES = ["admin", "manager", "sales_rep"];

function StatusPill({ active }) {
  return (
    <Chip
      label={active ? "Active" : "Deactivated"}
      size="small"
      color={active ? "success" : "error"}
      variant={active ? "filled" : "outlined"}
    />
  );
}

function NewUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", role: "sales_rep" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || form.password.length < 8) {
      setError("First name, last name, email, and an 8+ character password are all required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const created = await usersApi.create(form);
      onCreated(created);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New user" onClose={onClose}>
      <form onSubmit={submit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <FieldRow>
            <TextField label="First name" value={form.first_name} onChange={set("first_name")} autoFocus />
            <TextField label="Last name" value={form.last_name} onChange={set("last_name")} />
          </FieldRow>
          <TextField label="Email" type="email" value={form.email} onChange={set("email")} />
          <TextField label="Temporary password" type="password" value={form.password} onChange={set("password")} placeholder="At least 8 characters" />
          <TextField select label="Role" value={form.role} onChange={set("role")}>
            {ROLES.map((role) => <MenuItem key={role} value={role} sx={{ textTransform: "capitalize" }}>{role}</MenuItem>)}
          </TextField>
        </Box>
        <ModalActions onCancel={onClose} submitLabel="Create user" submitting={submitting} />
      </form>
    </Modal>
  );
}

function EditRoleModal({ targetUser, onClose, onSaved }) {
  const [role, setRole] = useState(targetUser.role);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const updated = await usersApi.update(targetUser.user_id, { role });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal title={`Edit role — ${targetUser.first_name} ${targetUser.last_name}`} onClose={onClose}>
      <form onSubmit={submit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((roleOption) => <MenuItem key={roleOption} value={roleOption} sx={{ textTransform: "capitalize" }}>{roleOption}</MenuItem>)}
          </TextField>
        </Box>
        <ModalActions onCancel={onClose} submitLabel="Save" submitting={submitting} />
      </form>
    </Modal>
  );
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [actionError, setActionError] = useState("");

  const load = () => {
    setLoading(true);
    usersApi.list().then(setUsers).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleActive = async (u) => {
    setActionError("");
    try {
      const updated = u.is_active
        ? await usersApi.deactivate(u.user_id)
        : await usersApi.update(u.user_id, { is_active: true });
      setUsers((prev) => prev.map((x) => (x.user_id === updated.user_id ? { ...x, ...updated } : x)));
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <Box className="view">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Users</Typography>
        <Button variant="contained" startIcon={<Plus size={14} />} onClick={() => setShowNew(true)}>
          New user
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
      {actionError && <Alert severity="error" sx={{ mb: 1.5 }}>{actionError}</Alert>}

      <DataTable
        loading={loading}
        emptyMessage="No users yet."
        columns={[
          { key: "name", label: "Name", render: (r) => <strong>{r.first_name} {r.last_name}</strong> },
          { key: "email", label: "Email" },
          { key: "role", label: "Role", render: (r) => <span style={{ textTransform: "capitalize" }}>{r.role}</span> },
          { key: "status", label: "Status", render: (r) => <StatusPill active={r.is_active} /> },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); setEditingUser(r); }}>
                  Edit role
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color={r.is_active ? "error" : "primary"}
                  disabled={r.user_id === currentUser.user_id}
                  title={r.user_id === currentUser.user_id ? "You can't deactivate your own account" : ""}
                  onClick={(e) => { e.stopPropagation(); toggleActive(r); }}
                >
                  {r.is_active ? "Deactivate" : "Reactivate"}
                </Button>
              </Box>
            ),
          },
        ]}
        rows={users}
      />

      {showNew && (
        <NewUserModal
          onClose={() => setShowNew(false)}
          onCreated={(created) => { setUsers((prev) => [...prev, created]); setShowNew(false); }}
        />
      )}
      {editingUser && (
        <EditRoleModal
          targetUser={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={(updated) => {
            setUsers((prev) => prev.map((u) => (u.user_id === updated.user_id ? { ...u, ...updated } : u)));
            setEditingUser(null);
          }}
        />
      )}
    </Box>
  );
}