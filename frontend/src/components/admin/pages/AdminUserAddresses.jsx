import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminUserAddresses = () => {
    const { id } = useParams(); // user_id
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);

    const fetchAddresses = async () => {
        const res = await axios.get(`http://localhost:8000/api/users/${id}/addresses`);
        setAddresses(res.data);
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">User Addresses</h1>
            <button
                className="bg-green-500 text-white px-4 py-2 rounded mb-4"
                onClick={() => navigate(`/admin/users/${id}/addresses/add`)}
            >
                Add Address
            </button>
            <table className="w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th>ID</th>
                        <th>Address Line 1</th>
                        <th>Address Line 2</th>
                        <th>City</th>
                        <th>State</th>
                        <th>Postal Code</th>
                        <th>Country</th>
                        <th>Default</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {addresses.map(addr => (
                        <tr key={addr.address_id}>
                            <td>{addr.address_id}</td>
                            <td>{addr.address_line1}</td>
                            <td>{addr.address_line2}</td>
                            <td>{addr.city}</td>
                            <td>{addr.state}</td>
                            <td>{addr.postal_code}</td>
                            <td>{addr.country}</td>
                            <td>{addr.is_default ? 'Yes' : 'No'}</td>
                            <td>
                                <button className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                                    onClick={() => navigate(`/admin/users/${id}/addresses/${addr.address_id}/edit`)}
                                >Edit</button>
                                <button className="bg-red-500 text-white px-2 py-1 rounded"
                                    onClick={async () => {
                                        await axios.delete(`http://localhost:8000/api/users/${id}/addresses/${addr.address_id}`);
                                        fetchAddresses();
                                    }}
                                >Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUserAddresses;
