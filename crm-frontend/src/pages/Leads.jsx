import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, InputAdornment, Button,
  Checkbox, FormControlLabel, Alert, Tabs, Tab, Card,
  CardContent, Chip, Tooltip, IconButton
} from "@mui/material";
import {
  Search, Plus, ArrowRightCircle, Download,
  UserCheck, Flame, Users, CheckCircle2, Building
} from "lucide-react";
import { leadsApi } from "../api/resources";
import { DataTable } from "../components/Shared";
import { LeadStatusPill } from "../components/Badges";
import { Modal } from "../components/Modal";
import NewLeadModal from "../components/NewLeadModal";

function ConvertLeadModal({ lead, onClose, onConfirm, saving, error }) {
  const [createAccount, setCreateAccount] = useState(!!lead.company_name);

  return (
    <Modal title="Convert lead" onClose={onClose}>
      <Typography variant="body2" sx={{ mb: 1.5 }}>
        This will create a new contact for <strong>{lead.first_name} {lead.last_name}</strong>
        {createAccount && lead.company_name && <> and a new account for <strong>{lead.company_name}</strong></>}.
        The lead will be marked as converted.
      </Typography>

      {lead.company_name && (
        <FormControlLabel
          control={<Checkbox size="small" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />}
          label={`Create a new account from "${lead.company_name}"`}
          sx={{ mb: 1 }}
        />
      )}

      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={() => onConfirm(createAccount)} disabled={saving}>
          {saving ? "Converting…" : "Convert lead"}
        </Button>
      </Box>
    </Modal>
  );
}

export default function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [convertingLead, setConvertingLead] = useState(null);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState("");
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = () => {
    setLoading(true);
    leadsApi.list()
      .then(setLeads)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const confirmConvert = async (createAccount) => {
    setConverting(true);
    setConvertError("");
    try {
      const { lead, contact } = await leadsApi.convert(convertingLead.lead_id, { create_account: createAccount });
      setLeads((prev) => prev.map((l) => (l.lead_id === lead.lead_id ? lead : l)));
      setConvertingLead(null);
      navigate(`/contacts/${contact.contact_id}`);
    } catch (err) {
      setConvertError(err.message);
    } finally {
      setConverting(false);
    }
  };

  // Lead metrics
  const stats = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === "new").length;
    const qualified = leads.filter((l) => l.status === "qualified").length;
    const converted = leads.filter((l) => l.status === "converted").length;
    const convRate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0.0";
    return { total, newCount, qualified, converted, convRate };
  }, [leads]);

  // Filtered rows
  const rows = useMemo(() => {
    return leads.filter((l) => {
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      const q = query.trim().toLowerCase();
      const fullName = `${l.first_name || ""} ${l.last_name || ""}`.toLowerCase();
      const company = (l.company_name || "").toLowerCase();
      const source = (l.lead_source || "").toLowerCase();
      const matchesQuery = !q || fullName.includes(q) || company.includes(q) || source.includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [leads, statusFilter, query]);

  const exportCSV = () => {
    const headers = ["First Name,Last Name,Company,Source,Status,Created At\n"];
    const rowsCSV = rows.map((l) =>
      `"${l.first_name}","${l.last_name}","${l.company_name || ""}","${l.lead_source || ""}","${l.status}","${l.created_at || ""}"`
    );
    const blob = new Blob([headers.concat(rowsCSV.join("\n"))], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cirrus-leads-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box className="view">
      {/* ── KPI Metric Cards ─────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 1.75, mb: 2.5 }}>
        <Card>
          <CardContent sx={{ p: "16px !important" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase" }} color="text.secondary">
              Total Inbound Leads
            </Typography>
            <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, mt: 0.5 }}>
              {stats.total}
            </Typography>
            <Typography variant="caption" color="text.secondary">Active queue</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: "16px !important" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase" }} color="text.secondary">
              New & Uncontacted
            </Typography>
            <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, mt: 0.5, color: "primary.main" }}>
              {stats.newCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">Requires outreach</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: "16px !important" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase" }} color="text.secondary">
              Sales Qualified
            </Typography>
            <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, mt: 0.5, color: "warning.main" }}>
              {stats.qualified}
            </Typography>
            <Typography variant="caption" color="text.secondary">Ready for conversion</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: "16px !important" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase" }} color="text.secondary">
              Conversion Rate
            </Typography>
            <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, mt: 0.5, color: "success.main" }}>
              {stats.convRate}%
            </Typography>
            <Typography variant="caption" color="success.main">{stats.converted} converted to accounts</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* ── Toolbar: Search, Filters & Actions ──────────────── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 1.5, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search by name, company, source…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
            sx={{ width: { xs: 180, sm: 260 } }}
          />

          <Box sx={{ display: "flex", gap: 0.5, overflowX: "auto" }}>
            {["all", "new", "contacted", "qualified", "converted"].map((st) => (
              <Chip
                key={st}
                label={st.toUpperCase()}
                size="small"
                clickable
                color={statusFilter === st ? "primary" : "default"}
                variant={statusFilter === st ? "filled" : "outlined"}
                onClick={() => setStatusFilter(st)}
                sx={{ height: 26, fontSize: 11, fontWeight: 700 }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Download size={14} />}
            onClick={exportCSV}
            disabled={rows.length === 0}
          >
            Export CSV
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<Plus size={14} />}
            onClick={() => setIsNewLeadOpen(true)}
          >
            New Lead
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── Leads DataTable ──────────────────────────────────── */}
      <DataTable
        loading={loading}
        emptyMessage="No leads found matching your criteria."
        columns={[
          {
            key: "name",
            label: "Lead Name",
            render: (r) => (
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>
                  {r.first_name} {r.last_name}
                </Typography>
                {r.email && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: 11 }}>
                    {r.email}
                  </Typography>
                )}
              </Box>
            ),
          },
          {
            key: "company_name",
            label: "Company / Account",
            render: (r) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Building size={12} color="#6B6B6B" />
                <Typography sx={{ fontSize: 13 }}>{r.company_name || "—"}</Typography>
              </Box>
            ),
          },
          {
            key: "lead_source",
            label: "Lead Source",
            render: (r) => (
              <Chip
                label={r.lead_source || "Direct"}
                size="small"
                sx={{ height: 20, fontSize: 10.5, bgcolor: "action.hover" }}
              />
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (r) => <LeadStatusPill status={r.status} />,
          },
          {
            key: "action",
            label: "",
            render: (r) =>
              r.status === "converted" ? (
                <Typography variant="caption" color="text.secondary" fontStyle="italic">
                  Converted
                </Typography>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ArrowRightCircle size={13} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConvertingLead(r);
                    setConvertError("");
                  }}
                  sx={{ fontSize: 11.5, py: 0.25 }}
                >
                  Convert
                </Button>
              ),
          },
        ]}
        rows={rows}
      />

      {/* ── Convert Lead Modal ───────────────────────────────── */}
      {convertingLead && (
        <ConvertLeadModal
          lead={convertingLead}
          onClose={() => setConvertingLead(null)}
          onConfirm={confirmConvert}
          saving={converting}
          error={convertError}
        />
      )}

      {/* ── New Lead Modal ───────────────────────────────────── */}
      {isNewLeadOpen && (
        <NewLeadModal
          onClose={() => setIsNewLeadOpen(false)}
          onCreated={(created) => {
            setLeads((prev) => [created, ...prev]);
            setIsNewLeadOpen(false);
          }}
        />
      )}
    </Box>
  );
}