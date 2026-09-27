import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, InputAdornment, Button, Alert,
  Chip, MenuItem
} from "@mui/material";
import { Search, Plus, Download, Mail, Phone, Building } from "lucide-react";
import { contactsApi, accountsApi } from "../api/resources";
import { DataTable } from "../components/Shared";
import NewContactModal from "../components/NewContactModal";

export default function ContactsList() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    Promise.all([contactsApi.list(), accountsApi.list()])
      .then(([contactList, accountList]) => {
        setContacts(contactList);
        setAccounts(accountList);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const accountName = (accountId) => {
    const acc = accounts.find((a) => a.account_id === accountId);
    return acc ? acc.account_name || acc.name : "—";
  };

  const rows = useMemo(() => {
    return contacts.filter((c) => {
      const q = query.trim().toLowerCase();
      const fullName = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
      const email = (c.email || "").toLowerCase();
      const phone = (c.phone || "").toLowerCase();
      const title = (c.job_title || "").toLowerCase();
      const acc = accountName(c.account_id).toLowerCase();

      const matchesQuery = !q || fullName.includes(q) || email.includes(q) || phone.includes(q) || title.includes(q) || acc.includes(q);
      const matchesAccount = accountFilter === "all" || String(c.account_id) === String(accountFilter);

      return matchesQuery && matchesAccount;
    });
  }, [contacts, accounts, query, accountFilter]);

  const exportCSV = () => {
    const headers = ["First Name,Last Name,Title,Account,Email,Phone\n"];
    const rowsCSV = rows.map((c) =>
      `"${c.first_name}","${c.last_name}","${c.job_title || ""}","${accountName(c.account_id)}","${c.email || ""}","${c.phone || ""}"`
    );
    const blob = new Blob([headers.concat(rowsCSV.join("\n"))], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cirrus-contacts-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box className="view">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, gap: 1.5, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Contacts</Typography>
          <Chip
            label={`${contacts.length} Total`}
            size="small"
            sx={{ fontWeight: 700, height: 22, fontSize: 11 }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1.25, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search contacts, title, email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
            sx={{ width: { xs: 160, sm: 220 } }}
          />

          {accounts.length > 0 && (
            <TextField
              select
              size="small"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              sx={{ width: 170 }}
            >
              <MenuItem value="all">All Accounts</MenuItem>
              {accounts.map((acc) => (
                <MenuItem key={acc.account_id} value={String(acc.account_id)}>
                  {acc.account_name || acc.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Button
            variant="outlined"
            size="small"
            startIcon={<Download size={14} />}
            onClick={exportCSV}
            disabled={rows.length === 0}
          >
            Export CSV
          </Button>

          <Button variant="contained" size="small" startIcon={<Plus size={14} />} onClick={() => setShowNew(true)}>
            New Contact
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

      <DataTable
        loading={loading}
        emptyMessage="No contacts found."
        columns={[
          {
            key: "name",
            label: "Name",
            render: (r) => (
              <Box>
                <Typography sx={{ fontWeight: 700, color: "primary.main", fontSize: 13 }}>
                  {r.first_name} {r.last_name}
                </Typography>
                {r.job_title && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: 11 }}>
                    {r.job_title}
                  </Typography>
                )}
              </Box>
            ),
          },
          {
            key: "account",
            label: "Account",
            render: (r) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Building size={12} color="#6B6B6B" />
                <span>{accountName(r.account_id)}</span>
              </Box>
            ),
          },
          {
            key: "email",
            label: "Email Address",
            render: (r) => r.email ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Mail size={12} color="#6B6B6B" />
                <Typography variant="caption" sx={{ fontSize: 12 }}>{r.email}</Typography>
              </Box>
            ) : "—",
          },
          {
            key: "phone",
            label: "Phone",
            render: (r) => r.phone ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Phone size={12} color="#6B6B6B" />
                <Typography variant="caption" sx={{ fontSize: 12 }}>{r.phone}</Typography>
              </Box>
            ) : "—",
          },
        ]}
        rows={rows}
        onRowClick={(r) => navigate(`/contacts/${r.contact_id}`)}
      />

      {showNew && (
        <NewContactModal
          accounts={accounts}
          onClose={() => setShowNew(false)}
          onCreated={(created) => {
            setContacts((prev) => [...prev, created]);
            setShowNew(false);
            navigate(`/contacts/${created.contact_id}`);
          }}
        />
      )}
    </Box>
  );
}