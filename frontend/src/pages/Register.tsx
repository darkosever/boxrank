import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('boxer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await auth.register(email, password, role);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Napaka pri registraciji.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Registracija</h1>
        {success ? (
          <p className="success">Račun ustvarjen! Preusmerjamo na prijavo...</p>
        ) : (
          <form onSubmit={handleSubmit} className="form">
            <label>E-poštni naslov
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </label>
            <label>Geslo (min. 8 znakov)
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            </label>
            <label>Vloga
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="boxer">Boksar</option>
                <option value="promoter">Promotor</option>
              </select>
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn btn-primary btn-full">Registriraj se</button>
          </form>
        )}
        <p className="auth-footer">Že imate račun? <Link to="/login">Prijava</Link></p>
      </div>
    </div>
  );
}
