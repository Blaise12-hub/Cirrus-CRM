// Roles allowed to reassign record owners. Mirrors the backend rule:
// PATCH with owner_id returns 403 for sales_rep.
export function canReassignOwner(role) {
  return role === "admin" || role === "manager";
}

// Roles allowed to edit/delete an activity: admins and managers on any,
// reps only on activities they own (backend scopes PATCH/DELETE by owner_id).
export function canModifyActivity(user, activity) {
  if (!user || !activity) return false;
  if (user.role === "admin" || user.role === "manager") return true;
  return activity.owner_id === user.user_id;
}
