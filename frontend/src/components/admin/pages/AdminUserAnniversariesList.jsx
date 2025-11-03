import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminUserAnniversariesList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [anniversaries, setAnniversaries] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAnniversaries = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:8000/api/users/${id}/anniversaries`);
            setAnniversaries(res.data);
        } catch (err) {
            console.error(err);
            alert('Error fetching anniversaries.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnniversaries();
    }, []);

    const handleDelete = async (anniversaryId) => {
        if (!window.confirm('Are you sure you want to delete this anniversary?')) return;
        try {
            await axios.delete(`http://localhost:8000/api/users/${id}/anniversaries/${anniversaryId}`);
            fetchAnniversaries();
        } catch (err) {
            console.error(err);
            alert('Error deleting anniversary.');
        }
    };

    if (loading) return <p className="p-4">Loading...</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">User Anniversaries</h1>
            <button
                className="bg-green-500 text-white px-4 py-2 rounded mb-4"
                onClick={() => navigate(`/admin/users/${id}/anniversaries/add`)}
            >
                Add Anniversary
            </button>
            <table className="w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-2 py-1">ID</th>
                        <th className="border px-2 py-1">Event Name</th>
                        <th className="border px-2 py-1">Event Date</th>
                        <th className="border px-2 py-1">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {anniversaries.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center py-4">No anniversaries found.</td>
                        </tr>
                    ) : (
                        anniversaries.map((event) => (
                            <tr key={event.anniversary_id}>
                                <td className="border px-2 py-1">{event.anniversary_id}</td>
                                <td className="border px-2 py-1">{event.event_name}</td>
                                <td className="border px-2 py-1">{event.event_date}</td>
                                <td className="border px-2 py-1 flex gap-2">
                                    <button
                                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                                        onClick={() => navigate(`/admin/users/${id}/anniversaries/${event.anniversary_id}/edit`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                        onClick={() => handleDelete(event.anniversary_id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUserAnniversariesList;
