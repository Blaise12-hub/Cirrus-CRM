import React from "react";
import { Avatar as MuiAvatar, Chip, Box, Typography } from "@mui/material";

export const OWNER_COLORS = { EN: "#1160B7", DM: "#2E7D46", AU: "#8A3FFC" };

export function Avatar({ code, size = 26 }) {
  if (!code) return null;
  return (
    <MuiAvatar
      sx={{ bgcolor: OWNER_COLORS[code] || "#6B6B6B", width: size, height: size, fontSize: size * 0.4, fontWeight: 700 }}
      title={code}
    >
      {code}
    </MuiAvatar>
  );
}

// Kept as a custom segmented bar rather than MUI's LinearProgress — the
// 5-segment look is a distinctive design choice worth keeping, not
// something a generic progress bar would reproduce.
export function ProbabilityMeter({ value }) {
  const filled = Math.round((value || 0) / 20);
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, verticalAlign: "middle", ml: 0.75 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          sx={{ width: 14, height: 4, borderRadius: 0.5, bgcolor: i < filled ? "primary.main" : "action.disabledBackground" }}
        />
      ))}
      <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "text.secondary", ml: 0.5 }}>
        {value}%
      </Typography>
    </Box>
  );
}

const STAGE_ACCENTS = {
  prospecting: "#8A8D91", qualification: "#5E7CE2", proposal: "#1160B7",
  negotiation: "#B25E09", won: "#2E7D46", lost: "#B3261E",
};

export function StagePill({ stage }) {
  const accent = STAGE_ACCENTS[stage] || "#6B6B6B";
  return (
    <Chip
      label={stage}
      size="small"
      sx={{ bgcolor: `${accent}1A`, color: accent, fontWeight: 600, textTransform: "capitalize" }}
    />
  );
}

const LEAD_STATUS_COLORS = {
  new: "#5E7CE2", contacted: "#B25E09", qualified: "#2E7D46",
  converted: "#1160B7", disqualified: "#B3261E",
};

export function LeadStatusPill({ status }) {
  const c = LEAD_STATUS_COLORS[status] || "#6B6B6B";
  return (
    <Chip
      label={status}
      size="small"
      sx={{ bgcolor: `${c}1A`, color: c, fontWeight: 600, textTransform: "capitalize" }}
    />
  );
}