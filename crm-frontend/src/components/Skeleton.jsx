import React from "react";

// Base shimmer bar -- every skeleton below is built from these.
// The shimmer animation is defined once in index.css (.skeleton-bar).
function Bar({ width = "100%", height = 14 }) {
  return <div className="skeleton-bar" style={{ width, height }} />;
}

// Mimics a data table: header row + N body rows with column-width bars,
// so the page doesn't visually "jump" once real data replaces it -- the
// skeleton takes up roughly the same shape the real table will.
export function TableSkeleton({ columns = 4, rows = 5 }) {
  return (
    <table className="data-table skeleton-table">
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: columns }).map((_, c) => (
              <td key={c}>
                <Bar width={c === 0 ? "70%" : "50%"} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Mimics an activity timeline: a status dot + two lines per row.
export function TimelineSkeleton({ rows = 3 }) {
  return (
    <div className="timeline">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="timeline-row">
          <div className="skeleton-bar skeleton-dot" />
          <div className="timeline-content">
            <Bar width="65%" height={13} />
            <div style={{ marginTop: 6 }}>
              <Bar width="35%" height={11} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Mimics the kanban board: N columns, each with a header bar and a few
// card-shaped blocks, so Pipeline's loading state doesn't just show an
// unrelated detail-page shape.
export function KanbanSkeleton({ columns = 5 }) {
  return (
    <div className="board">
      {Array.from({ length: columns }).map((_, c) => (
        <div key={c} className="column">
          <div className="column-header" style={{ borderTopColor: "#D8D8D8" }}>
            <Bar width="60%" height={13} />
            <div style={{ marginTop: 8 }}><Bar width="40%" height={18} /></div>
          </div>
          <div className="column-body">
            {Array.from({ length: 2 + (c % 2) }).map((_, i) => (
              <div key={i} className="deal-card">
                <Bar width="80%" height={14} />
                <div style={{ marginTop: 6 }}><Bar width="55%" height={11} /></div>
                <div style={{ marginTop: 10 }}><Bar width="45%" height={16} /></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Mimics a detail page: back-link, title, subtitle, info row, then two
// side-by-side panels. Used by AccountDetail/ContactDetail/
// OpportunityDetail/Dashboard while their first fetch is in flight.
export function DetailSkeleton() {
  return (
    <div className="view">
      <div style={{ marginBottom: 16 }}>
        <Bar width={60} height={11} />
        <div style={{ marginTop: 14 }}>
          <Bar width="40%" height={22} />
        </div>
        <div style={{ marginTop: 8 }}>
          <Bar width="25%" height={13} />
        </div>
      </div>
      <div className="detail-columns">
        <div className="dash-panel">
          <Bar width="30%" height={13} />
          <div style={{ marginTop: 14 }}><TimelineSkeleton rows={2} /></div>
        </div>
        <div className="dash-panel">
          <Bar width="30%" height={13} />
          <div style={{ marginTop: 14 }}><TimelineSkeleton rows={2} /></div>
        </div>
      </div>
    </div>
  );
}
