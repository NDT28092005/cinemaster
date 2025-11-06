import axios from "axios";

const API_URL = "http://localhost:8000/api";
export const api = axios.create({
  baseURL: API_URL,
});
export const register = (data) => axios.post(`${API_URL}/register`, data);
export const login = (data) => axios.post(`${API_URL}/login`, data);
export const getMe = (token) =>
  axios.get(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } });
export const logout = (token) =>
  axios.post(`${API_URL}/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });