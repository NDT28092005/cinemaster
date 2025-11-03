import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Categories
export const getCategories = () => axios.get(`${API_URL}/categories`);
export const createCategory = (data) => axios.post(`${API_URL}/categories`, data);
export const updateCategory = (id, data) => axios.put(`${API_URL}/categories/${id}`, data);
export const deleteCategory = (id) => axios.delete(`${API_URL}/categories/${id}`);

// Occasions
export const getOccasions = () => axios.get(`${API_URL}/occasions`);
export const createOccasion = (data) => axios.post(`${API_URL}/occasions`, data);
export const updateOccasion = (id, data) => axios.put(`${API_URL}/occasions/${id}`, data);
export const deleteOccasion = (id) => axios.delete(`${API_URL}/occasions/${id}`);

// Products
export const getProducts = (filter) => axios.get(`${API_URL}/products`, { params: filter });
export const createProduct = (data) => axios.post(`${API_URL}/products`, data);
export const updateProduct = (id, data) => axios.post(`${API_URL}/products/${id}`, data); // Laravel sẽ hiểu _method=PUT
export const deleteProduct = (id) => axios.delete(`${API_URL}/products/${id}`);
export const toggleProductActive = (id) => axios.post(`${API_URL}/products/${id}/toggle-active`);
// Product Reviews
export const getReviews = () => axios.get(`${API_URL}/product-reviews`);
export const deleteReview = (id) => axios.delete(`${API_URL}/product-reviews/${id}`);
export const blockReview = (id) => axios.post(`${API_URL}/product-reviews/${id}/block`);
