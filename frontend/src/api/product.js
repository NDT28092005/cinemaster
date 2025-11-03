import axios from "axios";

const API_URL = "http://localhost:8000/api/products";

export const getProducts = (params = {}) => axios.get(API_URL, { params });
export const getProduct = (id) => axios.get(`${API_URL}/${id}`);
export const createProduct = (data) =>
  axios.post(API_URL, data, { headers: { "Content-Type": "multipart/form-data" } });
export const updateProduct = (id, data) =>
  axios.post(`${API_URL}/${id}?_method=PUT`, data, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteProduct = (id) => axios.delete(`${API_URL}/${id}`);
