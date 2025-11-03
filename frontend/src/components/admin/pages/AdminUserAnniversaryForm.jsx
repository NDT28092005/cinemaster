import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminUserAnniversaryForm = () => {
    const { id, anniversaryId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({ event_name: '', event_date: '' });
    const [loading, setLoading] = useState(false);

    // fetch existing anniversary if editing
    const fetchAnniversary = async () => {
        if (!anniversaryId) return;
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:8000/api/users/${id}/anniversaries/${anniversaryId}`);
            setForm({ event_name: res.data.event_name, event_date: res.data.event_date });
        } catch (err) {
            console.error(err);
            alert('Error fetching anniversary.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAnniversary(); }, [anniversaryId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (anniversaryId) {
                await axios.put(`http://localhost:8000/api/users/${id}/anniversaries/${anniversaryId}`, form);
                alert('Anniversary updated successfully!');
            } else {
                await axios.post(`http://localhost:8000/api/users/${id}/anniversaries`, form);
                alert('Anniversary created successfully!');
            }
            navigate(`/admin/users/${id}/anniversaries`);
        } catch (err) {
            console.error(err);
            alert('Error saving anniversary.');
        }
    };

    if (loading) return <p className="p-4">Loading...</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{anniversaryId ? 'Edit Anniversary' : 'Add Anniversary'}</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
                <input
                    type="text"
                    name="event_name"
                    placeholder="Event Name"
                    value={form.event_name}
                    onChange={handleChange}
                    className="border px-2 py-1 rounded"
                    required
                />
                <input
                    type="date"
                    name="event_date"
                    value={form.event_date}
                    onChange={handleChange}
                    className="border px-2 py-1 rounded"
                    required
                />
                <div className="flex gap-2">
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                        {anniversaryId ? 'Update' : 'Create'}
                    </button>
                    <button
                        type="button"
                        className="bg-gray-300 px-4 py-2 rounded"
                        onClick={() => navigate(`/admin/users/${id}/anniversaries`)}
                    >
                        Back
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminUserAnniversaryForm;
