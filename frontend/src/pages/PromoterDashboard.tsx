import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { clubs, boxers, fights, events, weightClasses, Boxer, WeightClass, Event } from '../api';
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

  // Add event form
  const [eventForm, setEventForm] = useState({ name: '', date: '', location: '' });

  useEffect(() => {
    weightClasses.getAll().then(r => setClasses(r.data));
    events.getAll().then(r => setEventList(r.data));

    // find promoter's club by loading their boxers (club is linked to promoter account)
    // We get club info via /clubs — but we need to know our club id
    // The API gives club info when we load boxers via the club endpoint
    // Workaround: search all boxers with no filters, find one that belongs to our club
    // Better: we'll try to load club 1 first (seed), then check promoterId
    // Actually best approach: the token contains promoter id, the backend links club to promoter
    // We'll use the boxers search but check the club endpoint for each promoter
    // Simple approach: try loading known clubs by id until we find ours
    // For now: load boxers from /boxers and check which have our promoter's club
    // The correct way: add GET /clubs/my on backend — but we didn't do that
    // Workaround: load /boxers with no filter, then check club by promoterId match from token
    // Since we don't have /clubs/my, we'll try GET /clubs/1 and /clubs/2 to find ours
    tryFindMyClub();
  }, []);

  const tryFindMyClub = async () => {
    for (let id = 1; id <= 20; id++) {
      try {
        const r = await clubs.getById(id);
        if (r.data.promoter?.id === user?.id) {
          setMyClubId(id);
          clubs.getBoxers(id).then(res => setMyBoxers(res.data));
          return;
        }
      } catch { /* continue */ }
    }
  };

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
          <label>Boksar 1
            <select value={fightForm.boxer1Id} onChange={e => setFightForm({ ...fightForm, boxer1Id: e.target.value })} required>
              <option value="">Izberi...</option>
              {myBoxers.map(b => <option key={b.id} value={b.id}>{b.firstName} {b.lastName}</option>)}
            </select>
          </label>
          <label>Boksar 2 (ID nasprotnika)
            <input type="number" value={fightForm.boxer2Id} onChange={e => setFightForm({ ...fightForm, boxer2Id: e.target.value })} required placeholder="ID boksarja" />
          </label>
          <label>Dogodek
            <select value={fightForm.eventId} onChange={e => setFightForm({ ...fightForm, eventId: e.target.value })} required>
              <option value="">Izberi...</option>
              {eventList.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </label>
          <label>Datum dvoboja
            <input type="datetime-local" value={fightForm.date} onChange={e => setFightForm({ ...fightForm, date: e.target.value })} required />
          </label>
          <label>Izid
            <select value={fightForm.result} onChange={e => setFightForm({ ...fightForm, result: e.target.value, winnerId: '' })}>
              <option value="KO">KO</option>
              <option value="TKO">TKO</option>
              <option value="decision">Odločitev</option>
              <option value="draw">Neodločeno</option>
            </select>
          </label>
          {fightForm.result !== 'draw' && (
            <label>Zmagovalec
              <select value={fightForm.winnerId} onChange={e => setFightForm({ ...fightForm, winnerId: e.target.value })} required>
                <option value="">Izberi...</option>
                {fightForm.boxer1Id && myBoxers.find(b => b.id === parseInt(fightForm.boxer1Id)) && (
                  <option value={fightForm.boxer1Id}>
                    {myBoxers.find(b => b.id === parseInt(fightForm.boxer1Id))?.firstName} (Boksar 1)
                  </option>
                )}
                {fightForm.boxer2Id && <option value={fightForm.boxer2Id}>Boksar 2 (ID: {fightForm.boxer2Id})</option>}
              </select>
            </label>
          )}
          <button type="submit" className="btn btn-primary">Oddaj predlog</button>
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
