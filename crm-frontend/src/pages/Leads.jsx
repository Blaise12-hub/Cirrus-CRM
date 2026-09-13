import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ArrowRightCircle } from "lucide-react";
import { leadsApi } from "../api/resources";
import { DataTable } from "../components/Shared";
import { LeadStatusPill } from "../components/Badges";
import NewLeadModal from "../components/NewLeadModal";

function ConvertLeadModal({ lead, onClose, onConfirm, saving, error }) {
  const [createAccount, setCreateAccount] = useState(!!lead.company_name);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Convert lead</span>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p className="convert-summary">
            This will create a new contact for <strong>{lead.first_name} {lead.last_name}</strong>
            {createAccount && lead.company_name && <> and a new account for <strong>{lead.company_name}</strong></>}.
            The lead will be marked as converted.
          </p>
          {lead.company_name && (
            <label className="checkbox-row">
              <input type="checkbox" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />
              Create a new account from "{lead.company_name}"
            </label>
          )}
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="button" className="btn-primary" onClick={() => onConfirm(createAccount)} disabled={saving}>
              {saving ? "Converting…" : "Convert lead"}
            </button>
          </div>
        </div>
      </div>
    </div>
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
  const [showNewLead, setShowNewLead] = useState(false);

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
    <div className="view">
      <div className="pb-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Leads</h1>
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search leads" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

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
                <span className="converted-tag">Converted</span>
              ) : (
                <button className="btn-convert" onClick={(e) => { e.stopPropagation(); setConvertingLead(r); setConvertError(""); }}>
                  <ArrowRightCircle size={13} /> Convert
                </button>
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
    </div>
  );
}
