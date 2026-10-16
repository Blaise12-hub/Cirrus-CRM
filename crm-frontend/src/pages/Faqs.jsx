import React, { useState, useMemo } from "react";
import {
  Box, Typography, Card, CardContent, Accordion,
  AccordionSummary, AccordionDetails, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Divider, MenuItem, IconButton
} from "@mui/material";
import {
  Search, ChevronDown, HelpCircle, BookOpen, Command,
  Send, ThumbsUp, ThumbsDown, CheckCircle, ExternalLink,
  MessageSquare, Zap, ShieldCheck, LifeBuoy, ArrowRight,
  PhoneCall, Mail, X
} from "lucide-react";

// Featured articles matching the 3-column layout in Image 4
const FEATURED_ARTICLES = [
  {
    id: "feat-1",
    category: "Pipeline & Deals",
    title: "How do deal stages calculate win probability?",
    answer: "Deals transition through 6 standard stages: Prospecting (10%), Qualification (25%), Proposal (50%), Negotiation (75%), Closed Won (100%), and Closed Lost (0%). The expected pipeline value calculates the total deal value multiplied by its stage probability percentage.",
  },
  {
    id: "feat-2",
    category: "Lead Conversion",
    title: "How to convert a Lead into an Account & Contact?",
    answer: "When viewing any Lead in the Leads tab, click the 'Convert Lead' button. Cirrus CRM will automatically prompt you to either create a new Account or associate with an existing company, generate the primary Contact record, and optionally spin up a new Opportunity.",
  },
  {
    id: "feat-3",
    category: "Team & Permissions",
    title: "How to invite team members and set roles?",
    answer: "Admins can invite new team members from the Users tab. Select their designated role: Sales Rep (access to owned leads & opportunities), Manager (team dashboards and deal reassignment), or Admin (full global system access and integrations).",
  },
  {
    id: "feat-4",
    category: "Security & Sessions",
    title: "How to enforce Two-Factor Authentication (2FA)?",
    answer: "Users can manage security preferences, change passwords, and review active sessions under 'Settings' > 'Security' or 'My Profile' > 'Security'. Administrators can also enforce mandatory 2FA organization-wide.",
  },
  {
    id: "feat-5",
    category: "Integrations & Email",
    title: "Syncing Google Workspace and Microsoft 365",
    answer: "Go to Settings > Integrations. Click 'Connect' on Google Workspace or Microsoft 365 to automatically link emails, calendar appointments, and contacts with customer timeline records in Cirrus.",
  },
  {
    id: "feat-6",
    category: "Data & Quotas",
    title: "How to set quarterly team quotas & export data?",
    answer: "Managers and Admins can configure quarterly team quotas under Settings > Pipeline. All customer records, opportunities, and activities can be exported into standard CSV format anytime from Settings > Data Export.",
  },
];

// Complete Knowledge Base FAQ Items
const KNOWLEDGE_BASE_ITEMS = [
  {
    id: "faq-1",
    tab: "sales",
    category: "Pipelines & Opportunities",
    question: "What happens when a deal is moved to Closed Won?",
    answer: "Moving a deal to Closed Won immediately triggers team notifications, updates the live Win Rate Gauge, adds to quarterly quota progress, and logs the milestone in the account's historical activity timeline.",
  },
  {
    id: "faq-2",
    tab: "sales",
    category: "Pipelines & Opportunities",
    question: "How do I configure product line items on an active deal?",
    answer: "Navigate to the target Opportunity detail page, scroll to 'Products & Services', and select 'Add Product'. You can select from the active catalog, set custom discount and quantity, and Cirrus recalculates total deal amount automatically.",
  },
  {
    id: "faq-3",
    tab: "sales",
    category: "Leads Management",
    question: "How does automated lead scoring work?",
    answer: "Cirrus scores incoming leads based on engagement activity, company size, and responsiveness. Hot leads (score 80+) are flagged in orange and recommended for immediate same-day outreach.",
  },
  {
    id: "faq-4",
    tab: "admin",
    category: "Admin & Operations",
    question: "How do User Roles (Admin, Manager, Sales Rep) restrict access?",
    answer: "Admins have full global read/write access, user provisioning, role assignments, and system settings. Managers can view team performance, reassign leads, and inspect team accounts. Sales Representatives have access to their owned records and shared product catalogs.",
  },
  {
    id: "faq-5",
    tab: "admin",
    category: "Admin & Operations",
    question: "How do I backup and export our entire CRM database?",
    answer: "Go to Settings > Data & Backup and click 'Export Full Workspace'. Cirrus generates encrypted CSV bundles containing accounts, contacts, opportunities, and communication histories.",
  },
  {
    id: "faq-6",
    tab: "admin",
    category: "Integrations & API",
    question: "Where can I find my REST API key for custom webhooks?",
    answer: "Under Settings > Integrations & Developer API, generate an API token with read/write scopes to integrate Cirrus CRM with external billing, ERP, or marketing automation platforms.",
  },
];

export default function Faqs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "sales" | "admin"
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [contactOpen, setContactOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Ticket form
  const [ticketForm, setTicketForm] = useState({ subject: "", priority: "Medium", message: "" });
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    setTicketSuccess(true);
    setTimeout(() => {
      setTicketSuccess(false);
      setContactOpen(false);
      setTicketForm({ subject: "", priority: "Medium", message: "" });
    }, 2200);
  };

  const handleFeedback = (id, helpful) => {
    setFeedbackGiven((prev) => ({ ...prev, [id]: helpful ? "yes" : "no" }));
  };

  // Filtered knowledge base items
  const filteredKbItems = useMemo(() => {
    return KNOWLEDGE_BASE_ITEMS.filter((item) => {
      if (activeTab !== "all" && item.tab !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", pb: 6 }}>
      {/* ── Top Hero Banner matching Image 4 prototype ── */}
      <Box
        sx={{
          borderRadius: "16px",
          bgcolor: "#002050",
          backgroundImage: "radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.25) 0%, transparent 40%), linear-gradient(135deg, #001A42 0%, #002866 50%, #083870 100%)",
          color: "#FFFFFF",
          pt: { xs: 5, sm: 6 },
          pb: { xs: 5, sm: 6 },
          px: { xs: 3, sm: 4 },
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0, 32, 80, 0.3)",
        }}
      >
        {/* Abstract warm corner accent shape as in Image 4 */}
        <Box
          sx={{
            position: "absolute",
            top: -40,
            left: -40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            bgcolor: "#F59E0B",
            opacity: 0.85,
            filter: "blur(20px)",
            pointerEvents: "none",
          }}
        />

        {/* Title: "How can we help?" */}
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 28, sm: 36 },
            fontWeight: 700,
            fontFamily: "Georgia, 'Times New Roman', serif, sans-serif",
            letterSpacing: "-0.01em",
            mb: 3,
            color: "#FFFFFF",
          }}
        >
          How can we help?
        </Typography>

        {/* Prominent Pill Search Bar (Image 4) */}
        <Box
          sx={{
            maxWidth: 620,
            mx: "auto",
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Type your question"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: "48px",
              padding: "0 50px 0 22px",
              fontSize: "15px",
              borderRadius: "28px",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              backgroundColor: "#FFFFFF",
              color: "#1E293B",
              outline: "none",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              fontFamily: "inherit",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              right: "16px",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Search size={20} />
          </Box>
        </Box>
      </Box>

      {/* ── Sub-Hero Alert Banner (Image 4 prototype) ── */}
      <Box
        sx={{
          mt: 2,
          mb: 3.5,
          p: { xs: 2, sm: "14px 24px" },
          bgcolor: "#EBF5FB",
          border: "1px solid #D0E3F3",
          borderRadius: "12px",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        <Typography sx={{ fontSize: 13.5, color: "#1E3A8A", fontWeight: 500 }}>
          Having problems with a deal, pipeline, or account setup? Reach out to support with a help request.
        </Typography>

        <Button
          variant="outlined"
          size="small"
          onClick={() => setContactOpen(true)}
          sx={{
            borderColor: "#0C5A75",
            color: "#0C5A75",
            borderRadius: "20px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: 12.5,
            px: 2,
            whiteSpace: "nowrap",
            "&:hover": {
              bgcolor: "rgba(12, 90, 117, 0.08)",
              borderColor: "#084459",
            },
          }}
        >
          Get help with an issue
        </Button>
      </Box>

      {/* ── Category Sub-Navigation Tabs matching Image 4 ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          borderBottom: "1px solid #E2E8F0",
          mb: 4.5,
          gap: { xs: 2, sm: 5 },
          overflowX: "auto",
        }}
      >
        <Box
          onClick={() => setActiveTab("all")}
          sx={{
            pb: 1.5,
            cursor: "pointer",
            position: "relative",
            fontSize: 14,
            fontWeight: activeTab === "all" ? 700 : 500,
            color: activeTab === "all" ? "#0F172A" : "#64748B",
            transition: "all 0.15s ease",
            "&:after": activeTab === "all" ? {
              content: '""',
              position: "absolute",
              bottom: -1,
              left: 0,
              right: 0,
              height: "2.5px",
              bgcolor: "#0F172A",
              borderRadius: "2px",
            } : {},
          }}
        >
          All Topics
        </Box>
        <Box
          onClick={() => setActiveTab("sales")}
          sx={{
            pb: 1.5,
            cursor: "pointer",
            position: "relative",
            fontSize: 14,
            fontWeight: activeTab === "sales" ? 700 : 500,
            color: activeTab === "sales" ? "#0F172A" : "#64748B",
            transition: "all 0.15s ease",
            "&:after": activeTab === "sales" ? {
              content: '""',
              position: "absolute",
              bottom: -1,
              left: 0,
              right: 0,
              height: "2.5px",
              bgcolor: "#0F172A",
              borderRadius: "2px",
            } : {},
          }}
        >
          Sales & Pipelines
        </Box>
        <Box
          onClick={() => setActiveTab("admin")}
          sx={{
            pb: 1.5,
            cursor: "pointer",
            position: "relative",
            fontSize: 14,
            fontWeight: activeTab === "admin" ? 700 : 500,
            color: activeTab === "admin" ? "#0F172A" : "#64748B",
            transition: "all 0.15s ease",
            "&:after": activeTab === "admin" ? {
              content: '""',
              position: "absolute",
              bottom: -1,
              left: 0,
              right: 0,
              height: "2.5px",
              bgcolor: "#0F172A",
              borderRadius: "2px",
            } : {},
          }}
        >
          Admin & Operations
        </Box>
      </Box>

      {/* ── "Featured articles" Section (Image 4 prototype) ── */}
      <Box sx={{ mb: 5 }}>
        <Typography
          component="h2"
          sx={{
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "Georgia, 'Times New Roman', serif, sans-serif",
            color: "#1E293B",
            mb: 3,
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Featured articles
        </Typography>

        {/* 3-Column Grid matching Image 4 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: 3.5,
          }}
        >
          {FEATURED_ARTICLES.map((article) => (
            <Box
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              sx={{
                cursor: "pointer",
                p: 2,
                borderRadius: "10px",
                border: "1px solid transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#F8FAFC",
                  borderColor: "#E2E8F0",
                  transform: "translateY(-2px)",
                },
              }}
            >
              {/* Category small muted label above */}
              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  mb: 0.75,
                }}
              >
                {article.category}
              </Typography>

              {/* Bold Article Title / Question */}
              <Typography
                sx={{
                  fontSize: 14.5,
                  fontWeight: 700,
                  color: "#0F172A",
                  lineHeight: 1.4,
                  "&:hover": { color: "#0C5A75", textDecoration: "underline" },
                }}
              >
                {article.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* ── Complete Knowledge Base Explorer ── */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>
            Browse All Questions ({filteredKbItems.length})
          </Typography>
          <Button
            size="small"
            startIcon={<Command size={14} />}
            onClick={() => setShortcutsOpen(true)}
            sx={{ textTransform: "none", fontSize: 12.5, color: "#64748B" }}
          >
            Keyboard Shortcuts
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filteredKbItems.length === 0 ? (
            <Card sx={{ p: 4, textAlign: "center", bgcolor: "#F8FAFC", border: "1px dashed #CBD5E1" }}>
              <Typography sx={{ color: "#64748B", fontSize: 14 }}>
                No matching articles found for "{searchQuery}". Try another keyword or submit a support ticket.
              </Typography>
            </Card>
          ) : (
            filteredKbItems.map((item) => (
              <Accordion
                key={item.id}
                sx={{
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px !important",
                  boxShadow: "none",
                  "&:before": { display: "none" },
                  overflow: "hidden",
                }}
              >
                <AccordionSummary
                  expandIcon={<ChevronDown size={18} color="#64748B" />}
                  sx={{ py: 0.75, px: 2.5 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{ height: 20, fontSize: 10.5, fontWeight: 700, bgcolor: "#F1F5F9", color: "#475569" }}
                    />
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>
                      {item.question}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0, bgcolor: "#FAFAFA" }}>
                  <Typography sx={{ fontSize: 13.5, color: "#334155", lineHeight: 1.6, mb: 2 }}>
                    {item.answer}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1.5, borderTop: "1px solid #E2E8F0" }}>
                    <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                      Was this helpful?
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleFeedback(item.id, true)}
                        sx={{
                          color: feedbackGiven[item.id] === "yes" ? "#10B981" : "#94A3B8",
                          bgcolor: feedbackGiven[item.id] === "yes" ? "#ECFDF5" : "transparent",
                        }}
                      >
                        <ThumbsUp size={15} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleFeedback(item.id, false)}
                        sx={{
                          color: feedbackGiven[item.id] === "no" ? "#EF4444" : "#94A3B8",
                          bgcolor: feedbackGiven[item.id] === "no" ? "#FEF2F2" : "transparent",
                        }}
                      >
                        <ThumbsDown size={15} />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>
      </Box>

      {/* Article Detail Reading Modal */}
      <Dialog
        open={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        {selectedArticle && (
          <>
            <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: "#0F172A", pb: 1 }}>
              {selectedArticle.title}
            </DialogTitle>
            <DialogContent>
              <Chip
                label={selectedArticle.category}
                size="small"
                sx={{ mb: 2, bgcolor: "#F1F5F9", color: "#475569", fontWeight: 700 }}
              />
              <Typography sx={{ fontSize: 14.5, color: "#334155", lineHeight: 1.7, mb: 3 }}>
                {selectedArticle.answer}
              </Typography>

              <Card sx={{ bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", p: 2, borderRadius: "10px" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1E293B", mb: 0.5 }}>
                  Need more help with this?
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "#64748B" }}>
                  Our sales operations and engineering support team is available 24/7.
                </Typography>
              </Card>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, display: "flex", justifyContent: "space-between" }}>
              <Button onClick={() => setSelectedArticle(null)} sx={{ textTransform: "none", color: "#64748B" }}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedArticle(null);
                  setContactOpen(true);
                }}
                sx={{ bgcolor: "#0C5A75", textTransform: "none", fontWeight: 600 }}
              >
                Submit Help Request
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Support Ticket Modal */}
      <Dialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: "#0F172A" }}>
          Contact Cirrus Support
        </DialogTitle>
        <DialogContent>
          {ticketSuccess ? (
            <Alert severity="success" sx={{ my: 2 }}>
              Ticket submitted successfully! Ticket ID #CR-8924. Our support engineers will follow up shortly.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleTicketSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#334155", mb: 0.5 }}>
                  Subject / Summary
                </Typography>
                <input
                  type="text"
                  required
                  placeholder="e.g. Issue connecting Google Calendar sync"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: 14,
                    fontFamily: "inherit",
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#334155", mb: 0.5 }}>
                  Priority
                </Typography>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: 14,
                    fontFamily: "inherit",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <option value="Low">Low - General Question</option>
                  <option value="Medium">Medium - Workflow Impeded</option>
                  <option value="High">High - Critical Issue</option>
                </select>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#334155", mb: 0.5 }}>
                  Detailed Description
                </Typography>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide any relevant steps, deal IDs, or error codes…"
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: 14,
                    fontFamily: "inherit",
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setContactOpen(false)} sx={{ textTransform: "none", color: "#64748B" }}>
            Cancel
          </Button>
          {!ticketSuccess && (
            <Button
              onClick={handleTicketSubmit}
              variant="contained"
              sx={{ bgcolor: "#0C5A75", textTransform: "none", fontWeight: 600 }}
            >
              Submit Ticket
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: "#0F172A" }}>
          Keyboard Shortcuts
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
            {[
              { key: "⌘K or Ctrl+K", desc: "Open Global Search" },
              { key: "G then D", desc: "Go to Dashboard" },
              { key: "G then P", desc: "Go to Pipeline" },
              { key: "G then L", desc: "Go to Leads" },
              { key: "Esc", desc: "Close any modal" },
            ].map((sc, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 13, color: "#475569" }}>{sc.desc}</Typography>
                <Chip label={sc.key} size="small" sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: 11 }} />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShortcutsOpen(false)} sx={{ textTransform: "none" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
