import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, IconButton, Link as MuiLink, Avatar, Collapse } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { X, UserPlus, Contact2, Briefcase } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { accountsApi, contactsApi } from "../api/resources";
import NewContactModal from "./NewContactModal";
import NewLeadModal from "./NewLeadModal";
import NewOpportunityModal from "./NewOpportunityModal";

const CARDS = [
  { key: "contact", icon: Contact2, title: "Create your first contact", desc: "Growing your sales starts with contacts. Let's walk through it." },
  { key: "lead", icon: UserPlus, title: "Create your first lead", desc: "Let us show you how easy it is to convert your leads into contacts, accounts, and opportunities." },
  { key: "deal", icon: Briefcase, title: "Create your first deal", desc: "Add an opportunity and see how easy it is to track stages as your deals move forward." },
];

// Dismissal persists per-user so it doesn't leak across accounts on a
// shared browser, and stays dismissed across sessions once acted on.
export default function QuickStartCards() {
  const { user } = useAuth();
  const storageKey = `crm-dismissed-cards-${user?.user_id}`;

  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; }
  });
  const [openModal, setOpenModal] = useState(null); // "contact" | "lead" | "deal" | null
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loadingOppData, setLoadingOppData] = useState(false);

  const dismiss = (key) => {
    const next = [...dismissed, key];
    setDismissed(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const restoreAll = () => {
    setDismissed([]);
    localStorage.setItem(storageKey, JSON.stringify([]));
  };

  const openCard = async (key) => {
    // Both "contact" (account picker) and "deal" (account + contact pickers)
    // need this data — only "lead" doesn't.
    if ((key === "deal" || key === "contact") && accounts.length === 0) {
      setLoadingOppData(true);
      try {
        const [accs, cts] = await Promise.all([accountsApi.list(), contactsApi.list()]);
        setAccounts(accs);
        setContacts(cts);
      } catch {
        // If this fails, the modal below just won't have picker options —
        // not worth blocking the whole banner over a lazy-load hiccup.
      } finally {
        setLoadingOppData(false);
      }
    }
    setOpenModal(key);
  };

  const visibleCards = CARDS.filter((c) => !dismissed.includes(c.key));

  if (visibleCards.length === 0) {
    return (
      <Box sx={{ mb: 3 }}>
        <MuiLink component="button" variant="body2" onClick={restoreAll} sx={{ fontWeight: 600 }}>
          View all cards
        </MuiLink>
      </Box>
    );
  }

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 3, bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.12 : 0.06), border: "none" }}
      >
        <CardContent sx={{ display: "flex", flexWrap: "wrap", gap: 2.5, alignItems: "stretch" }}>
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Welcome, {user?.first_name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Check out these suggestions to kick off your day.
            </Typography>
            <MuiLink component="button" variant="body2" onClick={restoreAll} sx={{ fontWeight: 600 }}>
              View all cards
            </MuiLink>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", flex: 1 }}>
            {visibleCards.map((c) => (
              <Collapse key={c.key} in orientation="horizontal">
                <Card variant="outlined" sx={{ width: 230, position: "relative", height: "100%" }}>
                  <IconButton
                    size="small"
                    onClick={() => dismiss(c.key)}
                    sx={{ position: "absolute", top: 6, right: 6 }}
                  >
                    <X size={14} />
                  </IconButton>
                  <CardContent
                    onClick={() => openCard(c.key)}
                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                  >
                    <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32, mb: 1.5 }}>
                      <c.icon size={16} />
                    </Avatar>
                    <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: "primary.main", mb: 0.5 }}>{c.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.desc}</Typography>
                  </CardContent>
                </Card>
              </Collapse>
            ))}
          </Box>
        </CardContent>
      </Card>

      {openModal === "contact" && !loadingOppData && (
        <NewContactModal
          accounts={accounts}
          onClose={() => setOpenModal(null)}
          onCreated={() => { dismiss("contact"); setOpenModal(null); }}
        />
      )}
      {openModal === "lead" && (
        <NewLeadModal
          onClose={() => setOpenModal(null)}
          onCreated={() => { dismiss("lead"); setOpenModal(null); }}
        />
      )}
      {openModal === "deal" && !loadingOppData && (
        <NewOpportunityModal
          accounts={accounts}
          contacts={contacts}
          onClose={() => setOpenModal(null)}
          onCreated={() => { dismiss("deal"); setOpenModal(null); }}
        />
      )}
    </>
  );
}