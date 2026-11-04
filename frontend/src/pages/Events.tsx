import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { events, Event } from '../api';

export default function Events() {
  const [list, setList] = useState<Event[]>([]);

  useEffect(() => { events.getAll().then(r => setList(r.data)); }, []);

  return (
    <div className="page">
      <h1>Dogodki</h1>
      {list.length === 0
        ? <p className="empty">Ni dogodkov.</p>
        : <div className="card-grid">
            {list.map(e => (
              <Link key={e.id} to={`/events/${e.id}`} className="card">
                <h3>{e.name}</h3>
                <p>{new Date(e.date).toLocaleDateString('sl-SI')}</p>
                <p className="card-sub">{e.location}</p>
              </Link>
            ))}
          </div>
      }
    </div>
  );
}
