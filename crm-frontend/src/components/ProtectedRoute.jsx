import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();

  if (!ready) return <div className="app-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
