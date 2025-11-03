import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminEditAddress = () => {
    const { id, addrId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        is_default: false,
    });

    useEffect(() => {
        const fetchAddress = async () => {
            const res = await axios.get(`http://localhost:8000/api/users/${id}/addresses/${addrId}`);
            setForm(res.data);
        };
        fetchAddress();
    }, [id, addrId]);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        await axios.put(`http://localhost:8000/api/users/${id}/addresses/${addrId}`, form);
        navigate(`/admin/users/${id}/addresses`);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Edit User Address</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
                <input name="address_line1" placeholder="Address Line1" value={form.address_line1} onChange={handleChange} className="border p-2 rounded" required />
                <input name="address_line2" placeholder="Address Line2" value={form.address_line2} onChange={handleChange} className="border p-2 rounded" />
                <input name="city" placeholder="City" value={form.city} onChange={handleChange} className="border p-2 rounded" required />
                <input name="state" placeholder="State" value={form.state} onChange={handleChange} className="border p-2 rounded" />
                <input name="postal_code" placeholder="Postal Code" value={form.postal_code} onChange={handleChange} className="border p-2 rounded" />
                <input name="country" placeholder="Country" value={form.country} onChange={handleChange} className="border p-2 rounded" required />
                <label>
                    <input type="checkbox" name="is_default" checked={form.is_default} onChange={handleChange} />
                    {' '}Default Address
                </label>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
            </form>
        </div>
    );
};

export default AdminEditAddress;
