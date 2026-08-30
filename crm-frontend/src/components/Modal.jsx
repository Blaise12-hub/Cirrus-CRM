import React from "react";
import { X } from "lucide-react";

//modal
export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>{title}</span>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// Labeled field wrapper -- keeps every form's markup identical so the CSS
// (.modal-body label / input / select rules) applies consistently.
export function Field({ label, children }) {
  return (
    <label className="field-label">
      {label}
      {children}
    </label>
  );
}

//submit button
export function ModalActions({ onCancel, submitLabel = "Save", submitting = false }) {
  return (
    <div className="modal-actions">
      <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
        Cancel
      </button>
      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}
