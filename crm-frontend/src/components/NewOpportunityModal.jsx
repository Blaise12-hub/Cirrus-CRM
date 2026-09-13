import React, { useState, useMemo } from "react";
import { Modal, Field, ModalActions } from "./Modal";
import { opportunitiesApi } from "../api/resources";

const STAGES = [
  { value: "prospecting", label: "Prospecting" },
  { value: "qualification", label: "Qualification" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

// accounts: full account list (account_id NOT NULL on opportunities, so required)
// contacts: full contact list — filtered client-side to the selected account
// defaultAccountId: optional, pass this when opening from an AccountDetail page
export default function NewOpportunityModal({ accounts, contacts, defaultAccountId, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    account_id: defaultAccountId || "",
    contact_id: "",
    stage: "prospecting",
    amount: "",
    close_date: "",
    probability: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      // switching account invalidates any previously chosen contact from a different account
      if (field === "account_id") {
        return { ...prev, account_id: value, contact_id: "" };
      }
      return { ...prev, [field]: value };
    });
  };

  const accountContacts = useMemo(
    () => contacts.filter((c) => c.account_id === form.account_id),
    [contacts, form.account_id]
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Opportunity name is required");
      return;
    }
    if (!form.account_id) {
      setError("Account is required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const created = await opportunitiesApi.create({
        name: form.name,
        account_id: form.account_id,
        contact_id: form.contact_id || null,
        stage: form.stage,
        amount: form.amount === "" ? null : Number(form.amount),
        close_date: form.close_date || null,
        probability: form.probability === "" ? null : Number(form.probability),
      });
      onCreated(created);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New opportunity" onClose={onClose}>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={submit}>
        <Field label="Opportunity name">
          <input value={form.name} onChange={set("name")} autoFocus placeholder="e.g. Rusizi Textiles — Q3 renewal" />
        </Field>

        <div className="field-row">
          <Field label="Account">
            <select value={form.account_id} onChange={set("account_id")} disabled={!!defaultAccountId}>
              <option value="">Select account…</option>
              {accounts.map((a) => (
                <option key={a.account_id} value={a.account_id}>{a.account_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Contact">
            <select value={form.contact_id} onChange={set("contact_id")} disabled={!form.account_id}>
              <option value="">No contact</option>
              {accountContacts.map((c) => (
                <option key={c.contact_id} value={c.contact_id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="field-row">
          <Field label="Stage">
            <select value={form.stage} onChange={set("stage")}>
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Amount">
            <input type="number" min="0" step="0.01" value={form.amount} onChange={set("amount")} placeholder="0.00" />
          </Field>
        </div>

        <div className="field-row">
          <Field label="Close date">
            <input type="date" value={form.close_date} onChange={set("close_date")} />
          </Field>
          <Field label="Probability (%)">
            <input type="number" min="0" max="100" value={form.probability} onChange={set("probability")} placeholder="0–100" />
          </Field>
        </div>

        <ModalActions onCancel={onClose} submitLabel="Create opportunity" submitting={submitting} />
      </form>
    </Modal>
  );
}
