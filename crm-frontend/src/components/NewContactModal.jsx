import React, { useState } from "react";
import { Modal, Field, ModalActions } from "./Modal";
import { contactsApi } from "../api/resources";

export default function NewContactModal({ accounts, onClose, onCreated }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", job_title: "", account_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First and last name are required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const created = await contactsApi.create({
        ...form,
        account_id: form.account_id || null, // contacts don't require an account (see schema)
      });
      onCreated(created);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New contact" onClose={onClose}>
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
        <Field label="Account">
          <select value={form.account_id} onChange={set("account_id")}>
            <option value="">No account (standalone contact)</option>
            {accounts.map((a) => (
              <option key={a.account_id} value={a.account_id}>{a.account_name}</option>
            ))}
          </select>
        </Field>
        <Field label="Job title">
          <input value={form.job_title} onChange={set("job_title")} placeholder="e.g. Operations Manager" />
        </Field>
        <div className="field-row">
          <Field label="Email">
            <input type="email" value={form.email} onChange={set("email")} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={set("phone")} />
          </Field>
        </div>
        <ModalActions onCancel={onClose} submitLabel="Create contact" submitting={submitting} />
      </form>
    </Modal>
  );
}
