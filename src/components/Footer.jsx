import React from 'react';

function Footer() {
  return (
    <footer style={{
      backgroundColor: '#001169',
      color: '#fff',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>© Bakestone Motors</h4>
          <p>
            Website Created by:<br/>
            <a
              href="https://www.linkedin.com/in/matthew-fard-772393200"
              style={{ color: 'rgba(76, 144, 205, 1)' }}
            >
              Matthew Fard
            </a>
          </p>
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '1.8' }}>
            <li><a href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</a></li>
            {['Book', 'Contact', 'Login'].map(text => (
              <li key={text}>
                <a href={`/${text.toLowerCase()}`} style={{ color: '#fff', textDecoration: 'none' }}>
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>Follow Us</h4>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="#" aria-label="Facebook" style={{ color: '#fff', fontSize: '1.5rem' }}>👍</a>
            <a href="#" aria-label="Twitter" style={{ color: '#fff', fontSize: '1.5rem' }}>🐦</a>
            <a href="#" aria-label="Instagram" style={{ color: '#fff', fontSize: '1.5rem' }}>📸</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;