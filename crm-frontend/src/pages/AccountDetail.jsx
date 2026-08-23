import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Phone, Globe, ChevronRight } from "lucide-react";
import { accountsApi, contactsApi, opportunitiesApi, activitiesApi } from "../api/resources";
import { DetailHeader, money } from "../components/Shared";
import { ActivityTimeline, ActivityLogForm } from "../components/Activity";

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      accountsApi.get(id),
      contactsApi.list(id),
      opportunitiesApi.list({ account_id: id }),
      activitiesApi.listFor("account", id),
    ])
      .then(([acc, contactList, oppList, actList]) => {
        if (cancelled) return;
        setAccount(acc);
        setContacts(contactList);
        setOpportunities(oppList);
        setActivities(actList);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="view"><div className="table-state">Loading account…</div></div>;
  if (error) return <div className="view"><div className="form-error">{error}</div></div>;
  //when there's no account
  if (!account) return <div className="view">Account not found.</div>;

  return (
    <div className="view">
      <DetailHeader
        eyebrow="Account"
        title={account.account_name}
        subtitle={account.industry}
        onBack={() => navigate("/accounts")}
      />

      <div className="detail-info-row">
        {account.phone && <span><Phone size={13} /> {account.phone}</span>}
        {account.website && <span><Globe size={13} /> {account.website}</span>}
      </div>

      <div className="detail-columns">
        <div className="dash-panel">
          <div className="panel-title">Contacts ({contacts.length})</div>
          {contacts.length === 0 && <div className="empty-block">No contacts yet.</div>}
          <div className="mini-list">
            {contacts.map((c) => (
              <div key={c.contact_id} className="mini-row" onClick={() => navigate(`/contacts/${c.contact_id}`)}>
                <span>{c.first_name} {c.last_name} <span className="mini-sub">— {c.job_title}</span></span>
                <ChevronRight size={14} className="chev" />
              </div>
            ))}
          </div>
        </div>
        <div className="dash-panel">
          <div className="panel-title">Opportunities ({opportunities.length})</div>
          {opportunities.length === 0 && <div className="empty-block">No opportunities yet.</div>}
          <div className="mini-list">
            {opportunities.map((o) => (
              <div key={o.opportunity_id} className="mini-row" onClick={() => navigate(`/opportunities/${o.opportunity_id}`)}>
                <span>{o.name}</span>
                <span className="mini-amount">{money(o.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-panel" style={{ marginTop: 16 }}>
        <div className="panel-title-row">
          <div className="panel-title">Activity</div>
          <ActivityLogForm parentType="account" parentId={Number(id)} onCreated={(a) => setActivities((prev) => [a, ...prev])} />
        </div>
        <ActivityTimeline activities={activities} />
      </div>
    </div>
  );
}
