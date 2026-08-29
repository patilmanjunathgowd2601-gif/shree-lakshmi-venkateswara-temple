import { useEffect, useState } from 'react';
import api from '../api';
import bookingApi from '../bookingApi';
import { useAuth } from '../context/AuthContext';

const TABS = ['Notices', 'Events', 'Gallery', 'Donations', 'Bookings'];

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const [tab, setTab] = useState('Events');

  return (
    <div className="section">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div>
          <span className="muted">Signed in as {admin?.name}</span>{' '}
          <button className="btn btn-outline" onClick={logout}>
            Log Out
          </button>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? 'tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Notices' && <NoticesAdmin />}
      {tab === 'Events' && <EventsAdmin />}
      {tab === 'Gallery' && <GalleryAdmin />}
      {tab === 'Donations' && <DonationsAdmin />}
      {tab === 'Bookings' && <BookingsAdmin />}
    </div>
  );
}

function NoticesAdmin() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', priority: 'normal' });
  const [error, setError] = useState(null);

  function load() {
    api.get('/notices').then(({ data }) => setNotices(data));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/notices', form);
      setForm({ title: '', body: '', priority: 'normal' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post notice.');
    }
  }

  async function handleDelete(id) {
    await api.delete(`/notices/${id}`);
    load();
  }

  return (
    <div>
      <form className="admin-form" onSubmit={handleCreate}>
        <h3>Post Notice</h3>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Details (optional)"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          <option value="normal">Normal</option>
          <option value="important">Important</option>
        </select>
        <button type="submit" className="btn btn-primary">
          Post Notice
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Priority</th>
            <th>Published</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {notices.map((n) => (
            <tr key={n._id}>
              <td>{n.title}</td>
              <td>
                <span className={`badge ${n.priority === 'important' ? 'badge-created' : ''}`}>
                  {n.priority}
                </span>
              </td>
              <td>{new Date(n.publishedAt).toLocaleDateString()}</td>
              <td>
                <button className="btn btn-outline btn-sm" onClick={() => handleDelete(n._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EventsAdmin() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', category: 'other' });
  const [error, setError] = useState(null);

  function load() {
    api.get('/events').then(({ data }) => setEvents(data));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/events', form);
      setForm({ title: '', description: '', date: '', time: '', category: 'other' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create event.');
    }
  }

  async function handleDelete(id) {
    await api.delete(`/events/${id}`);
    load();
  }

  return (
    <div>
      <form className="admin-form" onSubmit={handleCreate}>
        <h3>Add Event</h3>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          placeholder="Time (e.g. 6:00 AM - 8:00 PM)"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="festival">Festival</option>
          <option value="pooja">Pooja</option>
          <option value="seva">Seva</option>
          <option value="cultural">Cultural</option>
          <option value="other">Other</option>
        </select>
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit" className="btn btn-primary">
          Add Event
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Category</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr key={ev._id}>
              <td>{ev.title}</td>
              <td>{new Date(ev.date).toLocaleDateString()}</td>
              <td>{ev.category}</td>
              <td>
                <button className="btn btn-outline btn-sm" onClick={() => handleDelete(ev._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GalleryAdmin() {
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({ title: '', imageUrl: '', category: 'other' });
  const [error, setError] = useState(null);

  function load() {
    api.get('/gallery').then(({ data }) => setImages(data));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/gallery', form);
      setForm({ title: '', imageUrl: '', category: 'other' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add image.');
    }
  }

  async function handleDelete(id) {
    await api.delete(`/gallery/${id}`);
    load();
  }

  return (
    <div>
      <form className="admin-form" onSubmit={handleCreate}>
        <h3>Add Gallery Image</h3>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          placeholder="Image URL (upload elsewhere first, e.g. Cloudinary)"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          required
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="temple">Temple</option>
          <option value="festival">Festival</option>
          <option value="deity">Deity</option>
          <option value="event">Event</option>
          <option value="other">Other</option>
        </select>
        <button type="submit" className="btn btn-primary">
          Add Image
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>

      <div className="gallery-grid">
        {images.map((img) => (
          <figure className="gallery-item" key={img._id}>
            <img src={img.imageUrl} alt={img.title} />
            <figcaption>
              {img.title}
              <button className="btn btn-outline btn-sm" onClick={() => handleDelete(img._id)}>
                Delete
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function DonationsAdmin() {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    api.get('/donations').then(({ data }) => setDonations(data));
  }, []);

  const totalPaid = donations
    .filter((d) => d.status === 'paid')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div>
      <p>
        <strong>Total received: ₹{totalPaid}</strong>
      </p>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Donor</th>
            <th>Amount</th>
            <th>Purpose</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((d) => (
            <tr key={d._id}>
              <td>{d.donorName}</td>
              <td>₹{d.amount}</td>
              <td>{d.purpose}</td>
              <td>
                <span className={`badge badge-${d.status}`}>{d.status}</span>
              </td>
              <td>{new Date(d.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookingsAdmin() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  function load() {
    bookingApi
      .get('/bookings')
      .then(({ data }) => setBookings(data))
      .catch(() =>
        setError('Could not load bookings. Is the booking-service running?')
      );
  }

  useEffect(load, []);

  async function updateStatus(id, status) {
    await bookingApi.patch(`/bookings/${id}`, { status });
    load();
  }

  return (
    <div>
      <p className="muted">
        Requests submitted via the &quot;Book a Priest&quot; page (handled by the
        separate Python booking-service).
      </p>
      {error && <p className="error-text">{error}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Devotee</th>
            <th>Seva</th>
            <th>Preferred Date</th>
            <th>Phone</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.devotee_name}</td>
              <td>{b.seva_type.replaceAll('_', ' ')}</td>
              <td>{b.preferred_date}</td>
              <td>{b.phone}</td>
              <td>
                <span className={`badge badge-${b.status === 'confirmed' ? 'paid' : 'created'}`}>
                  {b.status}
                </span>
              </td>
              <td>
                {b.status === 'pending' && (
                  <button className="btn btn-outline btn-sm" onClick={() => updateStatus(b.id, 'confirmed')}>
                    Confirm
                  </button>
                )}
                {b.status === 'confirmed' && (
                  <button className="btn btn-outline btn-sm" onClick={() => updateStatus(b.id, 'completed')}>
                    Mark Completed
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
