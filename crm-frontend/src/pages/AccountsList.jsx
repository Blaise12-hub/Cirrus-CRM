import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, InputAdornment, Button, Alert } from "@mui/material";
import { Search, Plus } from "lucide-react";
import { accountsApi } from "../api/resources";
import { DataTable } from "../components/Shared";
import NewAccountModal from "../components/NewAccountModal";

export default function AccountsList() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    accountsApi.list()
      .then(setAccounts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const rows = accounts.filter((a) => a.account_name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Box className="view">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, gap: 1.5, flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Accounts</Typography>
        <Box sx={{ display: "flex", gap: 1.25 }}>
          <TextField
            size="small"
            placeholder="Search accounts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
            sx={{ width: 200 }}
          />
          <Button variant="contained" startIcon={<Plus size={14} />} onClick={() => setShowNew(true)}>
            New account
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

      <DataTable
        loading={loading}
        emptyMessage="No accounts yet."
        columns={[
          { key: "account_name", label: "Account name", render: (r) => <strong>{r.account_name}</strong> },
          { key: "industry", label: "Industry" },
          { key: "phone", label: "Phone" },
          {
            key: "owner", label: "Owner",
            render: (r) => r.owner_id
              ? <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5 }} color="text.secondary">#{r.owner_id}</Typography>
              : "—",
          },
        ]}
        rows={rows}
        onRowClick={(r) => navigate(`/accounts/${r.account_id}`)}
      />

      {showNew && (
        <NewAccountModal
          onClose={() => setShowNew(false)}
          onCreated={(created) => {
            setAccounts((prev) => [...prev, created]);
            setShowNew(false);
            navigate(`/accounts/${created.account_id}`);
          }}
        />
      )}
    </Box>
  );
}