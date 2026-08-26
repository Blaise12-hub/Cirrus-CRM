import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, Phone, Building2, ChevronRight } from "lucide-react";
import { contactsApi, accountsApi, opportunitiesApi, activitiesApi } from "../api/resources";
import { DetailHeader, money } from "../components/Shared";
import { ActivityTimeline, ActivityLogForm } from "../components/Activity";

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [account, setAccount] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const c = await contactsApi.get(id);
        if (cancelled) return;
        setContact(c);

        const [acc, allOpps, acts] = await Promise.all([
          c.account_id ? accountsApi.get(c.account_id).catch(() => null) : Promise.resolve(null),
          // The opportunities API doesn't filter by contact_id server-side yet,
          // so we fetch and filter client-side for now.
          opportunitiesApi.list(),
          activitiesApi.listFor("contact", id),
        ]);
        if (cancelled) return;
        setAccount(acc);
        setOpportunities(allOpps.filter((o) => o.contact_id === c.contact_id));
        setActivities(acts);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="view"><div className="table-state">Loading contact…</div></div>;
  if (error) return <div className="view"><div className="form-error">{error}</div></div>;
  if (!contact) return <div className="view">Contact not found.</div>;

  return (
    <div className="view">
      <DetailHeader
        eyebrow="Contact"
        title={`${contact.first_name} ${contact.last_name}`}
        subtitle={`${contact.job_title || ""}${account ? ` at ${account.account_name}` : ""}`}
        onBack={() => navigate("/contacts")}
      />

      <div className="detail-info-row">
        {contact.email && <span><Mail size={13} /> {contact.email}</span>}
        {contact.phone && <span><Phone size={13} /> {contact.phone}</span>}
        {account && (
          <span className="link-chip" onClick={() => navigate(`/accounts/${account.account_id}`)}>
            <Building2 size={13} /> {account.account_name}
          </span>
        )}
      </div>

      <div className="detail-columns">
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
        <div className="dash-panel">
          <div className="panel-title-row">
            <div className="panel-title">Activity</div>
            <ActivityLogForm parentType="contact" parentId={Number(id)} onCreated={(a) => setActivities((prev) => [a, ...prev])} />
          </div>
          <ActivityTimeline activities={activities} />
        </div>
      </div>
    </div>
  );
}
