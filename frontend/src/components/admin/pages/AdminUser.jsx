import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminUser = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const navigate = useNavigate();
    const fetchUsers = async (page = 1, searchTerm = '') => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/users`, {
                params: { page, search: searchTerm },
            });
            setUsers(response.data.data);
            setPage(response.data.current_page);
            setLastPage(response.data.last_page);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(1, search);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`http://localhost:8000/api/users/${userId}`);
            fetchUsers(page, search);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Users Management</h1>
            <button
                className="bg-green-500 text-white px-4 py-1 rounded mb-4"
                onClick={() => navigate('/admin/users/create')}
            >
                Add User
            </button>
            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-1 rounded"
                >
                    Search
                </button>
            </form>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border px-2 py-1">ID</th>
                            <th className="border px-2 py-1">Full Name</th>
                            <th className="border px-2 py-1">Email</th>
                            <th className="border px-2 py-1">Role</th>
                            <th className="border px-2 py-1">Active</th>
                            <th className="border px-2 py-1">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(!users || users.length === 0) ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td className="border px-2 py-1">{user.id}</td>
                                    <td className="border px-2 py-1">{user.name}</td>
                                    <td className="border px-2 py-1">{user.email}</td>
                                    <td className="border px-2 py-1">{user.role}</td>
                                    <td className="border px-2 py-1">{user.is_active ? 'Yes' : 'No'}</td>
                                    <td className="border px-2 py-1 flex gap-2">
                                        <button
                                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                                            onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-blue-500 text-white px-2 py-1 rounded"
                                            onClick={() => navigate(`/admin/users/${user.id}/addresses`)}
                                        >
                                            Addresses
                                        </button>
                                        <button
                                            className="bg-purple-500 text-white px-2 py-1 rounded"
                                            onClick={() => navigate(`/admin/users/${user.id}/preferences`)}
                                        >
                                            Preferences
                                        </button>
                                        <button
                                            className="bg-pink-500 text-white px-2 py-1 rounded"
                                            onClick={() => navigate(`/admin/users/${user.id}/anniversaries`)}
                                        >
                                            Anniversaries
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}

            {/* Pagination */}
            <div className="mt-4 flex gap-2">
                <button
                    disabled={page <= 1}
                    onClick={() => fetchUsers(page - 1, search)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="px-3 py-1">
                    Page {page} of {lastPage}
                </span>
                <button
                    disabled={page >= lastPage}
                    onClick={() => fetchUsers(page + 1, search)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default AdminUser;
