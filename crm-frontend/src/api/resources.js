import { api } from "./client";

export const authApi = {
  login: (email, password) => api.postPublic("/auth/login", { email, password }),
  register: (payload) => api.postPublic("/auth/register", payload),
};

export const usersApi = {
  list: () => api.get("/users"),
  get: (id) => api.get(`/users/${id}`),
  create: (payload) => api.post("/users", payload),
  update: (id, payload) => api.patch(`/users/${id}`, payload),
  setPassword: (id, password) => api.patch(`/users/${id}/password`, { password }),
  deactivate: (id) => api.delete(`/users/${id}`),
};

export const accountsApi = {
  list: () => api.get("/accounts"),
  get: (id) => api.get(`/accounts/${id}`),
  create: (payload) => api.post("/accounts", payload),
  update: (id, payload) => api.patch(`/accounts/${id}`, payload),
  remove: (id) => api.delete(`/accounts/${id}`),
};

export const contactsApi = {
  list: (accountId) => api.get(accountId ? `/contacts?account_id=${accountId}` : "/contacts"),
  get: (id) => api.get(`/contacts/${id}`),
  create: (payload) => api.post("/contacts", payload),
  update: (id, payload) => api.patch(`/contacts/${id}`, payload),
  remove: (id) => api.delete(`/contacts/${id}`),
};

export const dashboardApi = {
  summary: () => api.get("/dashboard/summary"),
};

export const opportunitiesApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/opportunities${qs ? `?${qs}` : ""}`);
  },
  get: (id) => api.get(`/opportunities/${id}`),
  create: (payload) => api.post("/opportunities", payload),
  update: (id, payload) => api.patch(`/opportunities/${id}`, payload),
  updateStage: (id, stage) => api.patch(`/opportunities/${id}/stage`, { stage }),
  remove: (id) => api.delete(`/opportunities/${id}`),
};

export const leadsApi = {
  list: () => api.get("/leads"),
  create: (payload) => api.post("/leads", payload),
  update: (id, payload) => api.patch(`/leads/${id}`, payload),
  convert: (id, payload) => api.post(`/leads/${id}/convert`, payload),
};

export const activitiesApi = {
  listFor: (parentType, parentId) => api.get(`/activities?${parentType}_id=${parentId}`),
  create: (payload) => api.post("/activities", payload),
  update: (id, payload) => api.patch(`/activities/${id}`, payload),
  remove: (id) => api.delete(`/activities/${id}`),
};

export const productsApi = {
  list: (params) => apiFetch(`/products${params?.active ? "?active=true" : ""}`),
  get: (id) => apiFetch(`/products/${id}`),
  create: (data) => apiFetch("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

export const oppProductsApi = {
  listFor: (oppId) => apiFetch(`/opportunities/${oppId}/products`),
  upsert: (oppId, data) => apiFetch(`/opportunities/${oppId}/products`, { method: "POST", body: JSON.stringify(data) }),
  remove: (oppId, productId) => apiFetch(`/opportunities/${oppId}/products/${productId}`, { method: "DELETE" }),
};