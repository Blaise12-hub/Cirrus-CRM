import React, { useState } from "react";
import { Modal, Field, ModalActions } from "./Modal";
import { productsApi } from "../api/resources";

// Pass `product` for edit mode, omit for create mode.
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
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={submit}>
        <Field label="Product name">
          <input value={form.name} onChange={set("name")} autoFocus placeholder="e.g. CRM Pro License" />
        </Field>
        <Field label="Price">
          <input type="number" min="0" step="0.01" value={form.price} onChange={set("price")} placeholder="0.00" />
        </Field>
        <Field label="Description">
          <input value={form.description} onChange={set("description")} placeholder="Optional" />
        </Field>
        <ModalActions onCancel={onClose} submitLabel={isEdit ? "Save changes" : "Create product"} submitting={submitting} />
      </form>
    </Modal>
  );
}
