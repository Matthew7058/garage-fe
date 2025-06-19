import React, { useState, useEffect, useRef } from 'react';
import garageLogo from '../assets/bakestone-half.png'
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faCaretDown } from '@fortawesome/free-solid-svg-icons';

function NavBar({ user, setUser }) {

  const navigate = useNavigate();

  const handleLogout = () => {
    // 1) clear user state
    setUser(null);
    // 2) clear tokens if you have them
    // localStorage.removeItem('authToken');
    // 3) redirect home or to login
    navigate('/');
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Ref to detect clicks outside of dropdown
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your profile?')) return;
    try {
      const response = await fetch(`https://garage-w5eq.onrender.com/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'temporary',
          password_hash: '',
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }
      // Successfully updated role and cleared password
      handleLogout();
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('An error occurred while deleting your profile. Please try again later.');
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
        <div class="top-bar">
            <div class="top-bar-content">
                
            </div>
        </div>
        <nav>
        <ul>
            <img src={garageLogo} alt="Logo" className="logo" />
            <li class="firstNav"><Link to="/">HOME</Link></li>
            <li><Link to="/book">MAKE A BOOKING</Link></li>
            {user && user.role === 'admin' ? (
              <li><Link to="/bookings">VIEW BOOKINGS</Link></li>
            ) : (
              <li><Link to="/contact">CONTACT US</Link></li>
            )}
            {user ? (
            <li>
              <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    color: '#009cdf',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    font: 'inherit',
                  }}
                >
                  LOGOUT
                </button>
                {user.role !== 'admin' && (
                  <>
                    <button
                      onClick={toggleDropdown}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        marginLeft: '0.25rem',
                        font: 'inherit',
                      }}
                    >
                      <FontAwesomeIcon icon={faCaretDown} style={{marginLeft: '10px', color: 'black'}} />
                    </button>
                    {dropdownOpen && (
                      <ul style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: '#fff',
                        listStyle: 'none',
                        padding: '0.5rem',
                        margin: 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 1000
                      }}>
                        <li>
                          <button
                            onClick={handleDeleteProfile}
                            className="delete-profile-btn"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#333',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '10pt',
                              font: 'inherit'
                            }}
                          >
                            Delete Profile
                          </button>
                        </li>
                      </ul>
                    )}
                  </>
                )}
              </div>
            </li>
            ) : (
            <li><Link to="/login">LOGIN</Link></li>
            )}
        </ul>
        </nav>
    </div>
  );
}

export default NavBar;