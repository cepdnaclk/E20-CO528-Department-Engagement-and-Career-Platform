import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Calendar, MapPin, Users, Plus, X, Clock } from 'lucide-react';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState('upcoming');
  const [form, setForm] = useState({ title: '', description: '', date: '', endDate: '', location: '', type: 'workshop', maxAttendees: '' });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try { const { data } = await api.get('/events'); setEvents(data); } catch {} setLoading(false);
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : 0 };
      await api.post('/events', payload);
      setShowModal(false);
      setForm({ title: '', description: '', date: '', endDate: '', location: '', type: 'workshop', maxAttendees: '' });
      fetchEvents();
    } catch {}
  };

  const rsvpEvent = async (eventId) => {
    try {
      const { data } = await api.post(`/events/${eventId}/rsvp`);
      setEvents(events.map(e => e._id === eventId ? data : e));
    } catch {}
  };

  const hasRsvped = (event) => event.rsvps?.some(r => r._id === user?._id || r === user?._id);

  const now = new Date();
  const filteredEvents = tab === 'upcoming'
    ? events.filter(e => new Date(e.date) >= now)
    : tab === 'past' ? events.filter(e => new Date(e.date) < now) : events;

  const typeColors = { workshop: 'badge-primary', seminar: 'badge-info', hackathon: 'badge-danger', meetup: 'badge-success', other: 'badge-warning' };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>Events & Announcements</h1><p>Department events, workshops, and activities</p></div>
        {(user?.role === 'admin' || user?.role === 'alumni') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Create Event</button>
        )}
      </div>

      <div className="page-tabs">
        {['upcoming', 'past', 'all'].map(t => (
          <button key={t} className={`page-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      <div className="events-grid">
        {filteredEvents.map(event => (
          <div key={event._id} className="card event-card">
            <div className="event-card-banner" />
            <div className="event-card-body">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span className={`badge ${typeColors[event.type] || 'badge-primary'}`}>{event.type}</span>
                {new Date(event.date) < now && <span className="badge badge-warning">Past</span>}
              </div>
              <div className="event-date-badge">
                <Calendar size={14} />
                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <h3>{event.title}</h3>
              <div className="event-desc">{event.description}</div>
              <div className="event-info">
                {event.location && <div><MapPin size={16} /> {event.location}</div>}
                <div><Clock size={16} /> {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                <div><Users size={16} /> {event.rsvps?.length || 0} attending{event.maxAttendees > 0 ? ` / ${event.maxAttendees} max` : ''}</div>
              </div>
            </div>
            <div className="event-card-footer">
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>By {event.organizer?.name}</span>
              <button className={`btn ${hasRsvped(event) ? 'btn-success' : 'btn-primary'} btn-sm`} onClick={() => rsvpEvent(event._id)}>
                {hasRsvped(event) ? '✓ RSVP\'d' : 'RSVP'}
              </button>
            </div>
          </div>
        ))}
        {filteredEvents.length === 0 && <div className="empty-state"><Calendar /><h3>No events found</h3></div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Create Event</h3><button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <form onSubmit={createEvent}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Event Title</label><input className="form-input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Start Date/Time</label><input type="datetime-local" className="form-input" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">End Date/Time</label><input type="datetime-local" className="form-input" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Type</label>
                    <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="workshop">Workshop</option><option value="seminar">Seminar</option><option value="hackathon">Hackathon</option><option value="meetup">Meetup</option><option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Max Attendees (0 = unlimited)</label><input type="number" className="form-input" value={form.maxAttendees} onChange={e => setForm({...form, maxAttendees: e.target.value})} /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Event</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
