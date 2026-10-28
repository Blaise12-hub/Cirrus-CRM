// Positive 32-bit integer (Postgres INT range), as number or numeric string.
export function isValidId(value) {
  if (value === null || value === undefined) return false;
  const s = String(value);
  if (!/^\d+$/.test(s)) return false;
  const n = Number(s);
  return Number.isInteger(n) && n > 0 && n <= 2147483647;
}

// Resolves the effective owner_id for a record creation or update based on user role.
// Reps can only assign records to themselves (silently overridden).
// Admins and managers can assign records to any user.
export function resolveOwnerId(role, requestedOwnerId, currentUserId) {
  if (role === 'admin' || role === 'manager') {
    return requestedOwnerId || currentUserId;
  }
  return currentUserId;
}
