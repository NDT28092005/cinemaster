import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminEditPreference = () => {
    const { id, prefId } = useParams(); // user_id và preference_id
    const navigate = useNavigate();
    const [form, setForm] = useState({
        preferred_occasion: '',
        favorite_category: '',
        budget_range_min: '',
        budget_range_max: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPref = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/users/${id}/preferences/${prefId}`);
                // Gán dữ liệu trả về vào state form
                setForm({
                    preferred_occasion: res.data.preferred_occasion || '',
                    favorite_category: res.data.favorite_category || '',
                    budget_range_min: res.data.budget_range_min || '',
                    budget_range_max: res.data.budget_range_max || ''
                });
            } catch (err) {
                console.error(err);
                alert('Error fetching preference');
            } finally {
                setLoading(false);
            }
        };
        fetchPref();
    }, [id, prefId]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8000/api/users/${id}/preferences/${prefId}`, form);
            navigate(`/admin/users/${id}/preferences`);
        } catch (err) {
            console.error(err);
            alert('Error updating preference');
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Edit User Preference</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
                <input
                    name="preferred_occasion"
                    placeholder="Preferred Occasion"
                    value={form.preferred_occasion}
                    onChange={handleChange}
                    className="border p-2 rounded"
                />
                <input
                    name="favorite_category"
                    placeholder="Favorite Category"
                    value={form.favorite_category}
                    onChange={handleChange}
                    className="border p-2 rounded"
                />
                <input
                    name="budget_range_min"
                    placeholder="Budget Min"
                    type="number"
                    value={form.budget_range_min}
                    onChange={handleChange}
                    className="border p-2 rounded"
                />
                <input
                    name="budget_range_max"
                    placeholder="Budget Max"
                    type="number"
                    value={form.budget_range_max}
                    onChange={handleChange}
                    className="border p-2 rounded"
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Save
                </button>
            </form>
        </div>
    );
};

export default AdminEditPreference;
