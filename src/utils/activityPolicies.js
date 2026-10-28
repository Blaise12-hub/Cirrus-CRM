export const VALID_TYPES = ["call", "email", "meeting", "task", "note"];
export const VALID_STATUSES = ["pending", "completed", "cancelled"];
export const PARENT_COLUMNS = ["contact_id", "account_id", "opportunity_id", "lead_id"];
export const UPDATABLE_FIELDS = ["subject", "description", "due_date", "status"];

// Parent column -> table. Only whitelisted keys ever reach SQL.
export const PARENT_TABLES = {
  contact_id: "crm.contacts",
  account_id: "crm.accounts",
  opportunity_id: "crm.opportunities",
  lead_id: "crm.leads",
};

const BUCKETS = {
  overdue: "due_date::date < CURRENT_DATE",
  today: "due_date::date = CURRENT_DATE",
  upcoming: "due_date::date > CURRENT_DATE",
};

// Positive 32-bit integer (Postgres INT range), as number or numeric string.
export function isValidId(value) {
  if (value === null || value === undefined) return false;
  const s = String(value);
  if (!/^\d+$/.test(s)) return false;
  const n = Number(s);
  return Number.isInteger(n) && n > 0 && n <= 2147483647;
}

// Returns { error } or { parentCol, parentId }.
export function validateCreate(body) {
  const b = body || {};
  if (!b.type || !VALID_TYPES.includes(b.type)) {
    return { error: `type must be one of: ${VALID_TYPES.join(", ")}` };
  }
  if (typeof b.subject !== "string" || b.subject.trim() === "") {
    return { error: "subject is required" };
  }
  if (b.status && !VALID_STATUSES.includes(b.status)) {
    return { error: `status must be one of: ${VALID_STATUSES.join(", ")}` };
  }
  const parentsSet = PARENT_COLUMNS.filter((col) => b[col] !== undefined && b[col] !== null);
  if (parentsSet.length !== 1) {
    return { error: `Exactly one of ${PARENT_COLUMNS.join(", ")} must be provided` };
  }
  const parentCol = parentsSet[0];
  if (!isValidId(b[parentCol])) {
    return { error: `${parentCol} must be a positive integer` };
  }
  return { parentCol, parentId: b[parentCol] };
}

// Returns { error } or { updates }.
export function validateUpdate(body) {
  const b = body || {};
  const updates = UPDATABLE_FIELDS.filter((f) => b[f] !== undefined);
  if (updates.length === 0) {
    return { error: "No valid fields provided to update" };
  }
  if (b.status !== undefined && !VALID_STATUSES.includes(b.status)) {
    return { error: `status must be one of: ${VALID_STATUSES.join(", ")}` };
  }
  if (b.subject !== undefined && (typeof b.subject !== "string" || b.subject.trim() === "")) {
    return { error: "subject cannot be blank" };
  }
  return { updates };
}

// Returns { error } or { parentCol, parentId } from req.query.
export function getListParent(query) {
  const q = query || {};
  const parentCol = PARENT_COLUMNS.find((col) => q[col]);
  if (!parentCol) {
    return { error: `Provide exactly one of: ${PARENT_COLUMNS.join(", ")}` };
  }
  if (!isValidId(q[parentCol])) {
    return { error: `${parentCol} must be a positive integer` };
  }
  return { parentCol, parentId: q[parentCol] };
}

// "" = no filter, null = invalid bucket, string = SQL fragment (static only).
export function getBucketClause(bucket) {
  if (bucket === undefined || bucket === "all") return "";
  return Object.prototype.hasOwnProperty.call(BUCKETS, bucket) ? BUCKETS[bucket] : null;
}
