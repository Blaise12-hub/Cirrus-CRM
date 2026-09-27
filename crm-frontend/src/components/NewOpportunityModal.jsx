import React, { useState, useMemo, useEffect } from "react";
import { TextField, MenuItem, Alert, Box } from "@mui/material";
import { Modal, ModalActions, FieldRow } from "./Modal";
import { opportunitiesApi, accountsApi, contactsApi } from "../api/resources";

const STAGES = [
  { value: "prospecting", label: "Prospecting" },
  { value: "qualification", label: "Qualification" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export default function NewOpportunityModal({ accounts: initialAccounts, contacts: initialContacts, defaultAccountId, onClose, onCreated }) {
  const [accounts, setAccounts] = useState(initialAccounts || []);
  const [contacts, setContacts] = useState(initialContacts || []);

  useEffect(() => {
    if (!initialAccounts) {
      accountsApi.list().then(setAccounts).catch(() => {});
    }
    if (!initialContacts) {
      contactsApi.list().then(setContacts).catch(() => {});
    }
  }, [initialAccounts, initialContacts]);

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
      if (field === "account_id") return { ...prev, account_id: value, contact_id: "" };
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
      <form onSubmit={submit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField label="Opportunity name" value={form.name} onChange={set("name")} autoFocus placeholder="e.g. Rusizi Textiles — Q3 renewal" />

          <FieldRow>
            <TextField select label="Account" value={form.account_id} onChange={set("account_id")} disabled={!!defaultAccountId}>
              <MenuItem value="">Select account…</MenuItem>
              {accounts.map((a) => (
                <MenuItem key={a.account_id} value={a.account_id}>{a.account_name}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Contact" value={form.contact_id} onChange={set("contact_id")} disabled={!form.account_id}>
              <MenuItem value="">No contact</MenuItem>
              {accountContacts.map((c) => (
                <MenuItem key={c.contact_id} value={c.contact_id}>{c.first_name} {c.last_name}</MenuItem>
              ))}
            </TextField>
          </FieldRow>

          <FieldRow>
            <TextField select label="Stage" value={form.stage} onChange={set("stage")}>
              {STAGES.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Amount" type="number" inputProps={{ min: 0, step: 0.01 }} value={form.amount} onChange={set("amount")} placeholder="0.00" />
          </FieldRow>

          <FieldRow>
            <TextField label="Close date" type="date" InputLabelProps={{ shrink: true }} value={form.close_date} onChange={set("close_date")} />
            <TextField label="Probability (%)" type="number" inputProps={{ min: 0, max: 100 }} value={form.probability} onChange={set("probability")} placeholder="0–100" />
          </FieldRow>
        </Box>

        <ModalActions onCancel={onClose} submitLabel="Create opportunity" submitting={submitting} />
      </form>
    </Modal>
  );
}