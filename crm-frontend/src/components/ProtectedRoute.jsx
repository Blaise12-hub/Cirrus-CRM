import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

//added roles on protected route to restrict access to certain pages based on user role(admin,manager)
export default function ProtectedRoute({ children,roles }) {
  const { user, ready } = useAuth();

    if (!ready) return <div className="app-loading">Loading…</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
