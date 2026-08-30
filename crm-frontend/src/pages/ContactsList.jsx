import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="view">
      <div className="pb-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Contacts</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="search-box">
            <Search size={14} />
            <input placeholder="Search contacts" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={() => setShowNew(true)}>
            <Plus size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} /> New contact
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

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
    {/* //new contact modal */}
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
    </div>
  );
}
