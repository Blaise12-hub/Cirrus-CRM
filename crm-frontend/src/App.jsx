import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, GlobalStyles } from "@mui/material";
import ThemeModeProvider from "./context/ThemeModeProvider";
import { AuthProvider } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import AccountsList from "./pages/AccountsList";
import AccountDetail from "./pages/AccountDetail";
import ContactsList from "./pages/ContactsList";
import ContactDetail from "./pages/ContactDetail";
import OpportunityDetail from "./pages/OpportunityDetail";
import Leads from "./pages/Leads";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import Faqs from "./pages/Faqs";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

// Sidebar = navigation (full height, left). TopBar = utility row only
// (search/help/notifications/settings/avatar), sitting above the content
// column to the right of the sidebar — not spanning the sidebar itself.
// Fully self-contained MUI sx, no dependency on index.css.
//
// GlobalStyles re-enforces height:100% on html/body/#root because MUI's
// CssBaseline resets those values and can break the flex layout.
function AppLayout({ children }) {
  return (
    <>
      <GlobalStyles styles={{ "html, body, #root": { height: "100%", margin: 0, padding: 0 } }} />
      <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
        <Sidebar />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
          <TopBar />
          <Box component="main" sx={{ flex: 1, overflowY: "auto", p: { xs: 2, sm: 3.5 }, bgcolor: "background.default" }}>
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

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
              <Route path="/users" element={
                <ProtectedRoute roles={["admin", "manager"]}><AppLayout><Users /></AppLayout></ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute roles={["admin", "manager"]}><AppLayout><Products /></AppLayout></ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>
              } />
              <Route path="/faqs" element={
                <ProtectedRoute><AppLayout><Faqs /></AppLayout></ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeModeProvider>
  );
}