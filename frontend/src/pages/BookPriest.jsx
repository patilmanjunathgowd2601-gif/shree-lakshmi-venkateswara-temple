import { useState } from 'react';
import bookingApi from '../bookingApi';

const SEVA_TYPES = [
  { value: 'griha_pravesh', label: 'Griha Pravesh (Housewarming)' },
  { value: 'satyanarayana_pooja', label: 'Satyanarayana Pooja' },
  { value: 'naming_ceremony', label: 'Naming Ceremony' },
  { value: 'housewarming_homam', label: 'Housewarming Homam' },
  { value: 'other', label: 'Other' },
];

const initialForm = {
  devotee_name: '',
  phone: '',
  email: '',
  seva_type: 'griha_pravesh',
  preferred_date: '',
  address: '',
  notes: '',
};

export default function BookPriest() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const payload = { ...form, email: form.email || undefined, notes: form.notes || undefined };
      await bookingApi.post('/bookings', payload);
      setMessage({
        type: 'success',
        text: 'Your request has been received. The temple office will contact you to confirm.',
      });
      setForm(initialForm);
    } catch (err) {
      const text =
        err.response?.data?.detail?.[0]?.msg ||
        err.response?.data?.detail ||
        'Could not submit your request right now. Please try again or call the temple office.';
      setMessage({ type: 'error', text: typeof text === 'string' ? text : 'Could not submit your request.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section">
      <h1>Book a Priest for Home Seva</h1>
      <p>
        Request a priest to perform a pooja or ceremony at your home. This
        request is handled by our separate booking service &mdash; a good example
        of a small, independent microservice in this project.
      </p>

      <form className="donate-form" onSubmit={handleSubmit}>
        <label>
          Full Name
          <input
            type="text"
            value={form.devotee_name}
            onChange={(e) => updateField('devotee_name', e.target.value)}
            required
          />
        </label>

        <label>
          Phone
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            required
          />
        </label>

        <label>
          Email (optional)
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </label>

        <label>
          Seva Type
          <select value={form.seva_type} onChange={(e) => updateField('seva_type', e.target.value)}>
            {SEVA_TYPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Preferred Date
          <input
            type="date"
            value={form.preferred_date}
            onChange={(e) => updateField('preferred_date', e.target.value)}
            required
          />
        </label>

        <label>
          Address
          <textarea
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            required
          />
        </label>

        <label>
          Notes (optional)
          <textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Request Booking'}
        </button>

        {message && (
          <p className={message.type === 'error' ? 'error-text' : 'success-text'}>{message.text}</p>
        )}
      </form>
    </div>
  );
}
