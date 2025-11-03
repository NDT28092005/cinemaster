import axios from "axios";

const API_URL = "http://localhost:8000/api/occasions";

export const getOccasions = () => axios.get(API_URL);
export const getOccasion = (id) => axios.get(`${API_URL}/${id}`);
export const createOccasion = (data) => axios.post(API_URL, data);
export const updateOccasion = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteOccasion = (id) => axios.delete(`${API_URL}/${id}`);
