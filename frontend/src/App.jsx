import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/frontend/pages/Home';
import About from './components/frontend/pages/About';
import Login from './components/frontend/pages/Login';
import Register from './components/frontend/pages/Register';
import VerifyEmail from './components/frontend/pages/VerifyEmail';
import { AuthProvider } from './context/AuthProvider';
import LoginAdmin from './components/admin/pages/LoginAdmin';
import AdminDashboard from './components/admin/pages/AdminDashboard';
import PrivateAdminRoute from './components/admin/PrivateAdminRoute';
import './assets/css/style.scss';
import AdminUser from './components/admin/pages/AdminUser';
import AdminEditUser from './components/admin/pages/AdminEditUser';
import AdminAddUser from './components/admin/pages/AdminAddUser';
import AdminUserAddresses from './components/admin/pages/AdminUserAddresses';
import AdminUserPreferences from './components/admin/pages/AdminUserPreferences';
import AdminEditUserAddress from './components/admin/pages/AdminEditUserAddress';
import AdminEditUserPreferences from './components/admin/pages/AdminEditUserPreferences';
import AdminAddUserPreference from './components/admin/pages/AdminAddUserPreference';
import AdminUserAnniversaryForm from './components/admin/pages/AdminUserAnniversaryForm';
import AdminUserAnniversariesList from './components/admin/pages/AdminUserAnniversariesList';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Frontend */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Admin */}
          <Route path="/admin/login" element={<LoginAdmin />} />
          <Route
            path="/admin"
            element={
              <PrivateAdminRoute>
                <AdminDashboard />
              </PrivateAdminRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateAdminRoute>
                <AdminDashboard />
              </PrivateAdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateAdminRoute>
                <AdminUser />
              </PrivateAdminRoute>
            }
          />
          <Route path="/admin/users/edit/:id" element={<AdminEditUser />} />
          <Route path="/admin/users/create" element={<AdminAddUser />} />
          <Route path="/admin/users/:id/addresses" element={<AdminUserAddresses />} />
          <Route path="/admin/users/:id/preferences" element={<AdminUserPreferences />} />
          <Route path="/admin/users/:id/anniversaries" element={<AdminUserAnniversariesList />} />
          <Route path="/admin/users/:id/addresses/:addrId/edit" element={<AdminEditUserAddress />} />          
          <Route path="/admin/users/:id/preferences" element={<AdminUserPreferences />} />
          <Route path="/admin/users/:id/preferences/add" element={<AdminAddUserPreference />} />
          <Route path="/admin/users/:id/preferences/:prefId/edit" element={<AdminEditUserPreferences />} />
          <Route path="/admin/users/:id/anniversaries/add" element={<AdminUserAnniversaryForm />} />
          <Route path="/admin/users/:id/anniversaries/:anniversaryId/edit" element={<AdminUserAnniversaryForm />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;