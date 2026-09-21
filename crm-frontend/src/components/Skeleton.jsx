import React from "react";
import { Box, Skeleton, Table, TableBody, TableRow, TableCell, Card, CardContent } from "@mui/material";

// MUI's Skeleton has its own built-in shimmer animation — this replaces the
// old .skeleton-bar CSS keyframe entirely rather than reimplementing it.

export function TableSkeleton({ columns = 4, rows = 5 }) {
  return (
    <Table size="small">
      <TableBody>
        {Array.from({ length: rows }).map((_, r) => (
          <TableRow key={r}>
            {Array.from({ length: columns }).map((_, c) => (
              <TableCell key={c}>
                <Skeleton variant="text" width={c === 0 ? "70%" : "50%"} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TimelineSkeleton({ rows = 3 }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ display: "flex", gap: 1.25 }}>
          <Skeleton variant="circular" width={16} height={16} sx={{ mt: 0.25, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="65%" height={18} />
            <Skeleton variant="text" width="35%" height={15} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export function KanbanSkeleton({ columns = 5 }) {
  return (
    <Box sx={{ display: "flex", gap: 1.75, overflowX: "auto", pb: 1.5 }}>
      {Array.from({ length: columns }).map((_, c) => (
        <Box key={c} sx={{ flex: "0 0 260px" }}>
          <Card variant="outlined" sx={{ bgcolor: "action.hover" }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={18} />
              <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1.5 }} />
              {Array.from({ length: 2 + (c % 2) }).map((_, i) => (
                <Card key={i} sx={{ mb: 1, p: 1.25 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="55%" />
                  <Skeleton variant="text" width="45%" height={22} />
                </Card>
              ))}
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
}

export function DetailSkeleton() {
  return (
    <Box className="view">
      <Skeleton variant="text" width={60} height={16} sx={{ mb: 1.5 }} />
      <Skeleton variant="text" width="40%" height={32} />
      <Skeleton variant="text" width="25%" height={18} sx={{ mb: 2 }} />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <Card><CardContent><Skeleton variant="text" width="30%" sx={{ mb: 1.5 }} /><TimelineSkeleton rows={2} /></CardContent></Card>
        <Card><CardContent><Skeleton variant="text" width="30%" sx={{ mb: 1.5 }} /><TimelineSkeleton rows={2} /></CardContent></Card>
      </Box>
    </Box>
  );
}