import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminEditPreference = () => {
    const { id, prefId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        preferred_occasion: '',
        favorite_category: '',
        budget_range_min: '',
        budget_range_max: ''
    });

    useEffect(() => {
        const fetchPref = async () => {
            const res = await axios.get(`http://localhost:8000/api/users/${id}/preferences/${prefId}`);
            setForm(res.data);
        };
        fetchPref();
    }, [id, prefId]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        await axios.put(`http://localhost:8000/api/users/${id}/preferences/${prefId}`, form);
        navigate(`/admin/users/${id}/preferences`);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Edit User Preference</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
                <input name="preferred_occasion" placeholder="Preferred Occasion" value={form.preferred_occasion} onChange={handleChange} className="border p-2 rounded" />
                <input name="favorite_category" placeholder="Favorite Category" value={form.favorite_category} onChange={handleChange} className="border p-2 rounded" />
                <input name="budget_range_min" placeholder="Budget Min" type="number" value={form.budget_range_min} onChange={handleChange} className="border p-2 rounded" />
                <input name="budget_range_max" placeholder="Budget Max" type="number" value={form.budget_range_max} onChange={handleChange} className="border p-2 rounded" />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
            </form>
        </div>
    );
};

export default AdminEditPreference;
