// Returns a SQL fragment + param for scoping a query to the requesting
// user's own records, unless they're a manager/admin (who see everything).
//
// Usage inside a controller:
//   const { clause, params } = ownerScope(req.user, "owner_id", []);
//   const sql = `SELECT * FROM crm.accounts WHERE 1=1 ${clause}`;
//   const result = await pool.query(sql, params);
//
// `paramsSoFar` lets you build on top of params already used earlier in the
// query (e.g. from a WHERE id = $1), so the placeholder index stays correct.
function ownerScope(user, ownerColumn, paramsSoFar = []) {
  if (user.role === "admin" || user.role === "manager") {
    return { clause: "", params: paramsSoFar };
  }
  const nextIndex = paramsSoFar.length + 1;
  return {
    clause: ` AND ${ownerColumn} = $${nextIndex}`,
    params: [...paramsSoFar, user.user_id],
  };
}

module.exports = { ownerScope };
