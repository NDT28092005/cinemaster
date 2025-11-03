import React, { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../../../api/product";
import { getCategories } from "../../../api/category";
import { getOccasions } from "../../../api/occasion";
import { Link } from "react-router-dom";

export default function AdminProduct() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [filter, setFilter] = useState({ category_id: "", occasion_id: "", search: "" });

  const API_BASE = "http://localhost:8000"; // Link backend Laravel

  useEffect(() => {
    loadFilters();
    loadProducts();
  }, []);

  const loadFilters = async () => {
    const [cats, occs] = await Promise.all([getCategories(), getOccasions()]);
    setCategories(cats.data);
    setOccasions(occs.data);
  };

  const loadProducts = async () => {
    const res = await getProducts(filter); // filter gồm category_id, occasion_id, search
    setProducts(res.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xoá sản phẩm này không?")) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  return (
    <div className="p-6">
      <h2>🛒 Quản lý sản phẩm</h2>

      {/* Filter + Search */}
      <div className="mb-3 flex gap-3">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên sản phẩm..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="form-control"
        />

        <select
          onChange={(e) => setFilter({ ...filter, category_id: e.target.value })}
          value={filter.category_id}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          onChange={(e) => setFilter({ ...filter, occasion_id: e.target.value })}
          value={filter.occasion_id}
        >
          <option value="">Tất cả dịp</option>
          {occasions.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>

        <button onClick={loadProducts} className="btn btn-secondary">Search</button>
        <Link to="/admin/products/create" className="btn btn-primary">+ Thêm sản phẩm</Link>
      </div>

      {/* Table */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Ảnh đại diện</th>
            <th>Tên</th>
            <th>Danh mục</th>
            <th>Dịp</th>
            <th>Giá</th>
            <th>Kho</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                {p.image_url && <img src={p.image_url} alt={p.name} width={60} />}
              </td>
              <td>{p.name}</td>
              <td>{p.category?.name || "-"}</td>
              <td>{p.occasion?.name || "-"}</td>
              <td>{p.price}</td>
              <td>{p.stock_quantity}</td>
              <td>{p.is_active ? "🟢" : "🔴"}</td>
              <td>
                <Link to={`/admin/products/edit/${p.id}`} className="btn btn-warning">✏️</Link>
                <button onClick={() => handleDelete(p.id)} className="btn btn-danger">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
