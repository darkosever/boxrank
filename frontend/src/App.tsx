import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Rankings from './pages/Rankings';
import Boxers from './pages/Boxers';
import BoxerProfile from './pages/BoxerProfile';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PromoterDashboard from './pages/PromoterDashboard';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/rankings" replace />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/boxers" element={<Boxers />} />
          <Route path="/boxers/:id" element={<BoxerProfile />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['promoter']}>
              <PromoterDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </>
  );
}
