import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { usersApi } from "../api/resources";
import { DataTable } from "../components/Shared";
import { Modal, Field, ModalActions } from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const ROLES = ["admin", "manager", "sales_rep"];

function StatusPill({ active }) {
  return (
    <span
      className="stage-pill"
      style={{ background: active ? "#2E7D461A" : "#B3261E1A", color: active ? "#2E7D46" : "#B3261E" }}
    >
      {active ? "Active" : "Deactivated"}
    </span>
  );
}

//FORM FOR CREATING NEW USER
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
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="field-row">
          <Field label="First name">
            <input value={form.first_name} onChange={set("first_name")} autoFocus />
          </Field>
          <Field label="Last name">
            <input value={form.last_name} onChange={set("last_name")} />
          </Field>
        </div>
        <Field label="Email">
          <input type="email" value={form.email} onChange={set("email")} />
        </Field>
        <Field label="Temporary password">
          <input type="password" value={form.password} onChange={set("password")} placeholder="At least 8 characters" />
        </Field>
        <Field label="Role">
          <select value={form.role} onChange={set("role")}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <ModalActions onCancel={onClose} submitLabel="Create user" submitting={submitting} />
      </form>
    </Modal>
  );
}

// Edit an existing user's role 
// --the field that actually matters day to day (name/email edits are rare enough not to need their own page yet).
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
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={submit}>
        <Field label="Role">
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
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
    <div className="view">
      <div className="pb-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Users</h1>
        <button className="btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} /> New user
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}
      {actionError && <div className="form-error">{actionError}</div>}

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
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-convert" onClick={(e) => { e.stopPropagation(); setEditingUser(r); }}>
                  Edit role
                </button>
                <button
                  className="btn-convert"
                  style={r.is_active ? { borderColor: "#B3261E", color: "#B3261E" } : {}}
                  disabled={r.user_id === currentUser.user_id}
                  title={r.user_id === currentUser.user_id ? "You can't deactivate your own account" : ""}
                  onClick={(e) => { e.stopPropagation(); toggleActive(r); }}
                >
                  {r.is_active ? "Deactivate" : "Reactivate"}
                </button>
              </div>
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
    </div>
  );
}
