import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminUserPreferences = () => {
    const { id } = useParams(); // user_id
    const navigate = useNavigate();
    const [preferences, setPreferences] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPreferences = async () => {
        setLoading(true);
        const res = await axios.get(`http://localhost:8000/api/users/${id}/preferences`);
        setPreferences(res.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPreferences();
    }, []);

    const handleDelete = async (prefId) => {
        if (!window.confirm('Delete this preference?')) return;
        await axios.delete(`http://localhost:8000/api/users/${id}/preferences/${prefId}`);
        fetchPreferences();
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">User Preferences</h1>
            <button
                className="bg-green-500 text-white px-4 py-2 rounded mb-4"
                onClick={() => navigate(`/admin/users/${id}/preferences/add`)}
            >
                Add Preference
            </button>

            {loading ? <p>Loading...</p> : (
                <table className="w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th>ID</th>
                            <th>Preferred Occasion</th>
                            <th>Favorite Category</th>
                            <th>Budget Min</th>
                            <th>Budget Max</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {preferences.map(pref => (
                            <tr key={pref.preference_id}>
                                <td>{pref.preference_id}</td>
                                <td>{pref.preferred_occasion}</td>
                                <td>{pref.favorite_category}</td>
                                <td>{pref.budget_range_min}</td>
                                <td>{pref.budget_range_max}</td>
                                <td>
                                    <button
                                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                                        onClick={() => navigate(`/admin/users/${id}/preferences/${pref.preference_id}/edit`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                        onClick={() => handleDelete(pref.preference_id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminUserPreferences;
