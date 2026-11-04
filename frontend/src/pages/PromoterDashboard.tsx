import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { clubs, boxers, fights, events, weightClasses, rankings, Boxer, WeightClass, Event, Suggestion } from '../api';
import { useAuth } from '../context/AuthContext';

export default function PromoterDashboard() {
  const { user } = useAuth();
  const [myBoxers, setMyBoxers] = useState<Boxer[]>([]);
  const [myClubId, setMyClubId] = useState<number | null>(null);
  const [classes, setClasses] = useState<WeightClass[]>([]);
  const [eventList, setEventList] = useState<Event[]>([]);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState<'boxers' | 'fight' | 'event'>('boxers');

  // Add boxer form
  const [newBoxer, setNewBoxer] = useState({ firstName: '', lastName: '', dateOfBirth: '', weightClassId: '' });

  // Submit fight form
  const [fightForm, setFightForm] = useState({ boxer1Id: '', boxer2Id: '', eventId: '', date: '', result: 'KO', winnerId: '' });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Add event form
  const [eventForm, setEventForm] = useState({ name: '', date: '', location: '' });

  useEffect(() => {
    weightClasses.getAll().then(r => setClasses(r.data));
    events.getAll().then(r => setEventList(r.data));
    clubs.getMy()
      .then(r => {
        setMyClubId(r.data.id);
        return clubs.getBoxers(r.data.id);
      })
      .then(r => setMyBoxers(r.data))
      .catch(() => setMsg('Nimate dodeljenega kluba. Kontaktirajte admina.'));
  }, []);

  const handleAddBoxer = async (e: FormEvent) => {
    e.preventDefault();
    if (!myClubId) return;
    try {
      await boxers.create({
        ...newBoxer,
        clubId: myClubId,
        weightClassId: parseInt(newBoxer.weightClassId),
        dateOfBirth: new Date(newBoxer.dateOfBirth).toISOString(),
      });
      setMsg('Boksar dodan!');
      setNewBoxer({ firstName: '', lastName: '', dateOfBirth: '', weightClassId: '' });
      clubs.getBoxers(myClubId).then(r => setMyBoxers(r.data));
    } catch (err: any) {
      setMsg(err.response?.data?.message ?? 'Napaka.');
    }
  };

  const handleBoxer1Change = (boxer1Id: string) => {
    setFightForm(f => ({ ...f, boxer1Id, boxer2Id: '', winnerId: '' }));
    setSuggestions([]);
    if (boxer1Id) {
      rankings.getSuggestions(parseInt(boxer1Id))
        .then(r => setSuggestions(r.data))
        .catch(() => setSuggestions([]));
    }
  };

  const handleSubmitFight = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload: Record<string, unknown> = {
        boxer1Id: parseInt(fightForm.boxer1Id),
        boxer2Id: parseInt(fightForm.boxer2Id),
        eventId: parseInt(fightForm.eventId),
        date: new Date(fightForm.date).toISOString(),
        result: fightForm.result,
      };
      if (fightForm.result !== 'draw') payload.winnerId = parseInt(fightForm.winnerId);
      await fights.create(payload);
      setMsg('Predlog dvoboja oddan! Admin bo potrdil.');
      setFightForm({ boxer1Id: '', boxer2Id: '', eventId: '', date: '', result: 'KO', winnerId: '' });
    } catch (err: any) {
      setMsg(err.response?.data?.message ?? 'Napaka.');
    }
  };

  const handleAddEvent = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await events.create({ ...eventForm, date: new Date(eventForm.date).toISOString() });
      setMsg('Dogodek ustvarjen!');
      setEventForm({ name: '', date: '', location: '' });
      events.getAll().then(r => setEventList(r.data));
    } catch (err: any) {
      setMsg(err.response?.data?.message ?? 'Napaka.');
    }
  };

  return (
    <div className="page">
      <h1>Moj klub</h1>
      {msg && <p className="success">{msg}</p>}

      <div className="tab-bar">
        <button className={`tab ${tab === 'boxers' ? 'active' : ''}`} onClick={() => setTab('boxers')}>Moji boksarji</button>
        <button className={`tab ${tab === 'fight' ? 'active' : ''}`} onClick={() => setTab('fight')}>Vnesi dvoboj</button>
        <button className={`tab ${tab === 'event' ? 'active' : ''}`} onClick={() => setTab('event')}>Nov dogodek</button>
      </div>

      {tab === 'boxers' && (
        <>
          <table className="table">
            <thead><tr><th>Boksar</th><th>Kategorija</th><th>Rating</th><th>Status</th></tr></thead>
            <tbody>
              {myBoxers.map(b => (
                <tr key={b.id}>
                  <td><Link to={`/boxers/${b.id}`}>{b.firstName} {b.lastName}</Link></td>
                  <td>{b.weightClass.name}</td>
                  <td><strong>{b.currentRating}</strong></td>
                  <td>{b.status === 'suspended' ? <span className="badge badge-red">Suspendiran</span> : <span className="badge badge-green">Aktiven</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Dodaj boksarja</h3>
          <form onSubmit={handleAddBoxer} className="form form-inline">
            <input placeholder="Ime" value={newBoxer.firstName} onChange={e => setNewBoxer({ ...newBoxer, firstName: e.target.value })} required />
            <input placeholder="Priimek" value={newBoxer.lastName} onChange={e => setNewBoxer({ ...newBoxer, lastName: e.target.value })} required />
            <input type="date" value={newBoxer.dateOfBirth} onChange={e => setNewBoxer({ ...newBoxer, dateOfBirth: e.target.value })} required />
            <select value={newBoxer.weightClassId} onChange={e => setNewBoxer({ ...newBoxer, weightClassId: e.target.value })} required>
              <option value="">Kategorija...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="submit" className="btn btn-primary">Dodaj</button>
          </form>
        </>
      )}

      {tab === 'fight' && (
        <form onSubmit={handleSubmitFight} className="form">
          <label>Boksar 1 (iz vašega kluba)
            <select value={fightForm.boxer1Id} onChange={e => handleBoxer1Change(e.target.value)} required>
              <option value="">Izberi boksarja...</option>
              {myBoxers.filter(b => b.status === 'active').map(b => (
                <option key={b.id} value={b.id}>{b.firstName} {b.lastName} – {b.weightClass.name} (rating: {b.currentRating})</option>
              ))}
            </select>
          </label>

          <label>Boksar 2 (nasprotnik)
            {!fightForm.boxer1Id
              ? <select disabled><option>Najprej izberi Boksarja 1</option></select>
              : suggestions.length === 0
                ? <select disabled><option>Ni primernih nasprotnikov iste kategorije</option></select>
                : <select value={fightForm.boxer2Id} onChange={e => setFightForm(f => ({ ...f, boxer2Id: e.target.value, winnerId: '' }))} required>
                    <option value="">Izberi nasprotnika...</option>
                    {suggestions.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} – {s.club.name} (rating: {s.currentRating}, razlika: {s.ratingDiff})
                        {s.recentFightDate ? ' ⚠ nastopil nedavno' : ''}
                      </option>
                    ))}
                  </select>
            }
          </label>

          <label>Dogodek
            <select value={fightForm.eventId} onChange={e => setFightForm(f => ({ ...f, eventId: e.target.value }))} required>
              <option value="">Izberi...</option>
              {eventList.map(ev => <option key={ev.id} value={ev.id}>{ev.name} – {new Date(ev.date).toLocaleDateString('sl-SI')}</option>)}
            </select>
          </label>

          <label>Datum dvoboja
            <input type="datetime-local" value={fightForm.date} onChange={e => setFightForm(f => ({ ...f, date: e.target.value }))} required />
          </label>

          <label>Izid
            <select value={fightForm.result} onChange={e => setFightForm(f => ({ ...f, result: e.target.value, winnerId: '' }))}>
              <option value="KO">KO</option>
              <option value="TKO">TKO</option>
              <option value="decision">Odločitev sodnikov</option>
              <option value="draw">Neodločeno</option>
            </select>
          </label>

          {fightForm.result !== 'draw' && (
            <label>Zmagovalec
              <select value={fightForm.winnerId} onChange={e => setFightForm(f => ({ ...f, winnerId: e.target.value }))} required>
                <option value="">Izberi zmagovalca...</option>
                {fightForm.boxer1Id && (() => {
                  const b = myBoxers.find(b => b.id === parseInt(fightForm.boxer1Id));
                  return b ? <option value={b.id}>{b.firstName} {b.lastName} (Boksar 1)</option> : null;
                })()}
                {fightForm.boxer2Id && (() => {
                  const s = suggestions.find(s => s.id === parseInt(fightForm.boxer2Id));
                  return s ? <option value={s.id}>{s.firstName} {s.lastName} (Boksar 2)</option> : null;
                })()}
              </select>
            </label>
          )}

          <button type="submit" className="btn btn-primary" disabled={!fightForm.boxer1Id || !fightForm.boxer2Id}>
            Oddaj predlog dvoboja
          </button>
        </form>
      )}

      {tab === 'event' && (
        <form onSubmit={handleAddEvent} className="form">
          <label>Ime dogodka <input value={eventForm.name} onChange={e => setEventForm({ ...eventForm, name: e.target.value })} required /></label>
          <label>Datum <input type="datetime-local" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} required /></label>
          <label>Lokacija <input value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} required /></label>
          <button type="submit" className="btn btn-primary">Ustvari dogodek</button>
        </form>
      )}
    </div>
  );
}
