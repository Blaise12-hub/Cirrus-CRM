import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, InputAdornment, Button, Checkbox, FormControlLabel, Alert } from "@mui/material";
import { Search, ArrowRightCircle } from "lucide-react";
import { leadsApi } from "../api/resources";
import { DataTable } from "../components/Shared";
import { LeadStatusPill } from "../components/Badges";
import { Modal } from "../components/Modal";

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
  const [convertingLead, setConvertingLead] = useState(null);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState("");

  useEffect(() => {
    leadsApi.list()
      .then(setLeads)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

  const rows = leads.filter((l) => `${l.first_name} ${l.last_name}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <Box className="view">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, gap: 1.5, flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Leads</Typography>
        <TextField
          size="small"
          placeholder="Search leads"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
          sx={{ width: 220 }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <DataTable
        loading={loading}
        emptyMessage="No leads yet."
        columns={[
          { key: "name", label: "Name", render: (r) => <strong>{r.first_name} {r.last_name}</strong> },
          { key: "company_name", label: "Company" },
          { key: "lead_source", label: "Source" },
          { key: "status", label: "Status", render: (r) => <LeadStatusPill status={r.status} /> },
          {
            key: "action",
            label: "",
            render: (r) =>
              r.status === "converted" ? (
                <Typography variant="caption" color="text.secondary" fontStyle="italic">Converted</Typography>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ArrowRightCircle size={13} />}
                  onClick={(e) => { e.stopPropagation(); setConvertingLead(r); setConvertError(""); }}
                >
                  Convert
                </Button>
              ),
          },
        ]}
        rows={rows}
      />

      {convertingLead && (
        <ConvertLeadModal
          lead={convertingLead}
          onClose={() => setConvertingLead(null)}
          onConfirm={confirmConvert}
          saving={converting}
          error={convertError}
        />
      )}
    </Box>
  );
}