import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminEditUser = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();

    const [user, setUser] = useState({
        full_name: '',
        email: '',
        role: 'customer',
        is_active: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/users/${id}`);
                const data = response.data;

                // Chuyển đổi is_active từ 0/1 thành true/false
                setUser({
                    full_name: data.name || '',
                    email: data.email || '',
                    role: data.role || 'customer',
                    is_active: data.is_active === 1 || data.is_active === true,
                });
            } catch (error) {
                console.error(error);
                alert('Error fetching user data');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUser((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Chuyển checkbox true/false thành 1/0 nếu API backend dùng integer
            await axios.put(`http://localhost:8000/api/users/${id}`, {
                ...user,
                is_active: user.is_active ? 1 : 0,
            });
            alert('User updated successfully!');
            navigate('/admin/users');
        } catch (error) {
            console.error(error);
            alert('Failed to update user.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Loading user...</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Edit User</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">Full Name</label>
                    <input
                        type="text"
                        name="full_name"
                        value={user.full_name}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">Role</label>
                    <select
                        name="role"
                        value={user.role}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                    >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                    </select>
                </div>
                <div>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={user.is_active}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        Active
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </form>
        </div>
    );
};

export default AdminEditUser;
