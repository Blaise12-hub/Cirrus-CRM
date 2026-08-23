import { api } from "./client";

export const authApi = {
  login: (email, password) => api.postPublic("/auth/login", { email, password }),
  register: (payload) => api.postPublic("/auth/register", payload),
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
