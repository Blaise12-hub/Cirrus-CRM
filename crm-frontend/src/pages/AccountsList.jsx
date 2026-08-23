import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { accountsApi } from "../api/resources";
import { DataTable } from "../components/Shared";


export default function AccountsList() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

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
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search accounts" value={query} onChange={(e) => setQuery(e.target.value)} />
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
    </div>
  );
}
