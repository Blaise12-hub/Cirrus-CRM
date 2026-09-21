import React, { useState } from "react";
import { TextField, Alert, Box } from "@mui/material";
import { Modal, ModalActions } from "./Modal";
import { productsApi } from "../api/resources";

export default function ProductModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || "",
    price: product?.price ?? "",
    description: product?.description || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (form.price === "" || Number(form.price) < 0) {
      setError("Price must be a positive number");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = { name: form.name, price: Number(form.price), description: form.description || null };
      const saved = isEdit
        ? await productsApi.update(product.product_id, payload)
        : await productsApi.create(payload);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit product" : "New product"} onClose={onClose}>
      <form onSubmit={submit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Product name" value={form.name} onChange={set("name")} autoFocus placeholder="e.g. CRM Pro License" />
          <TextField label="Price" type="number" inputProps={{ min: 0, step: 0.01 }} value={form.price} onChange={set("price")} placeholder="0.00" />
          <TextField label="Description" value={form.description} onChange={set("description")} placeholder="Optional" />
        </Box>
        <ModalActions onCancel={onClose} submitLabel={isEdit ? "Save changes" : "Create product"} submitting={submitting} />
      </form>
    </Modal>
  );
}