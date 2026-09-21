import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Alert, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { Calendar, ChevronRight } from "lucide-react";
import { opportunitiesApi, contactsApi, activitiesApi } from "../api/resources";
import { DetailHeader, money, longDate } from "../components/Shared";
import { ProbabilityMeter } from "../components/Badges";
import { ActivityTimeline, ActivityLogForm } from "../components/Activity";
import ReassignOwner from "../components/ReassignOwner";
import OpportunityProducts from "../components/OpportunityProducts";
import { DetailSkeleton } from "../components/Skeleton";

const STAGES = [
  { key: "prospecting", label: "Prospecting", accent: "#8A8D91" },
  { key: "qualification", label: "Qualification", accent: "#5E7CE2" },
  { key: "proposal", label: "Proposal", accent: "#1160B7" },
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
    if (!opp || !stage || opp.stage === stage) return;
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

  if (loading) return <DetailSkeleton />;
  if (error && !opp) return <Box className="view"><Alert severity="error">{error}</Alert></Box>;
  if (!opp) return <Box className="view"><Typography>Opportunity not found.</Typography></Box>;

  const currentStage = STAGES.find((s) => s.key === opp.stage);

  return (
    <Box className="view">
      <DetailHeader
        eyebrow="Opportunity"
        title={opp.name}
        subtitle={opp.account_name}
        onBack={() => navigate("/pipeline")}
        right={<Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 24, fontWeight: 700, color: "primary.main" }}>{money(opp.amount)}</Typography>}
      />

      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

      <ToggleButtonGroup
        exclusive
        value={opp.stage}
        onChange={(e, val) => setStage(val)}
        size="small"
        sx={{ mb: 2, flexWrap: "wrap", gap: 0.75 }}
      >
        {STAGES.map((s) => (
          <ToggleButton
            key={s.key}
            value={s.key}
            disabled={stageSaving}
            sx={{
              borderRadius: "20px !important", border: "1px solid", borderColor: "divider",
              textTransform: "none", fontWeight: 600, fontSize: 12, px: 1.75,
              "&.Mui-selected": { bgcolor: s.accent, color: "#fff", borderColor: s.accent, "&:hover": { bgcolor: s.accent } },
            }}
          >
            {s.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Box sx={{ display: "flex", gap: 2.5, alignItems: "center", flexWrap: "wrap", mb: 2.25 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Calendar size={13} />
          <Typography variant="body2" color="text.secondary">Closes {longDate(opp.close_date)}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Typography variant="body2" color="text.secondary">Probability</Typography>
          <ProbabilityMeter value={opp.probability} />
        </Box>
        <ReassignOwner entityType="opportunity" entityId={Number(id)} currentOwnerId={opp.owner_id} onReassigned={setOpp} />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Primary contact</Typography>
            {contact ? (
              <Box
                onClick={() => navigate(`/contacts/${contact.contact_id}`)}
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, cursor: "pointer", borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}
              >
                <span>{contact.first_name} {contact.last_name} <Typography component="span" variant="body2" color="text.secondary">— {contact.job_title}</Typography></span>
                <ChevronRight size={14} color="#C4C4C4" />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No contact linked.</Typography>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Activity</Typography>
              <ActivityLogForm parentType="opportunity" parentId={Number(id)} onCreated={(a) => setActivities((prev) => [a, ...prev])} />
            </Box>
            <ActivityTimeline activities={activities} />
          </CardContent>
        </Card>
      </Box>

      {/* Full-width now, rather than wrapping awkwardly as a 3rd item in the 2-col grid above */}
      <Box sx={{ mt: 2 }}>
        <OpportunityProducts opportunityId={Number(id)} />
      </Box>
    </Box>
  );
}