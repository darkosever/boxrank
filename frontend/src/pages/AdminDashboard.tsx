import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fights, Fight } from '../api';

export default function AdminDashboard() {
  const [pending, setPending] = useState<Fight[]>([]);
  const [msg, setMsg] = useState('');
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => fights.getPending().then(r => setPending(r.data));
  useEffect(() => { load(); }, []);

  const handleConfirm = async (id: number) => {
    try {
      await fights.confirm(id);
      setMsg('Dvoboj potrjen!');
      load();
    } catch (err: any) {
      setMsg(err.response?.data?.message ?? 'Napaka.');
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason) return;
    try {
      await fights.reject(rejectId, rejectReason);
      setMsg('Dvoboj zavrnjen.');
      setRejectId(null);
      setRejectReason('');
      load();
    } catch (err: any) {
      setMsg(err.response?.data?.message ?? 'Napaka.');
    }
  };

  return (
    <div className="page">
      <h1>Admin – Dvoboji v potrjevanju</h1>
      {msg && <p className="success">{msg}</p>}

      {pending.length === 0
        ? <p className="empty">Ni dvobojev za potrditev.</p>
        : <table className="table">
            <thead>
              <tr><th>Boksar 1</th><th>Boksar 2</th><th>Ereignis</th><th>Datum</th><th>Izid</th><th>Akcija</th></tr>
            </thead>
            <tbody>
              {pending.map(f => (
                <tr key={f.id}>
                  <td><Link to={`/boxers/${f.boxer1.id}`}>{f.boxer1.firstName} {f.boxer1.lastName}</Link></td>
                  <td><Link to={`/boxers/${f.boxer2.id}`}>{f.boxer2.firstName} {f.boxer2.lastName}</Link></td>
                  <td>{f.event.name}</td>
                  <td>{new Date(f.date).toLocaleDateString('sl-SI')}</td>
                  <td>{f.winner ? `${f.winner.firstName} ${f.winner.lastName} (${f.result})` : f.result}</td>
                  <td className="action-cell">
                    <button className="btn btn-primary btn-sm" onClick={() => handleConfirm(f.id)}>Potrdi</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setRejectId(f.id)}>Zavrni</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      }

      {rejectId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Razlog za zavrnitev</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Vnesi razlog..." />
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleReject} disabled={!rejectReason}>Zavrni</button>
              <button className="btn btn-secondary" onClick={() => setRejectId(null)}>Prekliči</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
