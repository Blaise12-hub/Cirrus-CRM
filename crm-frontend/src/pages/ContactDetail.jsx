import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Alert } from "@mui/material";
import { Mail, Phone, Building2 } from "lucide-react";
import { contactsApi, accountsApi, opportunitiesApi, activitiesApi } from "../api/resources";
import { DetailHeader, money } from "../components/Shared";
import { ActivityTimeline, ActivityLogForm } from "../components/Activity";
import ReassignOwner from "../components/ReassignOwner";
import { DetailSkeleton } from "../components/Skeleton";

function MiniRow({ onClick, primary, secondary }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        p: 1, fontSize: 13, cursor: "pointer", borderRadius: 1,
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      {primary}
      {secondary}
    </Box>
  );
}

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

  if (loading) return <DetailSkeleton />;
  if (error) return <Box className="view"><Alert severity="error">{error}</Alert></Box>;
  if (!contact) return <Box className="view"><Typography>Contact not found.</Typography></Box>;

  return (
    <Box className="view">
      <DetailHeader
        eyebrow="Contact"
        title={`${contact.first_name} ${contact.last_name}`}
        subtitle={`${contact.job_title || ""}${account ? ` at ${account.account_name}` : ""}`}
        onBack={() => navigate("/contacts")}
      />

      <Box sx={{ display: "flex", gap: 2.5, alignItems: "center", flexWrap: "wrap", mb: 2.25 }}>
        {contact.email && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Mail size={13} />
            <Typography variant="body2" color="text.secondary">{contact.email}</Typography>
          </Box>
        )}
        {contact.phone && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Phone size={13} />
            <Typography variant="body2" color="text.secondary">{contact.phone}</Typography>
          </Box>
        )}
        <ReassignOwner entityType="contact" entityId={Number(id)} currentOwnerId={contact.owner_id} onReassigned={setContact} />
        {account && (
          <Box
            onClick={() => navigate(`/accounts/${account.account_id}`)}
            sx={{ display: "flex", alignItems: "center", gap: 0.6, cursor: "pointer", color: "primary.main", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
          >
            <Building2 size={13} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: "inherit" }}>{account.account_name}</Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Opportunities ({opportunities.length})</Typography>
            {opportunities.length === 0 && <Typography variant="body2" color="text.secondary">No opportunities yet.</Typography>}
            {opportunities.map((o) => (
              <MiniRow
                key={o.opportunity_id}
                onClick={() => navigate(`/opportunities/${o.opportunity_id}`)}
                primary={<span>{o.name}</span>}
                secondary={<span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 12.5 }}>{money(o.amount)}</span>}
              />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Activity</Typography>
              <ActivityLogForm parentType="contact" parentId={Number(id)} onCreated={(a) => setActivities((prev) => [a, ...prev])} />
            </Box>
            <ActivityTimeline activities={activities} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
} 