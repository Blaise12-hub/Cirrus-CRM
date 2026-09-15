import React from "react";
import { useAuth } from "../context/AuthContext";
import RepDashboard from "./RepDashboard";
import TeamDashboard from "./TeamDashboard";

// This is the file your router points /  at — it no longer renders anything
// itself, it just picks which layout to show based on role.
export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "sales_rep") return <RepDashboard />;
  return <TeamDashboard />;
}