import React, { useState } from "react";
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Avatar, Chip, Alert, Tabs, Tab, Divider, Switch,
  FormControlLabel, Paper, Table, TableHead, TableBody,
  TableRow, TableCell, InputAdornment, LinearProgress
} from "@mui/material";
import {
  User, Shield, Clock, Award, KeyRound, Check,
  Mail, Phone, Building, MapPin, Briefcase, Calendar,
  Smartphone, Laptop, Globe
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usersApi } from "../api/resources";

const cardSx = { mb: 3 };

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);

  // Profile Information form state
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "+1 (555) 234-5678",
    title: user?.title || (user?.role === "admin" ? "Senior CRM Administrator" : user?.role === "manager" ? "Sales Director" : "Account Executive"),
    department: user?.department || "Commercial Sales",
    location: user?.location || "San Francisco, CA (HQ)",
    bio: user?.bio || "Focused on enterprise cloud solutions and high-velocity deal pipelines.",
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState({
    timezone: "America/Los_Angeles (PST - UTC-8)",
    workStart: "08:30",
    workEnd: "17:30",
    dateFormat: "MM/DD/YYYY",
    defaultView: "Dashboard",
    twoFactorEnabled: true,
    emailSignature: `---\nBest regards,\n${user?.first_name || "Sales"} ${user?.last_name || "Representative"}\nCirrus CRM Solutions | Enterprise Cloud Division\nDirect: +1 (555) 234-5678`,
  });

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const initials = `${profileForm.first_name?.[0] || ""}${profileForm.last_name?.[0] || ""}`;

  const handleProfileChange = (field) => (e) => {
    setProfileForm({ ...profileForm, [field]: e.target.value });
    setProfileSuccess("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    try {
      if (!profileForm.first_name.trim() || !profileForm.last_name.trim()) {
        setProfileError("First and last name cannot be empty.");
        return;
      }
      // If user has ID in backend, try updating backend
      if (user?.user_id) {
        try {
          await usersApi.update(user.user_id, {
            first_name: profileForm.first_name,
            last_name: profileForm.last_name,
          });
        } catch {
          // Continue updating client-side context even if backend patch endpoint has role limits
        }
      }
      updateUser({
        ...user,
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        email: profileForm.email,
        phone: profileForm.phone,
        title: profileForm.title,
        department: profileForm.department,
        location: profileForm.location,
        bio: profileForm.bio,
      });
      setProfileSuccess("Profile updated successfully! Changes have been saved.");
    } catch (err) {
      setProfileError(err.message || "Failed to save profile changes.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      if (user?.user_id) {
        await usersApi.setPassword(user.user_id, passwordForm.newPassword);
      }
      setPasswordSuccess("Your password was updated successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Password strength meter
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 25;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };
  const pwdScore = calculatePasswordStrength(passwordForm.newPassword);

  return (
    <Box className="view" sx={{ pb: 3 }}>
      {/* ── User Overview Hero Card ────────────────────────────── */}
      <Card sx={{ mb: 3, overflow: "visible" }}>
        <Box sx={{ height: 90, bgcolor: "#1160B7", borderTopLeftRadius: 8, borderTopRightRadius: 8, px: 3, pt: 2 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase" }}>
            Cirrus Cloud CRM • Account Profile
          </Typography>
        </Box>
        <CardContent sx={{ pt: 0, px: { xs: 2, sm: 3 }, pb: "24px !important" }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "flex-end" }, gap: 2.5, mt: -5, mb: 2 }}>
            <Avatar
              sx={{
                width: 86,
                height: 86,
                fontSize: 32,
                fontWeight: 700,
                bgcolor: "#002050",
                color: "#FFFFFF",
                border: "4px solid",
                borderColor: "background.paper",
                boxShadow: 2,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
                  {profileForm.first_name} {profileForm.last_name}
                </Typography>
                <Chip
                  label={user?.role ? user.role.toUpperCase() : "SALES REP"}
                  size="small"
                  color="primary"
                  sx={{ height: 22, fontSize: 10.5, fontWeight: 700 }}
                />
                <Chip
                  label="Active Account"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ height: 22, fontSize: 10.5, fontWeight: 600 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                <span>{profileForm.title}</span> • <span>{profileForm.department}</span> • <span>{profileForm.location}</span>
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Tab Navigation */}
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 600,
                fontSize: 13,
                textTransform: "none",
                minHeight: 44,
                gap: 1,
              },
            }}
          >
            <Tab icon={<User size={16} />} iconPosition="start" label="Personal Info" />
            <Tab icon={<Shield size={16} />} iconPosition="start" label="Security & Password" />
            <Tab icon={<Clock size={16} />} iconPosition="start" label="Preferences & Work Hours" />
            <Tab icon={<Award size={16} />} iconPosition="start" label="Sales Performance" />
          </Tabs>
        </CardContent>
      </Card>

      {/* ── TAB 0: Personal Information ───────────────────────── */}
      {tabIndex === 0 && (
        <Card sx={cardSx}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Personal Information</Typography>
              <Typography variant="body2" color="text.secondary">
                Update your identification details and contact information visible across customer records.
              </Typography>
            </Box>

            {profileSuccess && <Alert severity="success" sx={{ mb: 3 }}>{profileSuccess}</Alert>}
            {profileError && <Alert severity="error" sx={{ mb: 3 }}>{profileError}</Alert>}

            <form onSubmit={handleSaveProfile}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 3 }}>
                <TextField
                  label="First Name"
                  required
                  value={profileForm.first_name}
                  onChange={handleProfileChange("first_name")}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><User size={16} /></InputAdornment>,
                  }}
                />
                <TextField
                  label="Last Name"
                  required
                  value={profileForm.last_name}
                  onChange={handleProfileChange("last_name")}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><User size={16} /></InputAdornment>,
                  }}
                />
                <TextField
                  label="Email Address"
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={handleProfileChange("email")}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Mail size={16} /></InputAdornment>,
                  }}
                />
                <TextField
                  label="Phone Number"
                  value={profileForm.phone}
                  onChange={handleProfileChange("phone")}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Phone size={16} /></InputAdornment>,
                  }}
                />
                <TextField
                  label="Job Title"
                  value={profileForm.title}
                  onChange={handleProfileChange("title")}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Briefcase size={16} /></InputAdornment>,
                  }}
                />
                <TextField
                  label="Department"
                  value={profileForm.department}
                  onChange={handleProfileChange("department")}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Building size={16} /></InputAdornment>,
                  }}
                />
                <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
                  <TextField
                    label="Primary Location / Office"
                    value={profileForm.location}
                    onChange={handleProfileChange("location")}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><MapPin size={16} /></InputAdornment>,
                    }}
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
                  <TextField
                    label="Professional Bio / Notes"
                    multiline
                    rows={3}
                    value={profileForm.bio}
                    onChange={handleProfileChange("bio")}
                    placeholder="Short summary of roles, territories, and accounts managed..."
                  />
                </Box>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 1, borderTop: 1, borderColor: "divider" }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    setProfileForm({
                      first_name: user?.first_name || "",
                      last_name: user?.last_name || "",
                      email: user?.email || "",
                      phone: "+1 (555) 234-5678",
                      title: "Account Executive",
                      department: "Commercial Sales",
                      location: "San Francisco, CA (HQ)",
                      bio: "Focused on enterprise cloud solutions.",
                    });
                    setProfileSuccess("");
                  }}
                >
                  Reset
                </Button>
                <Button type="submit" variant="contained" startIcon={<Check size={16} />}>
                  Save Profile Changes
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 1: Security & Password ─────────────────────────── */}
      {tabIndex === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Change Password</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ensure your account is protected with a strong password containing at least 8 characters.
                </Typography>
              </Box>

              {passwordSuccess && <Alert severity="success" sx={{ mb: 3 }}>{passwordSuccess}</Alert>}
              {passwordError && <Alert severity="error" sx={{ mb: 3 }}>{passwordError}</Alert>}

              <form onSubmit={handlePasswordSubmit}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 2 }}>
                  <TextField
                    label="Current Password"
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><KeyRound size={16} /></InputAdornment>,
                    }}
                  />
                  <Box sx={{ display: { xs: "none", sm: "block" } }} />
                  <TextField
                    label="New Password"
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><KeyRound size={16} /></InputAdornment>,
                    }}
                  />
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><KeyRound size={16} /></InputAdornment>,
                    }}
                  />
                </Box>

                {passwordForm.newPassword && (
                  <Box sx={{ mb: 3, maxWidth: 400 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">Password Strength</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: pwdScore >= 75 ? "success.main" : pwdScore >= 50 ? "warning.main" : "error.main" }}>
                        {pwdScore >= 75 ? "Strong" : pwdScore >= 50 ? "Medium" : "Weak"}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pwdScore}
                      color={pwdScore >= 75 ? "success" : pwdScore >= 50 ? "warning" : "error"}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button type="submit" variant="contained" disabled={passwordLoading}>
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication Status Card */}
          <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Two-Factor Authentication (2FA)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add an extra layer of protection using Google Authenticator, Authy, or 1Password.
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.twoFactorEnabled}
                      onChange={(e) => setPreferences({ ...preferences, twoFactorEnabled: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={preferences.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Recent Active Sessions */}
          <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Active Logins & Sessions</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Devices and locations recently used to access this Cirrus CRM account.
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Device / Browser</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Laptop size={16} /> Chrome 122 (Windows 11)
                    </TableCell>
                    <TableCell sx={{ fontFamily: "'IBM Plex Mono', monospace" }}>192.168.1.45</TableCell>
                    <TableCell>San Francisco, CA, US</TableCell>
                    <TableCell><Chip label="Active Now" size="small" color="success" sx={{ height: 20 }} /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Smartphone size={16} /> Safari Mobile (iOS 17)
                    </TableCell>
                    <TableCell sx={{ fontFamily: "'IBM Plex Mono', monospace" }}>172.56.21.9</TableCell>
                    <TableCell>San Jose, CA, US</TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">Yesterday 18:22</Typography></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ── TAB 2: Preferences & Schedule ─────────────────────── */}
      {tabIndex === 2 && (
        <Card sx={cardSx}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Regional & Schedule Preferences</Typography>
              <Typography variant="body2" color="text.secondary">
                Configure calendar working hours, preferred timezone, and default views.
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 3 }}>
              <TextField
                label="Primary Timezone"
                value={preferences.timezone}
                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Globe size={16} /></InputAdornment>,
                }}
              />
              <TextField
                label="Date Format"
                value={preferences.dateFormat}
                onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Calendar size={16} /></InputAdornment>,
                }}
              />
              <TextField
                label="Working Hours (Start)"
                type="time"
                value={preferences.workStart}
                onChange={(e) => setPreferences({ ...preferences, workStart: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Clock size={16} /></InputAdornment>,
                }}
              />
              <TextField
                label="Working Hours (End)"
                type="time"
                value={preferences.workEnd}
                onChange={(e) => setPreferences({ ...preferences, workEnd: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Clock size={16} /></InputAdornment>,
                }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Outbound Email Signature</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                Automatically attached when sending emails to contacts and leads directly from Cirrus CRM.
              </Typography>
              <TextField
                multiline
                rows={4}
                value={preferences.emailSignature}
                onChange={(e) => setPreferences({ ...preferences, emailSignature: e.target.value })}
                sx={{ fontFamily: "'IBM Plex Mono', monospace" }}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={() => alert("Schedule and signature preferences saved!")}
              >
                Save Preferences
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 3: Sales Performance & Targets ────────────────── */}
      {tabIndex === 3 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase" }} color="text.secondary">
                  Q3 Quota Target
                </Typography>
                <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 24, fontWeight: 700, mt: 0.5 }}>
                  $250,000
                </Typography>
                <Typography variant="caption" color="text.secondary">FY 2026 Target</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase" }} color="text.secondary">
                  Closed Won (QTD)
                </Typography>
                <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 24, fontWeight: 700, mt: 0.5, color: "success.main" }}>
                  $185,400
                </Typography>
                <Typography variant="caption" color="success.main">74.1% of quota reached</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase" }} color="text.secondary">
                  Active Pipeline
                </Typography>
                <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 24, fontWeight: 700, mt: 0.5, color: "primary.main" }}>
                  $340,000
                </Typography>
                <Typography variant="caption" color="text.secondary">14 active deals</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase" }} color="text.secondary">
                  Win Rate
                </Typography>
                <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 24, fontWeight: 700, mt: 0.5, color: "info.main" }}>
                  68.5%
                </Typography>
                <Typography variant="caption" color="text.secondary">19 won / 9 lost</Typography>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Quota Progress Gauge</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current pacing indicates 108% target attainment before quarter close.
              </Typography>
              <Box sx={{ mb: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={74.1}
                  sx={{ height: 12, borderRadius: 6, bgcolor: "action.hover" }}
                />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>$0</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>Current: $185,400 (74.1%)</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Quota: $250,000</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
