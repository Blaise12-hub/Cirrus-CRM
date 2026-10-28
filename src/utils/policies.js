// Resolves the effective owner_id for a record creation or update based on user role.
// Reps can only assign records to themselves (silently overridden).
// Admins and managers can assign records to any user.
export function resolveOwnerId(role, requestedOwnerId, currentUserId) {
  if (role === "admin" || role === "manager") {
    return requestedOwnerId || currentUserId;
  }
  return currentUserId;
}
