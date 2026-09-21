import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, TextField, Button, Alert, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-root">
      <Box className="login-card">
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          Cirrus <Box component="span" sx={{ color: "primary.main" }}>CRM</Box>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>Sign in to your account</Typography>

        <Box component="form" onSubmit={submit} sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
          <TextField
            label="Email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com" autoFocus required
          />
          <TextField
            label="Password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" required
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 0.5 }}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2.5 }}>
          Don't have an account? <Link to="/signup" style={{ color: "inherit", fontWeight: 600, textDecoration: "underline" }}>Sign up</Link>
        </Typography>
      </Box>
    </Box>
  );
}