import React, { useEffect, useState } from "react";
import { getOccasions, deleteOccasion } from "../../../api/occasion";
import { Link } from "react-router-dom";

export default function AdminOccasion() {
  const [occasions, setOccasions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getOccasions();
    setOccasions(res.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xoá dịp này không?")) {
      await deleteOccasion(id);
      loadData();
    }
  };

  return (
    <div className="p-6">
      <h2>🎉 Quản lý dịp (Occasions)</h2>
      <Link to="/admin/occasions/create" className="btn btn-primary">
        + Thêm dịp mới
      </Link>
      <table className="table">
        <thead>
          <tr>
            <th>Tên dịp</th>
            <th>Mô tả</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {occasions.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>
                <Link to={`/admin/occasions/edit/${item.id}`} className="btn btn-warning">
                  ✏️ Sửa
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn btn-danger"
                >
                  🗑️ Xoá
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}