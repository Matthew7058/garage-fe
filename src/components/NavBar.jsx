import React from 'react';
import garageLogo from '../assets/bakestone-half.png'
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

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
            <li><Link to="/bookings">VIEW BOOKINGS</Link></li>
            {user ? (
            <li>
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