import React, { useEffect, useState, useCallback } from "react";
import { getProduct, updateProduct } from "../../../api/product";
import { getCategories } from "../../../api/category";
import { getOccasions } from "../../../api/occasion";
import { useNavigate, useParams, Link } from "react-router-dom";
import AdminLayout from "../../../layouts/AdminLayout";
import { ShoppingBag, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    short_description: "",
    full_description: "",
    price: "",
    stock_quantity: 0,
    category_id: "",
    occasion_id: "",
    is_active: true,
    images: [],
  });

  const [mainImage, setMainImage] = useState(null);
  const [oldMainImage, setOldMainImage] = useState("");
  const [oldImages, setOldImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoadingData(true);
      const [prodRes, catsRes, occRes] = await Promise.all([
        getProduct(id),
        getCategories(),
        getOccasions(),
      ]);

      const product = prodRes.data || {};

      setForm({
        name: product.name || "",
        short_description: product.short_description || "",
        full_description: product.full_description || "",
        price: product.price ?? "",
        stock_quantity: product.stock_quantity ?? 0,
        category_id: product.category_id || "",
        occasion_id: product.occasion_id || "",
        is_active: !!product.is_active,
        images: [],
      });

      setOldMainImage(product.image_url || "");
      setOldImages(product.images || []);
      setPreviewImages([]);

      setCategories(catsRes.data || []);
      setOccasions(occRes.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi load dữ liệu sản phẩm:", err.response?.data || err.message);
      alert("Không thể tải thông tin sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoadingData(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    setMainImage(file || null);
  };

  const handleOtherImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setForm((prev) => ({ ...prev, images: files }));
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === "images") return;
      if (key === "is_active") {
        data.append(key, value ? 1 : 0);
      } else {
        data.append(key, value ?? "");
      }
    });

    if (mainImage) {
      data.append("main_image", mainImage);
    }

    if (form.images?.length) {
      form.images.forEach((file) => data.append("images[]", file));
    }

    try {
      setLoading(true);
      await updateProduct(id, data);
      alert("✅ Cập nhật sản phẩm thành công!");
      navigate("/admin/products");
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err.response?.data || err.message);
      alert("❌ Không thể cập nhật sản phẩm. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ animation: "fadeInUp 0.6s ease-out" }}>
        <div className="d-flex align-items-center mb-4">
          <Link
            to="/admin/products"
            className="admin-btn admin-btn-secondary me-3"
            style={{ padding: "0.5rem 0.75rem" }}
          >
            <ArrowLeft size={16} />
          </Link>
          <h1
            style={{
              color: "#5D2A42",
              fontSize: "2rem",
              fontWeight: "600",
              margin: 0,
            }}
          >
            Chỉnh sửa sản phẩm
          </h1>
        </div>

        <div className="admin-card">
          <div className="admin-card-title">
            <ShoppingBag size={20} />
            Thông tin sản phẩm
          </div>

          {loadingData ? (
            <div className="text-center py-5">Đang tải dữ liệu...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-4">
                  <label className="form-label fw-semibold text-muted">
                    Tên sản phẩm <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>

                <div className="col-md-6 mb-4">
                  <label className="form-label fw-semibold text-muted">
                    Giá <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="form-control"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-muted">Mô tả ngắn</label>
                <input
                  type="text"
                  value={form.short_description}
                  onChange={(e) =>
                    setForm({ ...form, short_description: e.target.value })
                  }
                  className="form-control"
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-muted">Mô tả chi tiết</label>
                <textarea
                  rows="4"
                  value={form.full_description}
                  onChange={(e) =>
                    setForm({ ...form, full_description: e.target.value })
                  }
                  className="form-control"
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-4">
                  <label className="form-label fw-semibold text-muted">Danh mục</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="form-select"
                  >
                    <option value="">--Chọn danh mục--</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-4">
                  <label className="form-label fw-semibold text-muted">Dịp lễ</label>
                  <select
                    value={form.occasion_id}
                    onChange={(e) => setForm({ ...form, occasion_id: e.target.value })}
                    className="form-select"
                  >
                    <option value="">--Chọn dịp lễ--</option>
                    {occasions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-4">
                  <label className="form-label fw-semibold text-muted">Tồn kho</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock_quantity}
                    onChange={(e) =>
                      setForm({ ...form, stock_quantity: e.target.value })
                    }
                    className="form-control"
                  />
                </div>

                <div className="col-md-6 mb-4 d-flex align-items-end">
                  <div className="d-flex align-items-center border rounded-3 px-3 py-2 w-100">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="form-check-input me-2"
                    />
                    <label className="form-check-label fw-semibold">
                      Kích hoạt sản phẩm
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-muted d-flex align-items-center gap-2">
                  <ImageIcon size={16} />
                  Ảnh chính
                </label>
                {oldMainImage && !mainImage && (
                  <img
                    src={oldMainImage}
                    alt="Ảnh chính"
                    style={{
                      width: "180px",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      border: "2px solid rgba(251,99,118,0.2)",
                      display: "block",
                      marginBottom: "1rem",
                    }}
                  />
                )}
                {mainImage && (
                  <img
                    src={URL.createObjectURL(mainImage)}
                    alt="Ảnh chính mới"
                    style={{
                      width: "180px",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      border: "2px solid rgba(251,99,118,0.2)",
                      display: "block",
                      marginBottom: "1rem",
                    }}
                  />
                )}
                <input type="file" accept="image/*" onChange={handleMainImageChange} />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-muted d-flex align-items-center gap-2">
                  <ImageIcon size={16} />
                  Ảnh phụ
                </label>

                {!previewImages.length && oldImages.length > 0 && (
                  <div className="row g-2 mb-3">
                    {oldImages.map((img) => (
                      <div className="col-sm-4" key={img.id}>
                        <img
                          src={img.image_url}
                          alt="Ảnh phụ cũ"
                          style={{
                            width: "100%",
                            height: "140px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            border: "2px solid rgba(251,99,118,0.2)",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {previewImages.length > 0 && (
                  <div className="row g-2 mb-3">
                    {previewImages.map((url, idx) => (
                      <div className="col-sm-4" key={idx}>
                        <img
                          src={url}
                          alt={`Ảnh phụ mới ${idx + 1}`}
                          style={{
                            width: "100%",
                            height: "140px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            border: "2px solid rgba(251,99,118,0.2)",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleOtherImagesChange}
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={loading}
                >
                  <Save size={20} style={{ marginRight: "0.5rem" }} />
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <Link to="/admin/products" className="admin-btn admin-btn-secondary">
                  Hủy
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
