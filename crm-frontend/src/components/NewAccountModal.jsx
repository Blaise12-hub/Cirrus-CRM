import React, { useState } from "react";
import { Modal, Field, ModalActions } from "./Modal";
import { accountsApi } from "../api/resources";

export default function NewAccountModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ account_name: "", industry: "", phone: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.account_name.trim()) {
      setError("Account name is required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const created = await accountsApi.create(form);
      onCreated(created);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New account" onClose={onClose}>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={submit}>
        <Field label="Account name">
          <input value={form.account_name} onChange={set("account_name")} placeholder="e.g. Kivu Logistics" autoFocus />
        </Field>
        <Field label="Industry">
          <input value={form.industry} onChange={set("industry")} placeholder="e.g. Transportation" />
        </Field>
        <div className="field-row">
          <Field label="Phone">
            <input value={form.phone} onChange={set("phone")} placeholder="+250 788 000 000" />
          </Field>
          <Field label="Website">
            <input value={form.website} onChange={set("website")} placeholder="example.com" />
          </Field>
        </div>
        <ModalActions onCancel={onClose} submitLabel="Create account" submitting={submitting} />
      </form>
    </Modal>
  );
}
  