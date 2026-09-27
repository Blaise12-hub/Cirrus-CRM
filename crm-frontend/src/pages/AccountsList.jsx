import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, InputAdornment, Button, Alert,
  Chip, MenuItem
} from "@mui/material";
import { Search, Plus, Download, Building2 } from "lucide-react";
import { accountsApi } from "../api/resources";
import { DataTable } from "../components/Shared";
import NewAccountModal from "../components/NewAccountModal";

export default function AccountsList() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    accountsApi.list()
      .then(setAccounts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const industries = useMemo(() => {
    const set = new Set();
    accounts.forEach((a) => {
      if (a.industry) set.add(a.industry);
    });
    return Array.from(set);
  }, [accounts]);

  const rows = useMemo(() => {
    return accounts.filter((a) => {
      const name = (a.account_name || a.name || "").toLowerCase();
      const industry = (a.industry || "").toLowerCase();
      const phone = (a.phone || "").toLowerCase();
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || name.includes(q) || industry.includes(q) || phone.includes(q);
      const matchesIndustry = industryFilter === "all" || a.industry === industryFilter;
      return matchesQuery && matchesIndustry;
    });
  }, [accounts, query, industryFilter]);

  const exportCSV = () => {
    const headers = ["Account Name,Industry,Phone,Website\n"];
    const rowsCSV = rows.map((a) =>
      `"${a.account_name || a.name || ""}","${a.industry || ""}","${a.phone || ""}","${a.website || ""}"`
    );
    const blob = new Blob([headers.concat(rowsCSV.join("\n"))], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cirrus-accounts-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box className="view">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, gap: 1.5, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Accounts</Typography>
          <Chip
            label={`${accounts.length} Total`}
            size="small"
            sx={{ fontWeight: 700, height: 22, fontSize: 11 }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1.25, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search accounts or industry…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
            sx={{ width: { xs: 160, sm: 220 } }}
          />

          {industries.length > 0 && (
            <TextField
              select
              size="small"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              sx={{ width: 150 }}
            >
              <MenuItem value="all">All Industries</MenuItem>
              {industries.map((ind) => (
                <MenuItem key={ind} value={ind}>{ind}</MenuItem>
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
            New Account
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

      <DataTable
        loading={loading}
        emptyMessage="No accounts found."
        columns={[
          {
            key: "account_name",
            label: "Account Name",
            render: (r) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Building2 size={14} color="#1160B7" />
                <Typography sx={{ fontWeight: 700, color: "primary.main", fontSize: 13 }}>
                  {r.account_name || r.name}
                </Typography>
              </Box>
            ),
          },
          {
            key: "industry",
            label: "Industry",
            render: (r) => r.industry ? <Chip label={r.industry} size="small" sx={{ height: 20, fontSize: 10.5 }} /> : "—",
          },
          { key: "phone", label: "Phone", render: (r) => r.phone || "—" },
          {
            key: "website",
            label: "Website",
            render: (r) => r.website ? (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>{r.website}</Typography>
            ) : "—",
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