import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://garage-w5eq.onrender.com/api';

function Auth({ setUser }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isSignup ? '/auth/signup' : '/auth/login';
    // Build payload
    const payload = isSignup
      ? {
          garage_id: 1,             // or choose dynamically
          first_name: form.firstName,
          last_name:  form.lastName,
          email:      form.email,
          password:   form.password,
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
            <label htmlFor="password" className="auth-label">
              Password:
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </label>
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
  );
}

export default Auth;