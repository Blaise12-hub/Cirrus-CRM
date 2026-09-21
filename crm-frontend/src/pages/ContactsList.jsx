import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, InputAdornment, Button, Alert } from "@mui/material";
import { Search, Plus } from "lucide-react";
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

  const accountName = (accountId) => accounts.find((a) => a.account_id === accountId)?.account_name || "—";
  const rows = contacts.filter((c) => `${c.first_name} ${c.last_name}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <Box className="view">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, gap: 1.5, flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Contacts</Typography>
        <Box sx={{ display: "flex", gap: 1.25 }}>
          <TextField
            size="small"
            placeholder="Search contacts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
            sx={{ width: 200 }}
          />
          <Button variant="contained" startIcon={<Plus size={14} />} onClick={() => setShowNew(true)}>
            New contact
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

      <DataTable
        loading={loading}
        emptyMessage="No contacts yet."
        columns={[
          { key: "name", label: "Name", render: (r) => <strong>{r.first_name} {r.last_name}</strong> },
          { key: "job_title", label: "Title" },
          { key: "account", label: "Account", render: (r) => accountName(r.account_id) },
          { key: "email", label: "Email" },
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