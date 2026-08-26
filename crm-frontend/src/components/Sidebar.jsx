import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, Users, UserPlus, Target, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/pipeline", label: "Pipeline", icon: Target },
  { to: "/accounts", label: "Accounts", icon: Building2 },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/leads", label: "Leads", icon: UserPlus },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="sidebar">
      <div className="brand">Cirrus <span>CRM</span></div>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <item.icon size={16} />
          {item.label}
        </NavLink>
      ))}

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <span className="sidebar-user-name">{user.first_name} {user.last_name}</span>
            <span className="sidebar-user-role">{user.role}</span>
          </div>
        )}
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );
}
