import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert, Slide } from "@mui/material";

const SnackbarContext = createContext(null);

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used inside SnackbarProvider");
  return ctx;
}

function SlideUp(props) {
  return <Slide {...props} direction="up" />;
}

export default function SnackbarProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error" | "info" | "warning"
    duration: 4000,
  });

  const showSnackbar = useCallback((message, severity = "success", opts = {}) => {
    setState({
      open: true,
      message,
      severity,
      duration: opts.duration ?? 4000,
    });
  }, []);

  const handleClose = useCallback((_, reason) => {
    if (reason === "clickaway") return;
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={state.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        TransitionComponent={SlideUp}
        sx={{ mb: 1 }}
      >
        <Alert
          onClose={handleClose}
          severity={state.severity}
          variant="filled"
          elevation={6}
          sx={{
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 2,
            minWidth: 280,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
