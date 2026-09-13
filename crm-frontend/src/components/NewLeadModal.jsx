import React, { useState } from "react";
import { Modal, Field, ModalActions } from "./Modal";
import { leadsApi } from "../api/resources";

export default function NewLeadModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", company_name: "", lead_source: "",
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
      // status isn't sent — leads start as "new" by default on the backend,
      // matching the schema's status CHECK and the existing convert flow.
      const created = await leadsApi.create({
        ...form,
        company_name: form.company_name || null,
        lead_source: form.lead_source || null,
      });
      onCreated(created);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New lead" onClose={onClose}>
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
        <Field label="Company">
          <input value={form.company_name} onChange={set("company_name")} placeholder="e.g. Rusizi Textiles" />
        </Field>
        <div className="field-row">
          <Field label="Email">
            <input type="email" value={form.email} onChange={set("email")} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={set("phone")} />
          </Field>
        </div>
        <Field label="Lead source">
          <select value={form.lead_source} onChange={set("lead_source")}>
            <option value="">Select source…</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Cold Call">Cold Call</option>
            <option value="Trade Show">Trade Show</option>
            <option value="Social Media">Social Media</option>
            <option value="Other">Other</option>
          </select>
        </Field>
        <ModalActions onCancel={onClose} submitLabel="Create lead" submitting={submitting} />
      </form>
    </Modal>
  );
}




