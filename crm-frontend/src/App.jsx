import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import AccountsList from "./pages/AccountsList";
import AccountDetail from "./pages/AccountDetail";
import ContactsList from "./pages/ContactsList";
import ContactDetail from "./pages/ContactDetail";
import OpportunityDetail from "./pages/OpportunityDetail";
import Leads from "./pages/Leads";

function AppLayout({ children }) {
  return (
    <div className="crm-root">
      <Sidebar />
      <div className="main-area">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
          } />
          <Route path="/pipeline" element={
            <ProtectedRoute><AppLayout><Pipeline /></AppLayout></ProtectedRoute>
          } />
          <Route path="/accounts" element={
            <ProtectedRoute><AppLayout><AccountsList /></AppLayout></ProtectedRoute>
          } />
          <Route path="/accounts/:id" element={
            <ProtectedRoute><AppLayout><AccountDetail /></AppLayout></ProtectedRoute>
          } />
          <Route path="/contacts" element={
            <ProtectedRoute><AppLayout><ContactsList /></AppLayout></ProtectedRoute>
          } />
          <Route path="/contacts/:id" element={
            <ProtectedRoute><AppLayout><ContactDetail /></AppLayout></ProtectedRoute>
          } />
          <Route path="/opportunities/:id" element={
            <ProtectedRoute><AppLayout><OpportunityDetail /></AppLayout></ProtectedRoute>
          } />
          <Route path="/leads" element={
            <ProtectedRoute><AppLayout><Leads /></AppLayout></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
     </AuthProvider>
  );
}
