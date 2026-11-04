import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { boxers, rankings, Boxer, FightHistory, RatingHistory } from '../api';

export default function BoxerProfile() {
  const { id } = useParams<{ id: string }>();
  const boxerId = parseInt(id!);

  const [boxer, setBoxer] = useState<Boxer | null>(null);
  const [history, setHistory] = useState<FightHistory | null>(null);
  const [ratingHistory, setRatingHistory] = useState<RatingHistory[]>([]);
  const [tab, setTab] = useState<'fights' | 'rating'>('fights');

  useEffect(() => {
    boxers.getById(boxerId).then(r => setBoxer(r.data));
    boxers.getFights(boxerId).then(r => setHistory(r.data));
    rankings.getHistory(boxerId).then(r => setRatingHistory(r.data));
  }, [boxerId]);

  if (!boxer) return <p className="loading">Nalaganje...</p>;

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-avatar">{boxer.firstName[0]}{boxer.lastName[0]}</div>
        <div>
          <h1>{boxer.firstName} {boxer.lastName}
            {boxer.status === 'suspended' && <span className="badge badge-red ml">Suspendiran</span>}
          </h1>
          <p className="profile-meta">
            <span>{boxer.club.name}</span> · <span>{boxer.weightClass.name}</span>
          </p>
          <p className="profile-rating">Rating: <strong>{boxer.currentRating}</strong></p>
          {boxer.status === 'suspended' && boxer.suspendReason && (
            <p className="error">Razlog: {boxer.suspendReason}</p>
          )}
        </div>
      </div>

      {history && (
        <div className="career-summary">
          <span className="summary-win">{history.summary.wins} Z</span>
          <span className="summary-sep"> – </span>
          <span className="summary-loss">{history.summary.losses} P</span>
          <span className="summary-sep"> – </span>
          <span className="summary-draw">{history.summary.draws} N</span>
        </div>
      )}

      <div className="tab-bar">
        <button className={`tab ${tab === 'fights' ? 'active' : ''}`} onClick={() => setTab('fights')}>Dvoboji</button>
        <button className={`tab ${tab === 'rating' ? 'active' : ''}`} onClick={() => setTab('rating')}>Zgodovina ratinga</button>
      </div>

      {tab === 'fights' && history && (
        history.fights.length === 0
          ? <p className="empty">Še ni odigranih dvobojev.</p>
          : <table className="table">
              <thead>
                <tr><th>Datum</th><th>Nasprotnik</th><th>Dogodek</th><th>Izid</th></tr>
              </thead>
              <tbody>
                {history.fights.map(f => {
                  const opponent = f.boxer1.id === boxerId ? f.boxer2 : f.boxer1;
                  const won = f.winner?.id === boxerId;
                  const draw = f.result === 'draw';
                  return (
                    <tr key={f.id}>
                      <td>{new Date(f.date).toLocaleDateString('sl-SI')}</td>
                      <td><Link to={`/boxers/${opponent.id}`}>{opponent.firstName} {opponent.lastName}</Link></td>
                      <td>{f.event.name}</td>
                      <td>
                        <span className={`badge ${draw ? 'badge-gray' : won ? 'badge-green' : 'badge-red'}`}>
                          {draw ? 'N' : won ? 'Z' : 'P'} · {f.result}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
      )}

      {tab === 'rating' && (
        ratingHistory.length === 0
          ? <p className="empty">Ni še podatkov o dvobojih.</p>
          : <table className="table">
              <thead>
                <tr><th>Datum</th><th>Pred</th><th>Po</th><th>Sprememba</th></tr>
              </thead>
              <tbody>
                {ratingHistory.map(r => {
                  const diff = r.ratingAfter - r.ratingBefore;
                  return (
                    <tr key={r.id}>
                      <td>{new Date(r.fight.date).toLocaleDateString('sl-SI')}</td>
                      <td>{r.ratingBefore}</td>
                      <td><strong>{r.ratingAfter}</strong></td>
                      <td><span className={diff >= 0 ? 'text-green' : 'text-red'}>{diff >= 0 ? '+' : ''}{diff}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
      )}
    </div>
  );
}
