import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function BookingsAdmin({ user }) {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  // at top of file, make a small helper
  function addHours(dateString, hours) {
    const d = new Date(dateString);
    d.setHours(d.getHours() + hours);
    return d.toISOString();
  }

  // Fetch branches for this user's garage chain
  useEffect(() => {
    fetch(`https://garage-w5eq.onrender.com/api/garage-chains/1/branches`)
      .then(res => res.json())
      .then(({ branches }) => {
        setBranches(branches);
        if (branches.length) setSelectedBranch(branches[0].id);
      })
      .catch(err => setMessage('Failed to load branches'));
  }, []);

  // Fetch bookings when selectedBranch changes
  useEffect(() => {
    if (!selectedBranch) return;
    fetch(`https://garage-w5eq.onrender.com/api/bookings/branch/${selectedBranch}`)
      .then(res => res.json())
      .then(({ bookings }) => {
        setBookings(bookings);
      })
      .catch(err => setMessage('Failed to load bookings'));
  }, [selectedBranch]);

  // Map bookings to FullCalendar events
  const events = bookings.map(b => {
    const startDate = new Date(b.booking_date);
    // give it an hour of duration
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1h

    return {
      id: b.id,
      // use the booking type name, not the numeric id
      title: `${b.booking_type_id} (${b.status})`,
      start: startDate,
      end: endDate,
      allDay: false,
    };
  });

  console.log(events);

  return (
    <div className="bookings-admin-container">
      <h2 className="admin-heading">Manage Bookings</h2>
      {message && <p className="admin-message">{message}</p>}

      <div className="branch-toggle">
        <label htmlFor="branchSelect">Branch:</label>
        <select
          id="branchSelect"
          value={selectedBranch || ''}
          onChange={e => setSelectedBranch(e.target.value)}
        >
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.branch_name}</option>
          ))}
        </select>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        events={events}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        height="auto"
        selectable={true}
        eventClick={({ event }) => {
          alert(`Booking ID: ${event.id}\nType: ${event.title}`);
        }}
      />
    </div>
  );
}
