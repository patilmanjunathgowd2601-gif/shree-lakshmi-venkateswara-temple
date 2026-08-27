import { useEffect, useState } from 'react';
import api from '../api';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/events', { params: { upcoming: true } })
      .then(({ data }) => {
        if (!cancelled) {
          setEvents(data);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="section">
      <h1>Upcoming Events</h1>

      {status === 'loading' && <p>Loading events&hellip;</p>}
      {status === 'error' && (
        <p className="error-text">
          Could not load events right now. Please try again later.
        </p>
      )}
      {status === 'ready' && events.length === 0 && (
        <p>No upcoming events are scheduled at the moment. Please check back soon.</p>
      )}

      <div className="card-grid">
        {events.map((event) => (
          <div className="card" key={event._id}>
            <span className="badge">{event.category}</span>
            <h3>{event.title}</h3>
            <p className="muted">{formatDate(event.date)}</p>
            {event.time && <p className="muted">{event.time}</p>}
            {event.description && <p>{event.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
