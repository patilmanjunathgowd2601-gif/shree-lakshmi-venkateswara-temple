import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <p className="hero-om">ॐ</p>
          <h1>Sri Lakshmi Venkateswara Temple</h1>
          <p className="hero-sub">|| Govinda Govinda ||</p>
          <div className="hero-actions">
            <Link to="/donate" className="btn btn-primary">
              Donate / Seva
            </Link>
            <Link to="/events" className="btn btn-outline">
              View Events
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Temple Timings</h2>
        <div className="card-grid">
          <div className="card">
            <h3>Daily</h3>
            <p>7:00 AM &ndash; 11:30 AM</p>
            <p>5:30 PM &ndash; 8:00 PM</p>
          </div>
          <div className="card">
            <h3>Saturday</h3>
            <p>6:00 AM &ndash; 12:30 PM</p>
            <p>5:30 PM &ndash; 9:00 PM</p>
          </div>
          <div className="card">
            <h3>Special Poojas</h3>
            <p>Sudarshana Narasimha Homam &ndash; every Amavasya</p>
          </div>
        </div>
      </section>

      <section className="section alt">
        <h2>Welcome</h2>
        <p>
          Sri Lakshmi Venkateswara Temple is a place of daily worship, community
          seva, and festival celebrations dedicated to Lord Venkateswara and
          Goddess Lakshmi. Devotees are welcome to visit for darshan, participate
          in poojas, and support the temple&apos;s activities through seva and
          donations.
        </p>
      </section>
    </div>
  );
}
