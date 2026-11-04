import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { events, Event } from '../api';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    events.getById(parseInt(id!)).then(r => setEvent(r.data));
  }, [id]);

  if (!event) return <p className="loading">Nalaganje...</p>;

  return (
    <div className="page">
      <h1>{event.name}</h1>
      <p className="profile-meta">{new Date(event.date).toLocaleDateString('sl-SI')} · {event.location}</p>

      <h2>Dvoboji</h2>
      {!event.fights || event.fights.length === 0
        ? <p className="empty">Ni dvobojev.</p>
        : <table className="table">
            <thead>
              <tr><th>Boksar 1</th><th>Boksar 2</th><th>Izid</th><th>Status</th></tr>
            </thead>
            <tbody>
              {event.fights.map(f => (
                <tr key={f.id}>
                  <td><Link to={`/boxers/${f.boxer1.id}`}>{f.boxer1.firstName} {f.boxer1.lastName}</Link></td>
                  <td><Link to={`/boxers/${f.boxer2.id}`}>{f.boxer2.firstName} {f.boxer2.lastName}</Link></td>
                  <td>
                    {f.status === 'confirmed' && f.winner
                      ? <>{f.winner.firstName} {f.winner.lastName} ({f.result})</>
                      : '–'}
                  </td>
                  <td>
                    {f.status === 'pending'
                      ? <span className="badge badge-gray">Rezultat še ni potrjen</span>
                      : f.status === 'confirmed'
                        ? <span className="badge badge-green">Potrjeno</span>
                        : <span className="badge badge-red">Zavrnjeno</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      }
    </div>
  );
}
