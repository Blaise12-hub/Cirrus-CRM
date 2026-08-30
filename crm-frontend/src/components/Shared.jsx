import React from "react";
import { TableSkeleton } from "./Skeleton";

export const money = (n) => "$" + Number(n || 0).toLocaleString("en-US");
export const shortDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—");
export const longDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—");
export const todayISO = () => new Date().toISOString().slice(0, 10);

export function DataTable({ columns, rows, onRowClick, loading, emptyMessage = "Nothing here yet." }) {
  if (loading) return <TableSkeleton columns={columns.length} />;
  if (!rows || rows.length === 0) return <div className="table-state">{emptyMessage}</div>;

  return (
    <table className="data-table">
      <thead>
        <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id || row.opportunity_id || row.account_id || row.contact_id || row.lead_id}
              onClick={() => onRowClick && onRowClick(row)}>
            {columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DetailHeader({ eyebrow, title, subtitle, onBack, right }) {
  return (
    <div className="detail-header">
      <button className="back-link" onClick={onBack}>← Back</button>
      <div className="detail-header-row">
        <div>
          <div className="detail-eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          {subtitle && <div className="detail-subtitle">{subtitle}</div>}
        </div>
        {right}
      </div>
    </div>
  );
}
