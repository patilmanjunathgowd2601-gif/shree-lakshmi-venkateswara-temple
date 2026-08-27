import { useState } from 'react';
import api from '../api';

const PRESET_AMOUNTS = [101, 501, 1001, 5001];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Donate() {
  const [form, setForm] = useState({
    donorName: '',
    email: '',
    phone: '',
    amount: 501,
    purpose: 'general',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!form.donorName || !form.amount || Number(form.amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter your name and a valid amount.' });
      return;
    }

    setSubmitting(true);
    try {
      const { data: order } = await api.post('/donations/order', form);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setMessage({ type: 'error', text: 'Could not load the payment gateway. Check your connection.' });
        setSubmitting(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Sri Lakshmi Venkateswara Temple',
        description: `Donation - ${form.purpose}`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await api.post('/donations/verify', response);
            setMessage({ type: 'success', text: 'Thank you! Your donation was received successfully.' });
          } catch {
            setMessage({
              type: 'error',
              text: 'Payment was processed but verification failed. Please contact the temple office with your payment ID.',
            });
          }
        },
        prefill: {
          name: form.donorName,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#7a1f1f' },
      });

      razorpay.on('payment.failed', () => {
        setMessage({ type: 'error', text: 'Payment failed or was cancelled. Please try again.' });
      });

      razorpay.open();
    } catch (err) {
      const text =
        err.response?.data?.message ||
        'Online donations are not configured yet. Please contact the temple office directly.';
      setMessage({ type: 'error', text });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section">
      <h1>Donate / Seva</h1>
      <p>
        Your contribution supports daily poojas, temple maintenance, Annadanam,
        and festival celebrations. Thank you for your generosity.
      </p>

      <form className="donate-form" onSubmit={handleSubmit}>
        <label>
          Full Name
          <input
            type="text"
            value={form.donorName}
            onChange={(e) => updateField('donorName', e.target.value)}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </label>

        <label>
          Phone
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </label>

        <label>
          Purpose
          <select value={form.purpose} onChange={(e) => updateField('purpose', e.target.value)}>
            <option value="general">General Donation</option>
            <option value="annadanam">Annadanam Seva</option>
            <option value="construction">Temple Construction</option>
            <option value="seva">Special Seva</option>
            <option value="festival">Festival Sponsorship</option>
          </select>
        </label>

        <label>
          Amount (INR)
          <input
            type="number"
            min="1"
            value={form.amount}
            onChange={(e) => updateField('amount', e.target.value)}
            required
          />
        </label>

        <div className="preset-amounts">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              type="button"
              key={amt}
              className={`chip ${Number(form.amount) === amt ? 'chip-active' : ''}`}
              onClick={() => updateField('amount', amt)}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Processing…' : `Donate ₹${form.amount || 0}`}
        </button>

        {message && (
          <p className={message.type === 'error' ? 'error-text' : 'success-text'}>{message.text}</p>
        )}
      </form>
    </div>
  );
}
