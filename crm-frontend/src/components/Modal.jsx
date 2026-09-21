import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button, Box } from "@mui/material";
import { X } from "lucide-react";

// Same external API as before (title, onClose, children) — existing callers
// that only use <Modal> don't need to change. <Field> is gone though: MUI's
// TextField/Select already carry their own label, so the wrapper pattern
// doesn't map cleanly anymore. Every modal that used <Field> needs its
// inputs swapped for <TextField>/<Select> directly — see NewContactModal.jsx
// for the converted pattern to copy into the others.
export function Modal({ title, onClose, children, maxWidth = "xs" }) {
  return (
    <Dialog open onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 600 }}>
        {title}
        <IconButton size="small" onClick={onClose}><X size={16} /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// Not every modal needs Dialog's built-in DialogActions divider styling, so
// this stays a thin convenience wrapper rather than folding into <Modal>.
export function ModalActions({ onCancel, submitLabel = "Save", submitting = false }) {
  return (
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button variant="outlined" onClick={onCancel} disabled={submitting}>Cancel</Button>
      <Button type="submit" variant="contained" disabled={submitting}>
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </DialogActions>
  );
}

// Small helper for laying out two fields side by side (replaces .field-row)
export function FieldRow({ children }) {
  return <Box sx={{ display: "flex", gap: 1.5 }}>{children}</Box>;
}