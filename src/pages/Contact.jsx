import React, { useEffect, useState, useRef } from 'react';
import Footer from '../components/Footer';
import '../styles/Contact.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Contact = () => {
  const [branches, setBranches] = useState([]);
  const [branchHours, setBranchHours] = useState({});

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    subscribe: true,
  });

  const mapKey="HIDDEN"

  // Reference for the map container
  const mapRef = useRef(null);

  // Manually initialize Google Map with two markers
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;
      const locations = [
        { lat: 53.3891222, lng: -2.1365741 },
        { lat: 53.3385734, lng: -2.1297938 }
      ];
      const center = {
        lat: (locations[0].lat + locations[1].lat) / 2,
        lng: (locations[0].lng + locations[1].lng) / 2
      };
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
      });
      locations.forEach(pos => {
        new window.google.maps.Marker({ position: pos, map });
      });
    };

    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapKey}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  // Fetch branches and operating hours
  useEffect(() => {
    fetch('https://garage-w5eq.onrender.com/api/garage-chains/1/branches')
      .then(res => res.json())
      .then(({ branches }) => {
        setBranches(branches);
        branches.forEach(branch => {
          fetch(`https://garage-w5eq.onrender.com/api/operating-hours/branch/${branch.id}`)
            .then(r => r.json())
            .then(({ operating_hours }) => {
              setBranchHours(prev => ({ ...prev, [branch.id]: operating_hours }));
            });
        });
      })
      .catch(err => console.error('Error fetching branches:', err));
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Replace with real API endpoint or email service
    console.log('Contact form submitted:', form);
    alert('Thank you for your message! We will be in touch shortly.');
    setForm({ firstName: '', lastName: '', email: '', phone: '', message: '', subscribe: true });
  };

  return (
    <div className="contact-page">
      {/* Top section: form & details side by side */}
      <section className="contact-section">
        <div className="contact-container">

          {/* Left: Contact Form */}
          <div className="contact-form-area">
            <h2 className="contact-title">
              <span className="text-green">WRITE US</span>{' '}
              <span className="text-blue">A MESSAGE</span>
            </h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="phone">Tel. *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="message">Enquiry *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group newsletter-signup">
                <label>
                  <input
                    type="checkbox"
                    name="subscribe"
                    checked={form.subscribe}
                    onChange={handleChange}
                  />{' '}
                  Newsletter Sign Up?
                </label>
              </div>

              <button type="submit" className="submit-button2">
                SUBMIT
              </button>
            </form>
          </div>

          {/* Right: Booking & Branch Details */}
          <div className="contact-info-area">
            <h2 className="info-title">GARAGE DETAILS</h2>

            <div className="branches-list">
              {branches.map(branch => (
                <div key={branch.id} className="branch-card">
                  <h3 className="branch-name">{branch.branch_name}</h3>
                  <p className="branch-address">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="detail-icon" />
                    <a href={`https://www.google.com/maps?q=${encodeURIComponent("Bakestone motors" + branch.branch_name)}`}>
                    {branch.address.split('\n').map((line, idx) => (
                      <span key={idx}>{line}<br/></span>
                    ))}
                    </a>
                  </p>
                  {branch.phone && (
                    <p>
                      <FontAwesomeIcon icon={faPhone} className="detail-icon" />
                        {branch.phone}
                    </p>
                  )}
                  {branch.fax && <p>Fax: {branch.fax}</p>}
                  {branch.email && (
                    <p>
                      <FontAwesomeIcon icon={faEnvelope} className="detail-icon" />
                      <a href={`mailto:${branch.email}`}>{branch.email}</a>
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="combined-hours">
              <h4>Opening Hours</h4>
              <table className="hours-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    {branches.map(branch => (
                      <th key={branch.id}>{branch.branch_name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day, idx) => (
                    <tr key={day}>
                      <td>{day}</td>
                      {branches.map(branch => {
                        const hours = (branchHours[branch.id] || []).find(h => h.day_of_week === idx);
                        return (
                          <td key={branch.id}>
                            {hours ? `${hours.open_time.slice(0,5)}–${hours.close_time.slice(0,5)}` : 'Closed'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* Full-width map showing both branches */}
      <section className="map-section">
        <div
          ref={mapRef}
          className="map-container"
          style={{ width: '100%', height: '400px' }}
        />
      </section>

      <Footer />
    </div>
  );
};

export default Contact;