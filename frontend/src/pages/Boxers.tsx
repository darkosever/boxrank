import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { boxers, weightClasses, WeightClass, Boxer } from '../api';

export default function Boxers() {
  const [classes, setClasses] = useState<WeightClass[]>([]);
  const [results, setResults] = useState<Boxer[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [weightClassId, setWeightClassId] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    weightClasses.getAll().then(r => setClasses(r.data));
  }, []);

  useEffect(() => {
    const params: Record<string, unknown> = { page };
    if (search.length >= 3) params.search = search;
    if (weightClassId) params.weightClassId = weightClassId;
    boxers.search(params).then(r => {
      setResults(r.data.data);
      setTotal(r.data.total);
    });
  }, [search, weightClassId, page]);

  return (
    <div className="page">
      <h1>Boksarji</h1>
      <div className="filters">
        <input
          type="text" placeholder="Iskanje po imenu (min. 3 znaki)"
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={weightClassId} onChange={e => { setWeightClassId(e.target.value); setPage(1); }}>
          <option value="">Vse kategorije</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn btn-secondary" onClick={() => { setSearch(''); setWeightClassId(''); setPage(1); }}>Ponastavi</button>
      </div>

      <p className="result-count">Najdenih: {total}</p>

      {results.length === 0
        ? <p className="empty">Ni rezultatov. Poskusite spremeniti filtre.</p>
        : <table className="table">
            <thead>
              <tr><th>Boksar</th><th>Klub</th><th>Kategorija</th><th>Rating</th><th>Status</th></tr>
            </thead>
            <tbody>
              {results.map(b => (
                <tr key={b.id}>
                  <td><Link to={`/boxers/${b.id}`}>{b.firstName} {b.lastName}</Link></td>
                  <td>{b.club.name}</td>
                  <td>{b.weightClass.name}</td>
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
      }

      <div className="pagination">
        <button className="btn btn-secondary" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Nazaj</button>
        <span>Stran {page}</span>
        <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)} disabled={results.length < 20}>Naprej →</button>
      </div>
    </div>
  );
}
