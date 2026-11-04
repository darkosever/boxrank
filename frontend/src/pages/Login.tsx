import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await auth.login(email, password);
      login(data.token, data.user);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'promoter') navigate('/dashboard');
      else navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Napaka pri prijavi.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Prijava</h1>
        <form onSubmit={handleSubmit} className="form">
          <label>E-poštni naslov
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label>Geslo
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-full">Prijavi se</button>
        </form>
        <p className="auth-footer">Nimate računa? <Link to="/register">Registracija</Link></p>
      </div>
    </div>
  );
}
