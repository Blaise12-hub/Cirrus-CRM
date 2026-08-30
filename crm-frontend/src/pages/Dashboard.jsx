import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { opportunitiesApi, leadsApi } from "../api/resources";
import { money } from "../components/Shared";
import { ActivityTimeline } from "../components/Activity";
import { useAuth } from "../context/AuthContext";
import { DetailSkeleton } from "../components/Skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [opps, leadList] = await Promise.all([opportunitiesApi.list(), leadsApi.list()]);
        if (!cancelled) {
          setOpportunities(opps);
          setLeads(leadList);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  //skeleton loader
  if (loading) return <DetailSkeleton />;
  if (error) return <div className="view"><div className="form-error">{error}</div></div>;

  const open = opportunities.filter((o) => o.stage !== "won" && o.stage !== "lost");
  const openTotal = open.reduce((s, o) => s + Number(o.amount), 0);
  const wonTotal = opportunities.filter((o) => o.stage === "won").reduce((s, o) => s + Number(o.amount), 0);
  const newLeads = leads.filter((l) => l.status === "new");

  return (
    <div className="view">
      <h1 className="page-title">Good morning, {user?.first_name || ""}</h1>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Open pipeline</div>
          <div className="stat-value">{money(openTotal)}</div>
          <div className="stat-sub">{open.length} open deals</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Won this period</div>
          <div className="stat-value" style={{ color: "#2E7D46" }}>{money(wonTotal)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total deals</div>
          <div className="stat-value">{opportunities.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">New leads</div>
          <div className="stat-value">{newLeads.length}</div>
        </div>
      </div>

      <div className="dash-columns">
        <div className="dash-panel">
          <div className="panel-title">Deals closing soon</div>
          <div className="mini-list">
            {open.length === 0 && <div className="empty-block">No open deals.</div>}
            {open.slice(0, 6).map((o) => (
              <div key={o.opportunity_id} className="mini-row" onClick={() => navigate(`/opportunities/${o.opportunity_id}`)}>
                <span>{o.name}</span>
                <span className="mini-amount">{money(o.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dash-panel">
          <div className="panel-title">New leads</div>
          <div className="mini-list">
            {newLeads.length === 0 && <div className="empty-block">No new leads.</div>}
            {newLeads.slice(0, 6).map((l) => (
              <div key={l.lead_id} className="mini-row" onClick={() => navigate("/leads")}>
                <span>{l.first_name} {l.last_name}</span>
                <span className="mini-sub">{l.company_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
