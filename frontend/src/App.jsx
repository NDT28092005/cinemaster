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
import AdminCategory from './components/admin/pages/AdminCategory';
import AdminOccasion from './components/admin/pages/AdminOccasion';
import AdminProducts from './components/admin/pages/AdminProduct';
import AdminCreateCategory from './components/admin/pages/AdminCreateCategory';
import AdminEditCategory from './components/admin/pages/AdminEditCategory';
import AdminCreateOccasion from './components/admin/pages/AdminCreateOccasion';
import AdminEditOccasion from './components/admin/pages/AdminEditOccasion';
import AdminCreateProduct from './components/admin/pages/AdminCreateProduct';
import AdminEditProduct from './components/admin/pages/AdminEditProduct';
import AdminReview from './components/admin/pages/AdminReview';
import AdminOrder from './components/admin/pages/AdminOrders';
import ProductList from './components/frontend/pages/ProductList';
import Cart from './components/frontend/pages/Cart';
import Profile from './components/frontend/pages/Profile';
import AdminPromotions from './components/admin/pages/AdminPromotions';
import AdminEditPromotion from './components/admin/pages/AdminEditPromotion';
import AdminPromotionUsage from './components/admin/pages/AdminPromotionUsage';
import AdminReferral from './components/admin/pages/AdminReferral';
import Chat from './components/Chat/Chat';

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
          <Route path="/products" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
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

          <Route path="/admin/categories" element={<AdminCategory />} />
          <Route path="/admin/categories/create" element={<AdminCreateCategory />} />
          <Route path="/admin/categories/edit/:id" element={<AdminEditCategory />} />
          <Route path="/admin/occasions" element={<AdminOccasion />} />
          <Route path="/admin/occasions/create" element={<AdminCreateOccasion />} />
          <Route path="/admin/occasions/edit/:id" element={<AdminEditOccasion />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/create" element={<AdminCreateProduct />} />
          <Route path="/admin/products/edit/:id" element={<AdminEditProduct />} />
          <Route path="/admin/reviews" element={<AdminReview />} />
          <Route path="/admin/orders" element={<AdminOrder />} />


          <Route path="/admin/promotions" element={<AdminPromotions />} />
          <Route path="/admin/promotions/edit/:id" element={<AdminEditPromotion />} />

          <Route path="/admin/promotion-usage" element={<AdminPromotionUsage />} />
          <Route path="/admin/referral" element={<AdminReferral />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;