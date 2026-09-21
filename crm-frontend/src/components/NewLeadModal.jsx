import React, { useState } from "react";
import { TextField, MenuItem, Alert, Box } from "@mui/material";
import { Modal, ModalActions, FieldRow } from "./Modal";
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
      <form onSubmit={submit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FieldRow>
            <TextField label="First name" value={form.first_name} onChange={set("first_name")} autoFocus />
            <TextField label="Last name" value={form.last_name} onChange={set("last_name")} />
          </FieldRow>

          <TextField label="Company" value={form.company_name} onChange={set("company_name")} placeholder="e.g. Rusizi Textiles" />

          <FieldRow>
            <TextField label="Email" type="email" value={form.email} onChange={set("email")} />
            <TextField label="Phone" value={form.phone} onChange={set("phone")} />
          </FieldRow>

          <TextField select label="Lead source" value={form.lead_source} onChange={set("lead_source")}>
            <MenuItem value="">Select source…</MenuItem>
            <MenuItem value="Website">Website</MenuItem>
            <MenuItem value="Referral">Referral</MenuItem>
            <MenuItem value="Cold Call">Cold Call</MenuItem>
            <MenuItem value="Trade Show">Trade Show</MenuItem>
            <MenuItem value="Social Media">Social Media</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        </Box>

        <ModalActions onCancel={onClose} submitLabel="Create lead" submitting={submitting} />
      </form>
    </Modal>
  );
}