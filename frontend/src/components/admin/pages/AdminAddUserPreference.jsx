import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const AdminAddUserPreference = () => {
    const { id } = useParams(); // user_id
    const navigate = useNavigate();
    const [form, setForm] = useState({
        preferred_occasion: '',
        favorite_category: '',
        budget_range_min: '',
        budget_range_max: '',
    });

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:8000/api/users/${id}/preferences`, form);
            navigate(`/admin/users/${id}/preferences`);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Add Preferences</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full max-w-md">
                <input name="preferred_occasion" placeholder="Preferred Occasion" value={form.preferred_occasion} onChange={handleChange} className="border px-2 py-1 rounded" />
                <input name="favorite_category" placeholder="Favorite Category" value={form.favorite_category} onChange={handleChange} className="border px-2 py-1 rounded" />
                <input type="number" name="budget_range_min" placeholder="Budget Min" value={form.budget_range_min} onChange={handleChange} className="border px-2 py-1 rounded" />
                <input type="number" name="budget_range_max" placeholder="Budget Max" value={form.budget_range_max} onChange={handleChange} className="border px-2 py-1 rounded" />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
            </form>
        </div>
    );
};

export default AdminAddUserPreference;
