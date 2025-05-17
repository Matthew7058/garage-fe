import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Bookings from './pages/Bookings';
import Login from './pages/Login';

function App() {
  // User state is lifted at the app level and passed down to components.
  const [user, setUser] = useState(null);

  return (
    <div>
      <NavBar user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/book" element={<Booking user={user} />} />
          <Route path="/bookings" element={<Bookings user={user} />} />
        </Routes>
    </div>
  );
}

export default App;