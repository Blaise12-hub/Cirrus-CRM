import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography, Alert, CircularProgress, Button } from "@mui/material";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { authApi } from "../api/resources";
import { useAuth } from "../context/AuthContext";
import AuthIllustration from "../components/AuthIllustration";

export default function SignUp() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      await login(form.email.trim(), form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#002050",
        p: { xs: 2, sm: 3, md: 4 },
        background: "linear-gradient(135deg, #00173D 0%, #002050 60%, #0A3E7A 100%)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1040,
          minHeight: 600,
          bgcolor: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 25px 60px -15px rgba(0, 15, 45, 0.45)",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        {/* Left Side: Modern Brand Illustration */}
        <Box
          sx={{
            flex: { md: "1 1 45%" },
            bgcolor: "#F4F8FA",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            borderRight: "1px solid #E6EEF3",
            position: "relative",
          }}
        >
          <AuthIllustration brandTitle="CIRRUS CRM" />
        </Box>

        {/* Right Side: Pro Sign-Up Form */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 55%" },
            p: { xs: 3.5, sm: 4.5, md: "40px 48px" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            bgcolor: "#FFFFFF",
          }}
        >
          <Box sx={{ mb: 2.5 }}>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 22, sm: 26 },
                fontWeight: 800,
                color: "#1E293B",
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
                mb: 0.75,
              }}
            >
              Create your Cirrus CRM account
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>
              Join thousands of high-performing teams scaling revenue pipelines.
            </Typography>
          </Box>

          <Box component="form" onSubmit={submit} noValidate>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: "8px", fontSize: 13, py: 0.5 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 1.5, mb: 1.75 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#334155", mb: 0.5 }}>
                  First name
                </Typography>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={set("first_name")}
                  placeholder="Jane"
                  required
                  autoFocus
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 12px",
                    fontSize: 14,
                    color: "#1E293B",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#334155", mb: 0.5 }}>
                  Last name
                </Typography>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={set("last_name")}
                  placeholder="Doe"
                  required
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 12px",
                    fontSize: 14,
                    color: "#1E293B",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ mb: 1.75 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#334155", mb: 0.5 }}>
                Work email
              </Typography>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="jane@company.com"
                required
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 12px",
                  fontSize: 14,
                  color: "#1E293B",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "8px",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </Box>

            <Box sx={{ mb: 1.75 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#334155", mb: 0.5 }}>
                Password (min 8 characters)
              </Typography>
              <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 42px 0 12px",
                    fontSize: 14,
                    color: "#1E293B",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    outline: "none",
                    fontFamily: "inherit",
                    letterSpacing: showPassword ? "normal" : "2px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 8,
                    background: "none",
                    border: "none",
                    padding: 6,
                    cursor: "pointer",
                    color: showPassword ? "#0C5A75" : "#94A3B8",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Box>
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#334155", mb: 0.5 }}>
                Confirm password
              </Typography>
              <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirm}
                  onChange={set("confirm")}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 42px 0 12px",
                    fontSize: 14,
                    color: "#1E293B",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    outline: "none",
                    fontFamily: "inherit",
                    letterSpacing: showConfirm ? "normal" : "2px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: 8,
                    background: "none",
                    border: "none",
                    padding: 6,
                    cursor: "pointer",
                    color: showConfirm ? "#0C5A75" : "#94A3B8",
                  }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Box>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                height: 42,
                bgcolor: "#0C5A75",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(12, 90, 117, 0.25)",
                "&:hover": { bgcolor: "#084459" },
              }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={18} color="inherit" />
                  <span>Creating account…</span>
                </Box>
              ) : (
                "Create Account"
              )}
            </Button>
          </Box>

          <Box sx={{ mt: 2.5, textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#0C5A75", fontWeight: 700, textDecoration: "underline" }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}