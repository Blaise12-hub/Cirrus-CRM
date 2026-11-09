// Pure helpers for the login page.

export const DEMO_PASSWORD = "password123";

export const DEMO_ACCOUNTS = [
  { label: "Admin (admin@cirrus.local)", email: "admin@cirrus.local" },
  { label: "Manager", email: "manager@cirrus.local" },
  { label: "Sales Rep", email: "rep@cirrus.local" },
];

// Returns an error message, or "" when the form can be submitted.
export function validateLogin(email, password) {
  if (!String(email ?? "").trim()) return "Please enter your email address";
  if (!String(password ?? "")) return "Please enter your password";
  return "";
}

// Demo buttons show in dev, or in a deployment that opts in with
// VITE_DEMO_LOGINS=true. Production builds without the flag hide them.
export function showDemoLogins(env) {
  const e = env || {};
  return Boolean(e.DEV) || e.VITE_DEMO_LOGINS === "true";
}