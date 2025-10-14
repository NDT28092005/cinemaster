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
import AdminMovies from './components/admin/pages/AdminMovies';
import PrivateAdminRoute from './components/admin/PrivateAdminRoute';
import './assets/css/style.scss';
import Showtimes from './components/admin/pages/Showtimes';

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
            path="/admin/movies"
            element={
              <PrivateAdminRoute>
                <AdminMovies />
              </PrivateAdminRoute>
            }
          />
          <Route
            path="/admin/showtimes"
            element={
              <PrivateAdminRoute>
                <Showtimes />
              </PrivateAdminRoute>
            }
          />
          {/* Nếu không tìm thấy route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;