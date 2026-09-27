import React, { useState, useMemo } from "react";
import {
  Box, Typography, Card, CardContent, TextField, InputAdornment,
  Accordion, AccordionSummary, AccordionDetails, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Divider, MenuItem
} from "@mui/material";
import {
  Search, ChevronDown, HelpCircle, BookOpen, Command,
  Send, ThumbsUp, ThumbsDown, CheckCircle, ExternalLink,
  MessageSquare, Zap, ShieldCheck, LifeBuoy
} from "lucide-react";

const FAQ_ITEMS = [
  {
    id: "faq-1",
    category: "Getting Started",
    question: "How do I navigate between my personal dashboard and team performance views?",
    answer: "Your dashboard automatically reflects your role. If you have an Admin or Manager role, your dashboard provides high-level team metrics, conversion analytics, and rep leaderboards. Sales representatives see individual deal pipelines, quota progress, and daily assigned tasks. You can also explore specific sections anytime using the left navigation sidebar.",
  },
  {
    id: "faq-2",
    category: "Pipelines & Opportunities",
    question: "What are the deal stages and how does Cirrus calculate win rate?",
    answer: "Deals transition across 6 standard stages: Prospecting (10%), Qualification (25%), Proposal (50%), Negotiation (75%), Closed Won (100%), and Closed Lost (0%). The Win Rate Gauge computes total Won opportunities divided by total closed opportunities (Won + Lost) over the active evaluation period.",
  },
  {
    id: "faq-3",
    category: "Leads Management",
    question: "How do I convert a qualified lead into an Account, Contact, and Opportunity?",
    answer: "When viewing any Lead in the Leads tab, click the 'Convert Lead' button. Cirrus will automatically prompt you to either create a new Account or associate with an existing company, generate the primary Contact record, and optionally spin up a new Opportunity in the Prospecting stage.",
  },
  {
    id: "faq-4",
    category: "Pipelines & Opportunities",
    question: "How do I configure product line items on an active deal?",
    answer: "Navigate to the target Opportunity detail page, scroll to the 'Products & Services' section, and select 'Add Product'. You can choose products from the active catalog, specify custom quantity and unit price, and Cirrus will recalculate the total deal amount automatically.",
  },
  {
    id: "faq-5",
    category: "Admin & Security",
    question: "How do User Roles (Admin, Manager, Sales Rep) restrict access?",
    answer: "Admins have full global read/write access, user provisioning, role assignments, and system settings. Managers can view team performance, reassign leads, and inspect all team accounts. Sales Representatives have full access to their owned accounts, leads, opportunities, and shared catalog products.",
  },
  {
    id: "faq-6",
    category: "Admin & Security",
    question: "How do I enforce Two-Factor Authentication (2FA) and password resets?",
    answer: "Users can manage their individual security preferences, change passwords, and review active sessions under 'My Profile' > 'Security'. Administrators can also trigger temporary password resets directly from the Users management console.",
  },
  {
    id: "faq-7",
    category: "Contacts & Accounts",
    question: "Can multiple contacts belong to the same parent account?",
    answer: "Yes! Cirrus CRM uses a one-to-many relational architecture. When you open any Account Detail page, you will see all associated contacts, active opportunities, and historical activities grouped in dedicated sub-panels.",
  },
  {
    id: "faq-8",
    category: "Getting Started",
    question: "How does the search bar in the TopBar function?",
    answer: "The TopBar search allows rapid access across accounts, contacts, and opportunities. Type any company name, deal title, or contact surname to jump directly to the record.",
  },
];

const CATEGORIES = [
  "All",
  "Getting Started",
  "Pipelines & Opportunities",
  "Leads Management",
  "Contacts & Accounts",
  "Admin & Security",
];

const SHORTCUTS = [
  { key: "G then D", desc: "Go to Dashboard" },
  { key: "G then P", desc: "Go to Pipeline" },
  { key: "G then L", desc: "Go to Leads" },
  { key: "G then A", desc: "Go to Accounts" },
  { key: "G then C", desc: "Go to Contacts" },
  { key: "/ or Cmd+K", desc: "Focus Search bar" },
  { key: "Esc", desc: "Close any modal or dialog" },
];

export default function Faqs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // Contact support form
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "General Inquiry",
    priority: "Medium",
    message: "",
  });
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Filter FAQs based on category and search query
  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleFeedback = (id, isHelpful) => {
    setFeedbackGiven((prev) => ({ ...prev, [id]: isHelpful ? "yes" : "no" }));
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    setTicketSuccess(true);
    setTimeout(() => {
      setTicketSuccess(false);
      setContactOpen(false);
      setTicketForm({ subject: "", category: "General Inquiry", priority: "Medium", message: "" });
    }, 2000);
  };

  return (
    <Box className="view" sx={{ pb: 3 }}>
      {/* ── Help Hero Banner ──────────────────────────────────── */}
      <Card
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #002050 0%, #1160B7 100%)",
          color: "#FFFFFF",
          p: { xs: 3, sm: 4 },
        }}
      >
        <Box sx={{ maxWidth: 650, mx: "auto", textAlign: "center" }}>
          <Chip
            icon={<HelpCircle size={14} color="#B1D6F0" />}
            label="CIRRUS KNOWLEDGE BASE"
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: 0.5,
              mb: 1.5,
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, letterSpacing: "-0.02em" }}>
            How can we help you today?
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: 14, mb: 3 }}>
            Search documentation, workflow guides, sales formulas, and system settings.
          </Typography>

          <TextField
            fullWidth
            placeholder="Search questions, deal stages, lead workflows, roles…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#6B6B6B" />
                </InputAdornment>
              ),
              sx: {
                bgcolor: "background.paper",
                borderRadius: 2,
                "& fieldset": { border: "none" },
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                fontSize: 14,
              },
            }}
          />
        </Box>
      </Card>

      {/* ── Category Chips ────────────────────────────────────── */}
      <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 2, mb: 2, alignItems: "center" }}>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            clickable
            color={selectedCategory === cat ? "primary" : "default"}
            variant={selectedCategory === cat ? "filled" : "outlined"}
            onClick={() => setSelectedCategory(cat)}
            sx={{ fontWeight: 600, fontSize: 12.5 }}
          />
        ))}
      </Box>

      {/* ── Two Column Layout (FAQs + Quick Resource Cards) ──── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 300px" }, gap: 3 }}>
        {/* Left: Accordion FAQ List */}
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary" }}>
              Frequently Asked Questions ({filteredFaqs.length})
            </Typography>
            {searchQuery && (
              <Button size="small" onClick={() => setSearchQuery("")} sx={{ fontSize: 11.5 }}>
                Clear Search
              </Button>
            )}
          </Box>

          {filteredFaqs.length === 0 ? (
            <Card sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>No answers matched your search</Typography>
              <Typography variant="body2" color="text.secondary">
                Try searching with different terms or submit a ticket directly to support.
              </Typography>
            </Card>
          ) : (
            filteredFaqs.map((faq) => (
              <Accordion
                key={faq.id}
                sx={{
                  mb: 1.5,
                  borderRadius: "8px !important",
                  border: 1,
                  borderColor: "divider",
                  "&:before": { display: "none" },
                  overflow: "hidden",
                }}
              >
                <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700, textTransform: "uppercase", fontSize: 10.5 }}>
                      {faq.category}
                    </Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                      {faq.question}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13.5, lineHeight: 1.6, mb: 2 }}>
                    {faq.answer}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Feedback widget */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Was this helpful?
                    </Typography>
                    {feedbackGiven[faq.id] ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "success.main" }}>
                        <CheckCircle size={14} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Thank you for your feedback!</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ThumbsUp size={12} />}
                          onClick={() => handleFeedback(faq.id, true)}
                          sx={{ fontSize: 11, py: 0.25, px: 1 }}
                        >
                          Yes
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ThumbsDown size={12} />}
                          onClick={() => handleFeedback(faq.id, false)}
                          sx={{ fontSize: 11, py: 0.25, px: 1 }}
                        >
                          No
                        </Button>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>

        {/* Right: Quick Resources & Support Sidebar */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Shortcuts Card */}
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <Command size={18} color="#1160B7" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Keyboard Shortcuts</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                Accelerate everyday sales actions and navigation without touching the mouse.
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => setShortcutsOpen(true)}
              >
                View Cheat Sheet
              </Button>
            </CardContent>
          </Card>

          {/* Contact Support Card */}
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <LifeBuoy size={18} color="#2E7D46" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Need Dedicated Support?</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                Our enterprise support engineers are available 24/7 to resolve technical issues.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                size="small"
                startIcon={<MessageSquare size={14} />}
                onClick={() => setContactOpen(true)}
              >
                Open Support Ticket
              </Button>
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card sx={{ bgcolor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase" }} color="text.secondary">
                  System Health
                </Typography>
                <Chip label="99.98% Uptime" size="small" color="success" sx={{ height: 20, fontSize: 10.5 }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main" }} />
                All Cloud Services Operational
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                API, Database & Webhooks running normally.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* ── Shortcuts Cheat Sheet Modal ──────────────────────── */}
      <Dialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <Command size={18} /> Keyboard Shortcuts
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {SHORTCUTS.map((s) => (
              <Box key={s.key} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">{s.desc}</Typography>
                <Chip
                  label={s.key}
                  size="small"
                  sx={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 11 }}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShortcutsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Open Support Ticket Dialog ────────────────────────── */}
      <Dialog open={contactOpen} onClose={() => setContactOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Open Enterprise Support Ticket
        </DialogTitle>
        <form onSubmit={handleTicketSubmit}>
          <DialogContent dividers>
            {ticketSuccess ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                Ticket submitted successfully! A support engineer will reply within 30 minutes.
              </Alert>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Subject"
                  required
                  placeholder="E.g., Issue with pipeline stage synchronization"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                />
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <TextField
                    select
                    label="Category"
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  >
                    <MenuItem value="General Inquiry">General Inquiry</MenuItem>
                    <MenuItem value="Deals & Pipeline">Deals & Pipeline</MenuItem>
                    <MenuItem value="Billing & Licensing">Billing & Licensing</MenuItem>
                    <MenuItem value="API & Integrations">API & Integrations</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="Priority"
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Urgent">Urgent</MenuItem>
                  </TextField>
                </Box>
                <TextField
                  label="Message / Details"
                  multiline
                  rows={4}
                  required
                  placeholder="Describe what occurred, steps to reproduce, or questions..."
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setContactOpen(false)} disabled={ticketSuccess}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={ticketSuccess} startIcon={<Send size={14} />}>
              Submit Ticket
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
