import React, { useState } from "react";
import { TextField, MenuItem, Alert, Box } from "@mui/material";
import { Modal, ModalActions, FieldRow } from "./Modal";
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
        account_id: form.account_id || null,
      });
      onCreated(created);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New contact" onClose={onClose}>
      <form onSubmit={submit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FieldRow>
            <TextField label="First name" value={form.first_name} onChange={set("first_name")} autoFocus />
            <TextField label="Last name" value={form.last_name} onChange={set("last_name")} />
          </FieldRow>


          <TextField select label="Account" value={form.account_id} onChange={set("account_id")}>
            <MenuItem value="">No account (standalone contact)</MenuItem>
            {accounts.map((a) => (
              <MenuItem key={a.account_id} value={a.account_id}>{a.account_name}</MenuItem>
            ))}
          </TextField>

          <TextField label="Job title" value={form.job_title} onChange={set("job_title")} placeholder="e.g. Operations Manager" />

          <FieldRow>
            <TextField label="Email" type="email" value={form.email} onChange={set("email")} />
            <TextField label="Phone" value={form.phone} onChange={set("phone")} />
          </FieldRow>
        </Box>

        <ModalActions onCancel={onClose} submitLabel="Create contact" submitting={submitting} />
      </form>
    </Modal>
  );
}