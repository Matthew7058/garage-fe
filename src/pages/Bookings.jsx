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
  const [bookingTypes, setBookingTypes] = useState([]);
  const [events, setEvents] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // inline styles for modal
  const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000
  };
  const modalStyle = {
    backgroundColor: '#fff', padding: '20px', borderRadius: '8px',
    maxWidth: '500px', width: '90%', boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
  };

  // at top of file, make a small helper
  function addHours(dateString, hours) {
    const d = new Date(dateString);
    d.setHours(d.getHours() + hours);
    return d.toISOString();
  }

  // combine a date string and time string into a Date object
  function combineDateTime(dateString, timeString) {
    const date = new Date(dateString);
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    date.setHours(hours, minutes, seconds || 0);
    return date;
  }

  // fetch and reload bookings for the selected branch
  function loadBookings() {
    if (!selectedBranch) return;
    fetch(`https://garage-w5eq.onrender.com/api/bookings/branch/${selectedBranch}`)
      .then(res => res.json())
      .then(({ bookings }) => setBookings(bookings))
      .catch(err => setMessage('Failed to load bookings'));
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
    loadBookings();
  }, [selectedBranch]);

  useEffect(() => {
    fetch('https://garage-w5eq.onrender.com/api/booking-types')
      .then(res => res.json())
      .then(({ bookingTypes }) => setBookingTypes(bookingTypes))
      .catch(err => setMessage('Failed to load booking types'));
  }, []);

  useEffect(() => {
    if (!bookings.length) return;
    Promise.all(bookings.map(b => {
      return fetch(`https://garage-w5eq.onrender.com/api/booking-types/${b.booking_type_id}`)
        .then(res => res.json())
        .then(typeData => {
          // now fetch user details for this booking
          return fetch(`https://garage-w5eq.onrender.com/api/users/${b.user_id}`)
            .then(res => res.json())
            .then(userData => {
              const start = combineDateTime(b.booking_date, b.booking_time);
              const end = new Date(start.getTime() + 60 * 60 * 1000);
              return {
                id: b.id,
                title: `${typeData.booking_type.name} (${b.status})`,
                start,
                end,
                allDay: false,
                backgroundColor: b.status === 'Cancelled' ? '#ccc' : '#378006',
                textColor: '#000',
                extendedProps: {
                  firstName: userData.user.first_name,
                  lastName:  userData.user.last_name,
                  email:     userData.user.email,
                  phone:     userData.user.phone,
                }
              };
            });
        });
    }))
    .then(evts => {
      setEvents(evts);
    })
    .catch(err => setMessage('Failed to load event types'));
  }, [bookings]);

  // handle clicks on calendar events: open modal for cancel/reschedule
  function handleEventClick({ event }) {
    setSelectedEvent(event);
    setNewDate(event.startStr.split('T')[0]);
    const h = event.start.getHours().toString().padStart(2, '0');
    const m = event.start.getMinutes().toString().padStart(2, '0');
    setNewTime(`${h}:${m}`);
    setRescheduling(false);
    setModalOpen(true);
  }

  function handleCancel() {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      fetch(`https://garage-w5eq.onrender.com/api/bookings/${selectedEvent.id}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error();
          setMessage('Booking cancelled');
          loadBookings();
        })
        .catch(() => setMessage('Failed to cancel booking'))
        .finally(() => setModalOpen(false));
    }
  }

  function handleSaveReschedule() {
    fetch(`https://garage-w5eq.onrender.com/api/bookings/${selectedEvent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_date: newDate, booking_time: `${newTime}:00` })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        setMessage('Booking rescheduled');
        loadBookings();
      })
      .catch(() => setMessage('Failed to reschedule booking'))
      .finally(() => setModalOpen(false));
  }

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
        eventClick={handleEventClick}
      />

      {modalOpen && selectedEvent && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Booking Details</h3>
            <p><strong>Type:</strong> {selectedEvent.title}</p>
            <p><strong>User:</strong> {selectedEvent.extendedProps.firstName} {selectedEvent.extendedProps.lastName}</p>
            <p><strong>Email:</strong> {selectedEvent.extendedProps.email}</p>
            <p><strong>Phone:</strong> {selectedEvent.extendedProps.phone}</p>
            {!rescheduling ? (
              <>
                <button onClick={handleCancel}>Cancel Booking</button>
                <button onClick={() => setRescheduling(true)}>Reschedule Booking</button>
                <button onClick={() => setModalOpen(false)}>Close</button>
              </>
            ) : (
              <>
                <label>
                  New Date:
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
                </label>
                <label>
                  New Time:
                  <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} step="60" />
                </label>
                <button onClick={handleSaveReschedule}>Save</button>
                <button onClick={() => setRescheduling(false)}>Cancel</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
