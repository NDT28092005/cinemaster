import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminAddUser = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        full_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'customer',
        is_active: true,
    });

    const [saving, setSaving] = useState(false);

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
            await axios.post('http://localhost:8000/api/users', user);
            alert('User created successfully!');
            navigate('/admin/users');
        } catch (error) {
            console.error(error);
            alert('Failed to create user.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Add New User</h1>
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
                    <label className="block mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={user.password}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">Confirm Password</label>
                    <input
                        type="password"
                        name="password_confirmation"
                        value={user.password_confirmation}
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
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    {saving ? 'Saving...' : 'Add User'}
                </button>
            </form>
        </div>
    );
};

export default AdminAddUser;
