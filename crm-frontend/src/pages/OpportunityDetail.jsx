import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, ChevronRight } from "lucide-react";
import { opportunitiesApi, contactsApi, activitiesApi } from "../api/resources";
import { DetailHeader, money, longDate } from "../components/Shared";
import { ProbabilityMeter } from "../components/Badges";
import { ActivityTimeline, ActivityLogForm } from "../components/Activity";

//mock data
const STAGES = [
  { key: "prospecting", label: "Prospecting", accent: "#8A8D91" },
  { key: "qualification", label: "Qualification", accent: "#5E7CE2" },
  { key: "proposal", label: "Proposal", accent: "#0B5CAB" },
  { key: "negotiation", label: "Negotiation", accent: "#B25E09" },
  { key: "won", label: "Won", accent: "#2E7D46" },
  { key: "lost", label: "Lost", accent: "#B3261E" },
];

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [contact, setContact] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stageSaving, setStageSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const o = await opportunitiesApi.get(id);
        if (cancelled) return;
        setOpp(o);

        const [c, acts] = await Promise.all([
          o.contact_id ? contactsApi.get(o.contact_id).catch(() => null) : Promise.resolve(null),
          activitiesApi.listFor("opportunity", id),
        ]);
        if (cancelled) return;
        setContact(c);
        setActivities(acts);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const setStage = async (stage) => {
    if (!opp || opp.stage === stage) return;
    const prevStage = opp.stage;
    setOpp((prev) => ({ ...prev, stage })); // optimistic
    setStageSaving(true);
    try {
      const updated = await opportunitiesApi.updateStage(id, stage);
      setOpp(updated);
    } catch (err) {
      setOpp((prev) => ({ ...prev, stage: prevStage }));
      setError(`Failed to update stage: ${err.message}`);
    } finally {
      setStageSaving(false);
    }
  };

  if (loading) return <div className="view"><div className="table-state">Loading opportunity…</div></div>;
  if (error && !opp) return <div className="view"><div className="form-error">{error}</div></div>;
  if (!opp) return <div className="view">Opportunity not found.</div>;

  return (
    <div className="view">
      <DetailHeader
        eyebrow="Opportunity"
        title={opp.name}
        subtitle={opp.account_name}
        onBack={() => navigate("/pipeline")}
        right={<div className="amount-hero">{money(opp.amount)}</div>}
      />

      {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="stage-selector">
        {STAGES.map((s) => (
          <button
            key={s.key}
            className={`stage-btn ${opp.stage === s.key ? "active" : ""}`}
            style={opp.stage === s.key ? { background: s.accent, borderColor: s.accent } : {}}
            onClick={() => setStage(s.key)}
            disabled={stageSaving}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="detail-info-row">
        <span><Calendar size={13} /> Closes {longDate(opp.close_date)}</span>
        <span>Probability <ProbabilityMeter value={opp.probability} /></span>
      </div>

      <div className="detail-columns">
        <div className="dash-panel">
          <div className="panel-title">Primary contact</div>
          {contact ? (
            <div className="mini-row" onClick={() => navigate(`/contacts/${contact.contact_id}`)}>
              <span>{contact.first_name} {contact.last_name} <span className="mini-sub">— {contact.job_title}</span></span>
              <ChevronRight size={14} className="chev" />
            </div>
          ) : (
            <div className="empty-block">No contact linked.</div>
          )}
        </div>
        <div className="dash-panel">
          <div className="panel-title-row">
            <div className="panel-title">Activity</div>
            <ActivityLogForm parentType="opportunity" parentId={Number(id)} onCreated={(a) => setActivities((prev) => [a, ...prev])} />
          </div>
          <ActivityTimeline activities={activities} />
        </div>
      </div>
    </div>
  );
}
