import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Typography, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from "@mui/material";
import { Eye, EyeOff, Mail, Phone, Lock, Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthIllustration from "../components/AuthIllustration";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [authMode, setAuthMode] = useState("email"); // "email" | "phone"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password modal
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const loginIdentifier = authMode === "email" ? email.trim() : phone.trim();
    if (!loginIdentifier) {
      setError(authMode === "email" ? "Please enter your email address" : "Please enter your phone number");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      // If phone was entered, in CRM mock we authenticate with the email or identifier
      await login(loginIdentifier, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your login details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoRole) => {
    setAuthMode("email");
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setForgotOpen(false);
      setForgotEmail("");
    }, 2500);
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
      {/* Outer Container matching Prototype Image 1 */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 1040,
          minHeight: 580,
          bgcolor: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 25px 60px -15px rgba(0, 15, 45, 0.45)",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        {/* Left Side: Modern Brand Illustration Panel (Image 1) */}
        <Box
          sx={{
            flex: { md: "1 1 50%" },
            bgcolor: "#F4F8FA",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            borderRight: "1px solid #E6EEF3",
            position: "relative",
          }}
        >
          <AuthIllustration brandTitle="CIRRUS CRM" />
        </Box>

        {/* Right Side: Clean Pro Sign-In Form (Image 1) */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 50%" },
            p: { xs: 3.5, sm: 5, md: "48px 52px" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            bgcolor: "#FFFFFF",
          }}
        >
          {/* Header Title & Subtitle */}
          <Box sx={{ mb: 3 }}>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 24, sm: 27 },
                fontWeight: 800,
                color: "#1E293B",
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
                mb: 1,
              }}
            >
              Welcome to Cirrus CRM !!
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                color: "#64748B",
                lineHeight: 1.5,
              }}
            >
              An Embedded professional/ leadership development Platform
            </Typography>
          </Box>

          {/* Email / Phone Tabs matching Image 1 */}
          <Box
            sx={{
              display: "flex",
              borderBottom: "1px solid #E2E8F0",
              mb: 3,
              gap: 4,
            }}
          >
            <Box
              onClick={() => { setAuthMode("email"); setError(""); }}
              sx={{
                pb: 1.25,
                cursor: "pointer",
                position: "relative",
                fontSize: 14,
                fontWeight: authMode === "email" ? 700 : 500,
                color: authMode === "email" ? "#0C5A75" : "#94A3B8",
                transition: "all 0.2s ease",
                "&:after": authMode === "email" ? {
                  content: '""',
                  position: "absolute",
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: "2.5px",
                  bgcolor: "#0C5A75",
                  borderRadius: "2px",
                } : {},
              }}
            >
              Email
            </Box>
            <Box
              onClick={() => { setAuthMode("phone"); setError(""); }}
              sx={{
                pb: 1.25,
                cursor: "pointer",
                position: "relative",
                fontSize: 14,
                fontWeight: authMode === "phone" ? 700 : 500,
                color: authMode === "phone" ? "#0C5A75" : "#94A3B8",
                transition: "all 0.2s ease",
                "&:after": authMode === "phone" ? {
                  content: '""',
                  position: "absolute",
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: "2.5px",
                  bgcolor: "#0C5A75",
                  borderRadius: "2px",
                } : {},
              }}
            >
              Phone
            </Box>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2.5,
                  borderRadius: "8px",
                  fontSize: 13,
                  py: 0.5,
                  "& .MuiAlert-message": { fontWeight: 500 },
                }}
              >
                {error}
              </Alert>
            )}

            {/* Email Address / Phone Input */}
            <Box sx={{ mb: 2.25 }}>
              <Typography
                component="label"
                htmlFor="auth-identifier"
                sx={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#334155",
                  mb: 0.75,
                }}
              >
                {authMode === "email" ? "Email address" : "Phone number"}
              </Typography>
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  id="auth-identifier"
                  type={authMode === "email" ? "email" : "tel"}
                  value={authMode === "email" ? email : phone}
                  onChange={(e) => authMode === "email" ? setEmail(e.target.value) : setPhone(e.target.value)}
                  placeholder={authMode === "email" ? "abc@cirrus.ai" : "+1 (555) 019-2834"}
                  required
                  autoFocus
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 14px",
                    fontSize: "14px",
                    color: "#1E293B",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    outline: "none",
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0C5A75";
                    e.target.style.boxShadow = "0 0 0 3px rgba(12, 90, 117, 0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#CBD5E1";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </Box>
            </Box>

            {/* Password Input with Visible Toggle (User Request & Image 1) */}
            <Box sx={{ mb: 2.25 }}>
              <Typography
                component="label"
                htmlFor="auth-password"
                sx={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#334155",
                  mb: 0.75,
                }}
              >
                Password
              </Typography>
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 46px 0 14px",
                    fontSize: "14px",
                    color: "#1E293B",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    outline: "none",
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                    fontFamily: "inherit",
                    letterSpacing: showPassword ? "normal" : "2px",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0C5A75";
                    e.target.style.boxShadow = "0 0 0 3px rgba(12, 90, 117, 0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#CBD5E1";
                    e.target.style.boxShadow = "none";
                  }}
                />

                {/* Password Visibility Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "none",
                    border: "none",
                    padding: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: showPassword ? "#0C5A75" : "#94A3B8",
                    borderRadius: "4px",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </Box>
            </Box>

            {/* Keep me signed in & Forgot password row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2.75,
              }}
            >
              <Box
                component="label"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: "#0C5A75",
                    cursor: "pointer",
                  }}
                />
                <Typography sx={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>
                  Keep me signed in
                </Typography>
              </Box>

              <Typography
                component="button"
                type="button"
                onClick={() => setForgotOpen(true)}
                sx={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0C5A75",
                  cursor: "pointer",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot password?
              </Typography>
            </Box>

            {/* Sign in Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                height: 44,
                bgcolor: "#0C5A75",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(12, 90, 117, 0.25)",
                "&:hover": {
                  bgcolor: "#084459",
                  boxShadow: "0 4px 12px rgba(12, 90, 117, 0.35)",
                },
              }}
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

          {/* First time here? Sign up instead link */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, color: "#64748B" }}>
              First time here?{" "}
              <Link
                to="/signup"
                style={{
                  color: "#0C5A75",
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                Sign up
              </Link>{" "}
              instead.
            </Typography>
          </Box>

          {/* Quick Demo Credentials for Fast Pair-Testing */}
          <Box
            sx={{
              mt: 3.5,
              pt: 2.5,
              borderTop: "1px dashed #E2E8F0",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Quick 1-Click Demo Logins:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Box
                component="button"
                type="button"
                onClick={() => handleDemoFill("admin@cirrus.local", "Admin")}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  bgcolor: "#F8FAFC",
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": { bgcolor: "#E2E8F0", borderColor: "#94A3B8" },
                }}
              >
                Admin (admin@cirrus.local)
              </Box>
              <Box
                component="button"
                type="button"
                onClick={() => handleDemoFill("manager@cirrus.local", "Manager")}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  bgcolor: "#F8FAFC",
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": { bgcolor: "#E2E8F0", borderColor: "#94A3B8" },
                }}
              >
                Manager
              </Box>
              <Box
                component="button"
                type="button"
                onClick={() => handleDemoFill("rep@cirrus.local", "Sales Rep")}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  bgcolor: "#F8FAFC",
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": { bgcolor: "#E2E8F0", borderColor: "#94A3B8" },
                }}
              >
                Sales Rep
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Forgot Password Interactive Modal */}
      <Dialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18, color: "#1E293B", pb: 1 }}>
          Reset your password
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: "#64748B", mb: 2 }}>
            Enter your registered email address and we'll send you instructions to reset your password.
          </Typography>
          {forgotSuccess ? (
            <Alert severity="success" sx={{ fontSize: 13 }}>
              Password reset link sent! Check your inbox.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleForgotSubmit}>
              <input
                type="email"
                placeholder="name@company.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  height: 42,
                  padding: "0 14px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setForgotOpen(false)} sx={{ textTransform: "none", color: "#64748B" }}>
            Cancel
          </Button>
          {!forgotSuccess && (
            <Button
              onClick={handleForgotSubmit}
              variant="contained"
              sx={{ bgcolor: "#0C5A75", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#084459" } }}
            >
              Send Reset Link
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}