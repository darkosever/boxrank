import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🥊 BoxRank</Link>
      </div>
      <div className="navbar-links">
        <Link to="/rankings">Lestvica</Link>
        <Link to="/boxers">Boksarji</Link>
        <Link to="/events">Dogodki</Link>
        {user?.role === 'promoter' && <Link to="/dashboard">Moj klub</Link>}
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
      </div>
      <div className="navbar-auth">
        {user ? (
          <>
            <span className="navbar-user">{user.email} ({user.role})</span>
            <button onClick={handleLogout} className="btn btn-secondary">Odjava</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">Prijava</Link>
            <Link to="/register" className="btn btn-primary">Registracija</Link>
          </>
        )}
      </div>
    </nav>
  );
}
