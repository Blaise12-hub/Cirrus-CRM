import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, TextField, Button, Alert, Typography } from "@mui/material";
import { authApi } from "../api/resources";
import { useAuth } from "../context/AuthContext";

// authApi.register(data) itself is still an assumption (haven't seen
// auth.routes.js or api/resources.js) — but the login-after-register flow
// is now confirmed correct: it reuses the exact same login(email, password)
// your real Login.jsx uses, rather than guessing at a different shape.
// No role field is sent — see chat note on why a public signup form must
// not let someone pick their own role.
export default function SignUp() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || !form.password) {
      setError("All fields are required");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authApi.register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      });
      // Reuses the same login() your Login.jsx uses — same credentials,
      // same auth flow, no separate token-handling logic to get wrong.
      await login(form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
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
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>Create your account</Typography>

        <Box component="form" onSubmit={submit} sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <TextField label="First name" value={form.first_name} onChange={set("first_name")} autoFocus />
            <TextField label="Last name" value={form.last_name} onChange={set("last_name")} />
          </Box>
          <TextField label="Email" type="email" value={form.email} onChange={set("email")} />
          <TextField label="Password" type="password" value={form.password} onChange={set("password")} />
          <TextField label="Confirm password" type="password" value={form.confirm} onChange={set("confirm")} />
          <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 0.5 }}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2.5 }}>
          Already have an account? <Link to="/login" style={{ color: "inherit", fontWeight: 600, textDecoration: "underline" }}>Log in</Link>
        </Typography>
      </Box>
    </Box>
  );
}