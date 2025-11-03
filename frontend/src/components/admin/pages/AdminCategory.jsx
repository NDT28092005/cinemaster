import React, { useEffect, useState } from "react";
import { getCategories, deleteCategory } from "../../../api/category";
import { Link } from "react-router-dom";

export default function AdminCategory() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getCategories();
    setCategories(res.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xoá danh mục này?")) {
      await deleteCategory(id);
      loadData();
    }
  };

  return (
    <div className="p-6">
      <h2>📦 Danh mục sản phẩm</h2>
      <Link to="/admin/categories/create" className="btn btn-primary">+ Thêm mới</Link>
      <table className="table">
        <thead>
          <tr>
            <th>Tên danh mục</th>
            <th>Mô tả</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>{cat.description}</td>
              <td>
                <Link to={`/admin/categories/edit/${cat.id}`} className="btn btn-warning">Sửa</Link>
                <button onClick={() => handleDelete(cat.id)} className="btn btn-danger">Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}