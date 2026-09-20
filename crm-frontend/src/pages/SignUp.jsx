import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/resources";
import { useAuth } from "../context/AuthContext";

// Reuses .login-* classes from index.css so this looks identical in style
// to your existing Login page — same card, same form language.
// ASSUMPTION flagged: authApi.register(data) and its exact field names
// (first_name/last_name/email/password) — verify against auth.routes.js.
// No role field is submitted here on purpose (see chat note on why).
export default function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth(); // ASSUMPTION: AuthContext exposes a login(user, token) or similar to log the new user in immediately after registering — adjust to match your actual context shape
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    setError("");
    try {
      const result = await authApi.register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      });
      // If your register endpoint returns a token + user (like login does),
      // log them straight in. If it doesn't, redirect to /login instead —
      // swap the two lines below depending on what your backend actually does.
      if (result?.token) {
        login(result.user, result.token);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-brand">Cirrus <span>CRM</span></div>
        <div className="login-sub">Create your account</div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={submit}>
          <div className="field-row">
            <label>
              First name
              <input value={form.first_name} onChange={set("first_name")} autoFocus />
            </label>
            <label>
              Last name
              <input value={form.last_name} onChange={set("last_name")} />
            </label>
          </div>
          <label>
            Email
            <input type="email" value={form.email} onChange={set("email")} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={set("password")} />
          </label>
          <label>
            Confirm password
            <input type="password" value={form.confirm} onChange={set("confirm")} />
          </label>
          <button type="submit" className="btn-primary login-submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="login-hint">
          Already have an account? <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}