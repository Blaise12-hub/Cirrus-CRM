import React from "react";
import { Box, Typography, Button, Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { TableSkeleton } from "./Skeleton";

export const money = (n) => "$" + Number(n || 0).toLocaleString("en-US");
export const shortDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—");
export const longDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—");
export const todayISO = () => new Date().toISOString().slice(0, 10);

export function DataTable({ columns, rows, onRowClick, loading, emptyMessage = "Nothing here yet." }) {
  if (loading) return <TableSkeleton columns={columns.length} />;
  if (!rows || rows.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>{columns.map((c) => <TableCell key={c.key}>{c.label}</TableCell>)}</TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id || row.opportunity_id || row.account_id || row.contact_id || row.lead_id}
              hover={!!onRowClick}
              onClick={() => onRowClick && onRowClick(row)}
              sx={onRowClick ? { cursor: "pointer" } : undefined}
            >
              {columns.map((c) => <TableCell key={c.key}>{c.render ? c.render(row) : row[c.key]}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function DetailHeader({ eyebrow, title, subtitle, onBack, right }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Button
        size="small"
        startIcon={<ArrowLeft size={14} />}
        onClick={onBack}
        sx={{ color: "text.secondary", mb: 1.5, px: 0, "&:hover": { bgcolor: "transparent", color: "primary.main" } }}
      >
        Back
      </Button>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 700, lineHeight: 1 }}>{eyebrow}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
        </Box>
        {right}
      </Box>
    </Box>
  );
}