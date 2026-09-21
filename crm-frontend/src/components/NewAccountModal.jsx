import React, { useState } from "react";
import { Modal, ModalActions, FieldRow } from "./Modal";
import { TextField, Box, Alert } from "@mui/material";
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
      <form onSubmit={submit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Account name"
            value={form.account_name}
            onChange={set("account_name")}
            placeholder="e.g. Kivu Logistics"
            autoFocus
          />

          <TextField
            label="Industry"
            value={form.industry}
            onChange={set("industry")}
            placeholder="e.g. Transportation"
          />

          <FieldRow>
            <TextField label="Phone" value={form.phone} onChange={set("phone")} placeholder="+250 788 000 000" />
            <TextField label="Website" value={form.website} onChange={set("website")} placeholder="example.com" />
          </FieldRow>
        </Box>

        <ModalActions onCancel={onClose} submitLabel="Create account" submitting={submitting} />
      </form>
    </Modal>
  );
}