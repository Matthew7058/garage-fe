import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const API_BASE = 'https://garage-w5eq.onrender.com/api';

function Auth({ setUser }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(form.email)) {
      setMessage('Please enter a valid email address');
      return;
    }
    const url = isSignup ? '/auth/signup' : '/auth/login';
    // Build payload
    const payload = isSignup
      ? {
          garage_id: 1,             // or choose dynamically
          first_name: form.firstName,
          last_name:  form.lastName,
          email:      form.email,
          password:   form.password,
          phone:      form.phone,
        }
      : {
          email:    form.email,
          password: form.password,
        };

    fetch(API_BASE + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((e) => Promise.reject(e.msg));
        return res.json();
      })
      .then(({ user }) => {
        setUser(user);
        navigate('/'); 
      })
      .catch((errMsg) => setMessage(errMsg || 'Something went wrong'));
  };

  return (
    <div>
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="section-subtitle">{isSignup ? 'SIGN UP' : 'LOGIN'}</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            {isSignup && (
              <>
                <div className="form-group">
                  <label htmlFor="firstName" className="auth-label">First Name: </label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      className="auth-input"
                      />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="auth-label">Last Name:</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      className="auth-input"
                    />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="phone" className="auth-label">Phone Number:</label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  />
                </div>
              </>
            )}
            <div className="form-group full-width">
              <label htmlFor="email" className="auth-label">Email:</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
            </div>
            <div className="form-group full-width">
              <label htmlFor="password" className="auth-label">Password:</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="auth-input"
                  style={{ width: '95.5%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: '#666666',
                  }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94L6.06 6.06"/>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="auth-submit">
              {isSignup ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          <p className="auth-toggle-text">
            {isSignup
              ? 'Already have an account? '
              : "Don't have an account? "}
            <button
              onClick={() => {
                setMessage('');
                setIsSignup(!isSignup);
              }}
              className="auth-toggle-button"
            >
              {isSignup ? 'Log In' : 'Sign Up'}
            </button>
          </p>

          {message && <p className="auth-error">{message}</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Auth;