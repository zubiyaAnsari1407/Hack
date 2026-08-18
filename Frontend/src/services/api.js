import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ---------- PURCHASES ----------

export const getAllPurchases = async (userId) => {
  const res = await api.get("/purchases", {
    params: userId ? { userId } : {},
  });
  return res.data; // { success, data }
};

export const getPurchaseById = async (id) => {
  const res = await api.get(`/purchases/${id}`);
  return res.data;
};

export const createPurchase = async (formData) => {
  const res = await api.post("/purchases", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updatePurchase = async (id, formData) => {
  const res = await api.put(`/purchases/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deletePurchase = async (id) => {
  const res = await api.delete(`/purchases/${id}`);
  return res.data;
};

export default api;