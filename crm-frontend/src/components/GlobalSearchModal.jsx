import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, Box, TextField, InputAdornment,
  Typography, Chip, Divider, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText
} from "@mui/material";
import {
  Search, X, TrendingUp, User, Building2, UserPlus,
  ArrowRight, Plus, Command, Hash, ExternalLink
} from "lucide-react";
import { opportunitiesApi, leadsApi, accountsApi, contactsApi } from "../api/resources";
import { money } from "./Shared";

export default function GlobalSearchModal({ open, onClose, onOpenNewDeal, onOpenNewLead }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [data, setData] = useState({
    opportunities: [],
    leads: [],
    accounts: [],
    contacts: [],
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      loadAllData();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [oppsRes, leadsRes, accsRes, contactsRes] = await Promise.allSettled([
        opportunitiesApi.list(),
        leadsApi.list(),
        accountsApi.list(),
        contactsApi.list(),
      ]);

      setData({
        opportunities: oppsRes.status === "fulfilled" && Array.isArray(oppsRes.value) ? oppsRes.value : [],
        leads: leadsRes.status === "fulfilled" && Array.isArray(leadsRes.value) ? leadsRes.value : [],
        accounts: accsRes.status === "fulfilled" && Array.isArray(accsRes.value) ? accsRes.value : [],
        contacts: contactsRes.status === "fulfilled" && Array.isArray(contactsRes.value) ? contactsRes.value : [],
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default quick actions / recommendations
      return [
        { type: "action", id: "act-new-deal", title: "Create New Deal / Opportunity", subtitle: "Open deal creation form", icon: <TrendingUp size={16} color="#1160B7" />, action: () => { onClose(); onOpenNewDeal?.(); } },
        { type: "action", id: "act-new-lead", title: "Add New Lead", subtitle: "Capture new inbound prospect", icon: <UserPlus size={16} color="#2E7D46" />, action: () => { onClose(); onOpenNewLead?.(); } },
        { type: "nav", id: "nav-pipeline", title: "Go to Sales Pipeline", subtitle: "View deal velocity & Kanban board", icon: <Command size={16} color="#5E7CE2" />, action: () => { onClose(); navigate("/pipeline"); } },
        { type: "nav", id: "nav-leads", title: "Go to Leads Queue", subtitle: "Inspect uncontacted leads", icon: <Command size={16} color="#5E7CE2" />, action: () => { onClose(); navigate("/leads"); } },
      ];
    }

    const items = [];

    // Opportunities
    data.opportunities
      .filter((o) => o.name?.toLowerCase().includes(q) || (o.account_name || "").toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((o) => {
        items.push({
          type: "deal",
          id: `opp-${o.opportunity_id}`,
          title: o.name,
          subtitle: `${o.account_name || "Independent"} • ${money(o.amount)} • ${o.stage?.toUpperCase()}`,
          icon: <TrendingUp size={16} color="#1160B7" />,
          action: () => { onClose(); navigate(`/opportunities/${o.opportunity_id}`); },
        });
      });

    // Accounts
    data.accounts
      .filter((a) => (a.account_name || a.name || "").toLowerCase().includes(q) || (a.industry || "").toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((a) => {
        items.push({
          type: "account",
          id: `acc-${a.account_id}`,
          title: a.account_name || a.name,
          subtitle: `${a.industry || "General Industry"} • Account #${a.account_id}`,
          icon: <Building2 size={16} color="#B25E09" />,
          action: () => { onClose(); navigate(`/accounts/${a.account_id}`); },
        });
      });

    // Contacts
    data.contacts
      .filter((c) => `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((c) => {
        items.push({
          type: "contact",
          id: `contact-${c.contact_id}`,
          title: `${c.first_name} ${c.last_name}`,
          subtitle: `${c.job_title || "Contact"} • ${c.email || "No email"}`,
          icon: <User size={16} color="#5E7CE2" />,
          action: () => { onClose(); navigate(`/contacts/${c.contact_id}`); },
        });
      });

    // Leads
    data.leads
      .filter((l) => `${l.first_name} ${l.last_name}`.toLowerCase().includes(q) || (l.company_name || "").toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((l) => {
        items.push({
          type: "lead",
          id: `lead-${l.lead_id}`,
          title: `${l.first_name} ${l.last_name}`,
          subtitle: `${l.company_name || "New Prospect"} • Status: ${l.status?.toUpperCase()}`,
          icon: <UserPlus size={16} color="#2E7D46" />,
          action: () => { onClose(); navigate("/leads"); },
        });
      });

    return items;
  }, [query, data, navigate, onClose, onOpenNewDeal, onOpenNewLead]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          top: { xs: 40, sm: 80 },
          position: "fixed",
          boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
        },
      }}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5, borderBottom: 1, borderColor: "divider" }}>
        <Search size={20} color="#1160B7" />
        <TextField
          inputRef={inputRef}
          fullWidth
          variant="standard"
          placeholder="Search opportunities, accounts, contacts, leads…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          InputProps={{
            disableUnderline: true,
            sx: { fontSize: 15, fontWeight: 500 },
          }}
        />
        <IconButton size="small" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, maxHeight: 380, overflowY: "auto" }}>
        {results.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="body2">No matching records found for "{query}".</Typography>
            <Typography variant="caption" color="text.disabled">
              Try searching by company name, contact surname, or opportunity title.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 1 }}>
            {results.map((item, idx) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={selectedIndex === idx}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1.5,
                    "&.Mui-selected": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 34 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={<Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{item.title}</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary">{item.subtitle}</Typography>}
                  />
                  <ArrowRight size={14} color="#A0A0A0" />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <Box
        sx={{
          p: 1.5,
          px: 2,
          bgcolor: "action.hover",
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: "text.secondary",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <span><kbd style={{ padding: "2px 5px", background: "#fff", border: "1px solid #ccc", borderRadius: 3, fontSize: 10 }}>↑↓</kbd> Navigate</span>
          <span><kbd style={{ padding: "2px 5px", background: "#fff", border: "1px solid #ccc", borderRadius: 3, fontSize: 10 }}>Enter</kbd> Select</span>
          <span><kbd style={{ padding: "2px 5px", background: "#fff", border: "1px solid #ccc", borderRadius: 3, fontSize: 10 }}>Esc</kbd> Close</span>
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 600, color: "primary.main" }}>
          Cirrus Omnisearch
        </Typography>
      </Box>
    </Dialog>
  );
}
