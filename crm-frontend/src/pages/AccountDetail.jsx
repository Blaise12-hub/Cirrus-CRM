import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, Alert } from "@mui/material";
import { Phone, Globe, ChevronRight } from "lucide-react";
import { accountsApi, contactsApi, opportunitiesApi, activitiesApi } from "../api/resources";
import { DetailHeader, money } from "../components/Shared";
import { ActivityTimeline, ActivityLogForm } from "../components/Activity";
import { DetailSkeleton } from "../components/Skeleton";
import ReassignOwner from "../components/ReassignOwner";

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

  if (loading) return <DetailSkeleton />;
  if (error) return <Box className="view"><Alert severity="error">{error}</Alert></Box>;
  if (!account) return <Box className="view"><Typography>Account not found.</Typography></Box>;

  return (
    <Box className="view">
      <DetailHeader
        eyebrow="Account"
        title={account.account_name}
        subtitle={account.industry}
        onBack={() => navigate("/accounts")}
      />

      <Box sx={{ display: "flex", gap: 2.5, alignItems: "center", flexWrap: "wrap", mb: 2.25 }}>
        {account.phone && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Phone size={13} />
            <Typography variant="body2" color="text.secondary">{account.phone}</Typography>
          </Box>
        )}
        {account.website && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Globe size={13} />
            <Typography variant="body2" color="text.secondary">{account.website}</Typography>
          </Box>
        )}
        <ReassignOwner entityType="account" entityId={Number(id)} currentOwnerId={account.owner_id} onReassigned={setAccount} />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Contacts ({contacts.length})</Typography>
            {contacts.length === 0 && <Typography variant="body2" color="text.secondary">No contacts yet.</Typography>}
            {contacts.map((c) => (
              <MiniRow
                key={c.contact_id}
                onClick={() => navigate(`/contacts/${c.contact_id}`)}
                primary={<span>{c.first_name} {c.last_name} <Typography component="span" variant="body2" color="text.secondary">— {c.job_title}</Typography></span>}
                secondary={<ChevronRight size={14} color="#C4C4C4" />}
              />
            ))}
          </CardContent>
        </Card>
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
      </Box>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Activity</Typography>
            <ActivityLogForm parentType="account" parentId={Number(id)} onCreated={(a) => setActivities((prev) => [a, ...prev])} />
          </Box>
          <ActivityTimeline activities={activities} />
        </CardContent>
      </Card>
    </Box>
  );
}