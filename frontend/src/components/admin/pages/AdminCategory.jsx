import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCategories, deleteCategory } from "../../../api/category";
import { Link } from "react-router-dom";
import AdminLayout from '../../../layouts/AdminLayout';
import { FolderTree, Plus, Edit, Trash2, Upload, FileSpreadsheet, Download, Trash } from "lucide-react";

export default function AdminCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xoá danh mục này?")) {
      try {
        await deleteCategory(id);
        loadData();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Lỗi khi xóa danh mục');
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        alert("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
        event.target.value = '';
        setImportFile(null);
        return;
      }
      setImportFile(file);
      console.log('File selected:', file.name, file.type, file.size);
    } else {
      setImportFile(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert("Vui lòng chọn file Excel để import");
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      setImporting(true);
      const token = localStorage.getItem('token');
      
      console.log('Uploading file:', importFile.name, importFile.size);
      
      const response = await axios.post(
        "http://localhost:8000/api/categories/import",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Upload progress:', percentCompleted + '%');
          }
        }
      );

      if (response.data.success) {
        alert("Import thành công! " + response.data.message);
        setImportFile(null);
        const fileInput = document.getElementById('import-category-file-input');
        if (fileInput) fileInput.value = '';
        loadData();
      } else {
        alert("Import thất bại: " + response.data.message);
      }
    } catch (err) {
      console.error('Import error:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = "Import thất bại!";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorList = Object.values(errors).flat().join(', ');
        errorMessage = `Lỗi validation: ${errorList}`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        "http://localhost:8000/api/categories/export",
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `categories_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Xuất file Excel thành công!');
    } catch (err) {
      console.error('Export error:', err);
      alert('Lỗi khi xuất file Excel: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA TẤT CẢ danh mục không? Hành động này không thể hoàn tác!")) {
      return;
    }

    if (!window.confirm("Xác nhận lần cuối: Xóa tất cả danh mục?")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        "http://localhost:8000/api/categories/delete-all",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert(response.data.message);
        loadData();
      } else {
        alert("Xóa thất bại: " + response.data.message);
      }
    } catch (err) {
      console.error('Delete all error:', err);
      alert('Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <AdminLayout>
      <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 style={{ 
            color: '#5D2A42', 
            fontSize: '2rem', 
            fontWeight: '600',
            margin: 0
          }}>
            Quản lý danh mục
          </h1>
          <div className="d-flex gap-2 flex-wrap">
            <input
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              id="import-category-file-input"
              type="file"
              onChange={handleFileChange}
            />
            <label 
              htmlFor="import-category-file-input" 
              style={{ 
                margin: 0,
                cursor: 'pointer',
                padding: '0.75rem 1.25rem',
                background: 'white',
                color: '#007bff',
                border: '2px solid rgba(0, 123, 255, 0.3)',
                borderRadius: '8px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 123, 255, 0.1)';
                e.currentTarget.style.borderColor = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = 'rgba(0, 123, 255, 0.3)';
              }}
            >
              <FileSpreadsheet size={18} />
              CHỌN FILE EXCEL
            </label>
            {importFile && (
              <button
                type="button"
                className="admin-btn"
                onClick={handleImport}
                disabled={importing}
                style={{ 
                  padding: '0.75rem 1.25rem',
                  background: importing ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: importing ? 0.6 : 1,
                  cursor: importing ? 'not-allowed' : 'pointer'
                }}
              >
                <Upload size={18} />
                {importing ? 'ĐANG IMPORT...' : 'IMPORT EXCEL'}
              </button>
            )}
            <button
              type="button"
              className="admin-btn"
              onClick={handleExport}
              style={{ 
                padding: '0.75rem 1.25rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Download size={18} />
              EXPORT EXCEL
            </button>
            <button
              type="button"
              className="admin-btn"
              onClick={handleDeleteAll}
              style={{ 
                padding: '0.75rem 1.25rem',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Trash size={18} />
              XÓA TẤT CẢ
            </button>
            <Link to="/admin/categories/create" className="admin-btn admin-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} />
              Thêm danh mục
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
            <div className="loading-spinner" style={{ 
              width: '60px', 
              height: '60px', 
              border: '5px solid rgba(251, 99, 118, 0.2)', 
              borderTopColor: '#FB6376', 
              borderRightColor: '#FCB1A6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : (
          <div className="admin-card">
            <div className="admin-card-title">
              <FolderTree size={20} />
              Danh sách danh mục
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên danh mục</th>
                    <th>Mô tả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        Chưa có danh mục nào
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id}>
                        <td>#{cat.id}</td>
                        <td style={{ fontWeight: '500' }}>{cat.name}</td>
                        <td>{cat.description || '-'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link 
                              to={`/admin/categories/edit/${cat.id}`} 
                              className="admin-btn"
                              style={{ 
                                padding: '0.5rem 0.75rem',
                                background: 'rgba(255, 193, 7, 0.1)',
                                color: '#ffc107',
                                border: '1px solid rgba(255, 193, 7, 0.3)',
                                textDecoration: 'none'
                              }}
                            >
                              <Edit size={16} />
                            </Link>
                            <button 
                              onClick={() => handleDelete(cat.id)} 
                              className="admin-btn admin-btn-danger"
                              style={{ padding: '0.5rem 0.75rem' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}