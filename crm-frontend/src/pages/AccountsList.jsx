import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="view">
      <div className="pb-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Accounts</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="search-box">
            <Search size={14} />
            <input placeholder="Search accounts" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={() => setShowNew(true)}>
            <Plus size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} /> New account
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <DataTable
        loading={loading}
        emptyMessage="No accounts yet."
        columns={[
          { key: "account_name", label: "Account name", render: (r) => <strong>{r.account_name}</strong> },
          { key: "industry", label: "Industry" },
          { key: "phone", label: "Phone" },
          { key: "owner", label: "Owner", render: (r) => r.owner_id ? <span className="owner-id-badge">#{r.owner_id}</span> : "—" },
        ]}
        rows={rows}
        onRowClick={(r) => navigate(`/accounts/${r.account_id}`)}
      />
    {/* //new account modal */}
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
    </div>
  );
}
