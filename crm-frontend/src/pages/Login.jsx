import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography, Alert, CircularProgress, Button } from "@mui/material";
import { Eye, EyeOff, Building2, Users, Target, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, validateLogin, showDemoLogins } from "../utils/loginForm";

// All colors are CSS variables from index.css (mirrors src/design/tokens.js),
// so this page follows light/dark mode and the evergreen palette automatically.
const inputStyle = {
  width: "100%",
  height: 44,
  padding: "0 14px",
  fontSize: 14,
  color: "var(--color-text)",
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  outline: "none",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  fontFamily: "inherit",
};

const focusRing = (e) => {
  e.target.style.borderColor = "var(--color-primary)";
  e.target.style.boxShadow = "0 0 0 3px var(--color-primary-tint)";
};
const blurRing = (e) => {
  e.target.style.borderColor = "var(--color-border)";
  e.target.style.boxShadow = "none";
};

const labelSx = { display: "block", fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.75 };

function ModelTile({ icon: Icon, label }) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 1,
        p: 1.5,
        borderRadius: 2,
        bgcolor: "var(--sidebar-active)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Box sx={{ color: "var(--color-accent)", display: "flex" }}>
        <Icon size={18} />
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{label}</Typography>
    </Box>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const demoEnabled = showDemoLogins(import.meta.env);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validateLogin(email, password);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your login details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: { xs: "column", md: "row" }, bgcolor: "background.default" }}>
      {/* Left: brand panel (hidden on phones) */}
      <Box
        sx={{
          flex: { md: "0 0 44%" },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: { md: 5, lg: 7 },
          bgcolor: "var(--sidebar-bg)",
          color: "#fff",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em" }}>
          Cirrus <Box component="span" sx={{ color: "var(--color-accent)" }}>CRM</Box>
        </Typography>

        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-accent)", mb: 1.5 }}>
            Sales workspace
          </Typography>
          <Typography component="h2" sx={{ fontSize: { md: 34, lg: 40 }, fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.02em", mb: 2 }}>
            Every relationship.
            <br />
            One connected view.
          </Typography>
          <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: "var(--sidebar-text)", maxWidth: 420, mb: 4 }}>
            Accounts, contacts and deals in one place, so your team always knows what to do next.
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, maxWidth: 440 }}>
            <ModelTile icon={Building2} label="Account" />
            <Box sx={{ color: "var(--sidebar-text-muted)", display: "flex" }}><ArrowRight size={16} /></Box>
            <ModelTile icon={Users} label="Contact" />
            <Box sx={{ color: "var(--sidebar-text-muted)", display: "flex" }}><ArrowRight size={16} /></Box>
            <ModelTile icon={Target} label="Opportunity" />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "var(--sidebar-text-muted)", fontSize: 12.5 }}>
          <ShieldCheck size={14} />
          <span>Role-based access for admins, managers and sales reps.</span>
        </Box>
      </Box>

      {/* Right: sign-in form */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 3, sm: 5 } }}>
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Typography sx={{ display: { xs: "block", md: "none" }, fontWeight: 700, fontSize: 18, mb: 3 }}>
            Cirrus <Box component="span" sx={{ color: "primary.main" }}>CRM</Box>
          </Typography>

          <Typography component="h1" sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, mb: 0.75 }}>
            Welcome back
          </Typography>
          <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 3.5 }}>
            Sign in to your sales workspace.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert severity="error" sx={{ mb: 2.5, fontSize: 13 }} role="alert">
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 2.25 }}>
              <Typography component="label" htmlFor="auth-email" sx={labelSx}>
                Email address
              </Typography>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="username"
                autoFocus
                required
                style={inputStyle}
                onFocus={focusRing}
                onBlur={blurRing}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography component="label" htmlFor="auth-password" sx={labelSx}>
                Password
              </Typography>
              <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                  style={{ ...inputStyle, padding: "0 46px 0 14px" }}
                  onFocus={focusRing}
                  onBlur={blurRing}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: 12,
                    background: "none",
                    border: "none",
                    padding: 6,
                    cursor: "pointer",
                    display: "flex",
                    color: showPassword ? "var(--color-primary)" : "var(--color-text-muted)",
                    borderRadius: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </Box>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ height: 44, fontSize: 14, fontWeight: 700, borderRadius: "8px" }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={18} color="inherit" />
                  <span>Signing in…</span>
                </Box>
              ) : (
                "Sign in"
              )}
            </Button>
          </Box>

          <Typography sx={{ mt: 3, textAlign: "center", fontSize: 13, color: "text.secondary" }}>
            First time here?{" "}
            <Link to="/signup" style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "underline" }}>
              Sign up
            </Link>{" "}
            instead.
          </Typography>

          {demoEnabled && (
            <Box sx={{ mt: 3.5, pt: 2.5, borderTop: "1px dashed", borderColor: "divider", display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Quick 1-click demo logins
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {DEMO_ACCOUNTS.map((a) => (
                  <Box
                    key={a.email}
                    component="button"
                    type="button"
                    onClick={() => handleDemoFill(a.email)}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "6px",
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "text.primary",
                      fontFamily: "inherit",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      "&:hover": { borderColor: "primary.main", color: "primary.main" },
                    }}
                  >
                    {a.label}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}