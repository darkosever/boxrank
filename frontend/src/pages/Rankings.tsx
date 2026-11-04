import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { rankings, weightClasses, WeightClass, RankingResponse } from '../api';

export default function Rankings() {
  const [classes, setClasses] = useState<WeightClass[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [data, setData] = useState<RankingResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    weightClasses.getAll().then(r => {
      setClasses(r.data);
      if (r.data.length > 0) setSelectedId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    rankings.get(selectedId, page)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [selectedId, page]);

  return (
    <div className="page">
      <h1>Lestvica boksarjev</h1>

      <div className="tab-bar">
        {classes.map(c => (
          <button
            key={c.id}
            className={`tab ${selectedId === c.id ? 'active' : ''}`}
            onClick={() => { setSelectedId(c.id); setPage(1); }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading && <p className="loading">Nalaganje...</p>}

      {data && !loading && (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Boksar</th>
                <th>Klub</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map(b => (
                <tr key={b.id}>
                  <td><strong>{b.rank}</strong></td>
                  <td><Link to={`/boxers/${b.id}`}>{b.firstName} {b.lastName}</Link></td>
                  <td>{b.club.name}</td>
                  <td><strong>{b.currentRating}</strong></td>
                  <td>
                    {b.status === 'suspended'
                      ? <span className="badge badge-red">Suspendiran</span>
                      : <span className="badge badge-green">Aktiven</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button className="btn btn-secondary" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Nazaj</button>
            <span>Stran {page}</span>
            <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)} disabled={data.data.length < data.limit}>Naprej →</button>
          </div>
        </>
      )}
    </div>
  );
}
