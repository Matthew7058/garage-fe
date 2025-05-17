import React, { useState, useEffect } from 'react';
import DateSelection from '../components/DateSelection';
import BranchSelection from '../components/BranchSelection';
import ServiceSelection from '../components/ServiceSelection';

function Booking({user}) {
  // Wizard steps: 1=Branch selection, 2=Service, 3=Date, 4=Time, 5=Details
  const [step, setStep] = useState(1);

  // Data
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [bookingTypes, setBookingTypes] = useState([]);
  const [operatingHours, setOperatingHours] = useState([]);

  // User selections
  const [selectedBookingType, setSelectedBookingType] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');

  // User State
  // Only used when user is NOT logged in
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [message, setMessage] = useState('');

  // 1) Fetch branches on mount
  useEffect(() => {
    fetch('https://garage-w5eq.onrender.com/api/garage-chains/1/branches')
      .then(res => res.json())
      .then(({ branches }) => {
        setBranches(branches);
        // If only one branch, skip straight to services
        if (branches.length === 1) {
          handleBranchSelect(branches[0]);
        }
      })
      .catch(err => console.error('Error fetching branches', err));
  }, []);

  // Branch selection
  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    // load branch-specific data
    fetch(`https://garage-w5eq.onrender.com/api/booking-types/branch/${branch.id}`)
      .then(res => res.json())
      .then(({ booking_types }) => setBookingTypes(booking_types))
      .catch(err => console.error('Error fetching booking types', err));

    fetch(`https://garage-w5eq.onrender.com/api/operating-hours/branch/${branch.id}`)
      .then(res => res.json())
      .then(({ operating_hours }) => setOperatingHours(operating_hours))
      .catch(err => console.error('Error fetching operating hours', err));

    setStep(2);
  };

  // Service selection
  const handleSelectBookingType = (type) => {
    setSelectedBookingType(type);
    setStep(3);
  };

  function formatDateLocal(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  
  // near the top of your Booking component
  const formatDisplayDate = (isoDate) => {
    if (!isoDate) return '';
    // "YYYY-MM-DD" → ["YYYY","MM","DD"] → ["DD","MM","YYYY"] → "DD-MM-YYYY"
    return isoDate.split('-').reverse().join('-');
  };

  // Date selection
  const handleDateSelect = (dateObj) => {
    const iso = dateObj.toISOString().split('T')[0];  // "2025-05-15"
    setSelectedDate(iso);
    fetchAvailableTimes(iso);
    setStep(4);
  };

  // Fetch available time slots for a date
  const fetchAvailableTimes = (date) => {
    const day = new Date(date).getDay();
    const hoursForDay = operatingHours.find(o => o.day_of_week === day);
    if (!hoursForDay) {
      setAvailableTimes([]);
      return;
    }
    // generate hourly slots
    const [openHour] = hoursForDay.open_time.split(':').map(Number);
    const [closeHour] = hoursForDay.close_time.split(':').map(Number);
    const slots = [];
    for (let h = openHour; h < closeHour; h++) {
      slots.push(`${String(h).padStart(2,'0')}:00:00`);
    }

    // remove already-booked slots
    fetch(`https://garage-w5eq.onrender.com/api/bookings/branch/${selectedBranch.id}/date/${date}`)
      .then(res => res.json())
      .then(({ bookings }) => {
        const booked = bookings.map(b => b.booking_time);
        setAvailableTimes(slots.filter(s => !booked.includes(s)));
      })
      .catch(err => {
        console.error('Error fetching bookings', err);
        setAvailableTimes(slots);
      });
  };

  // Time selection
  const handleSelectTime = (time) => {
    setSelectedTime(time);
    setStep(5);
  };

  // Unified booking creation
  // Creates a booking for the given userId
  function createBooking(userId) {
    return fetch(`https://garage-w5eq.onrender.com/api/bookings`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        branch_id: selectedBranch.id,
        user_id:   userId,
        booking_date: selectedDate,
        booking_time: selectedTime,
        booking_type_id: selectedBookingType.id,
        status: 'confirmed'
      })
    })
    .then(r => {
      if (!r.ok) return r.json().then(e => Promise.reject(e.msg));
      return r.json();
    });
  }

  // Final confirmation
  const handleConfirm = e => {
    e && e.preventDefault();

    if (user && user.id) {
      // Logged‐in: just book
      createBooking(user.id)
        .then(({ booking }) => {
          setMessage(`Success! Booking #${booking.id}`);
          reset();
        })
        .catch(msg => setMessage(msg));
    } else {
      // Anonymous: create temp user then book
      fetch(`https://garage-w5eq.onrender.com/api/users`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          garage_id: selectedBranch.garage_id,
          first_name: userDetails.firstName,
          last_name:  userDetails.lastName,
          email:      userDetails.email,
          phone:      '',
          password_hash: '',
          role:       'temporary'
        })
      })
      .then(r => {
        if (!r.ok) return r.json().then(e => Promise.reject(e.msg));
        return r.json();
      })
      .then(({ user: tempUser }) => createBooking(tempUser.id))
      .then(({ booking }) => {
        setMessage(`Success! Booking #${booking.id}`);
        reset();
      })
      .catch(msg => setMessage(msg));
    }
  };

  function reset() {
    setStep(branches.length > 1 ? 1 : 2);
    setSelectedBookingType(null);
    setSelectedDate('');
    setSelectedTime('');
    setUserDetails({ firstName:'', lastName:'', email:'' });
  }


  return (
    <div className="container">
      <h2 className='section-title'>MAKE A BOOKING</h2>

      {/* Step 1: Branch selection (only if more than one) */}
      {step === 1 && branches.length > 1 && (
        <div>
          <h3 className='section-subtitle'>SELECT YOUR LOCATION</h3>
          <BranchSelection
            branches={branches}
            onBranchSelect={handleBranchSelect}
            mapKey="AIzaSyDSiiRWYXgXQhRMcKEfFsX7vQgen8K-QLI"
          />
        </div>
      )}

      {/* Step 2: Service selection */}
      {step === 2 && (
        <div>
          <h3 className='section-subtitle'>Select a Service</h3>
          <ServiceSelection
            bookingTypes={bookingTypes}
            onTypeSelect={handleSelectBookingType}
          />
        </div>
      )}

      

      {/* Steps 3 & 4 combined: date on left, time on right */}
      {(step === 3 || step === 4) && (
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          {/* LEFT COLUMN: date picker */}
          <div style={{ flex: 1 }}>
            <h3 className='section-subtitle' id="date-subtitle">Select a Date</h3>
            <DateSelection
              operatingHours={operatingHours}
              onDateSelect={handleDateSelect}
            />
          </div>

      {/* RIGHT COLUMN: only once date is picked (step 4) */}
          <div style={{ flex: 1 }}>
            {step === 4 ? (
              <>
                <h3 className='section-subtitle' id="date-subtitle">Pick a Time on {formatDisplayDate(selectedDate)}</h3>
                {availableTimes.length > 0 ? (
                  <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: '0.5rem',
                    marginTop: '0.5rem',
                  }}
                >
                    {availableTimes.map(t => (
                        <button key={t} onClick={() => handleSelectTime(t)} style={{
                          padding: '0.75rem 0',
                          fontSize: '0.9rem',
                          border: '1px solid #0c2e6e',
                          borderRadius: '6px',
                          backgroundColor: selectedTime === t ? '#0c2e6e' : '#fff',
                          color: selectedTime === t ? '#fff' : '#0c2e6e',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s, color 0.2s',
                        }}
                        onMouseEnter={e => {
                          if (selectedTime !== t) e.currentTarget.style.backgroundColor = '#f0f8ff';
                        }}
                        onMouseLeave={e => {
                          if (selectedTime !== t) e.currentTarget.style.backgroundColor = '#fff';
                        }}>
                          {t.slice(0,5)}
                        </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ marginTop: '1rem', textAlign: 'center', color: '#666' }}>
                    <p>
                      No available slots.{' '}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ marginTop: '1rem', textAlign: 'center', color: '#666' }}>
                <p style={{ color: '#666' }}>
                  Please pick a date to see available times…
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 5: User details & confirmation */}
      {step===5 && (
        <div  style={{
          maxWidth: '500px',
          margin: '2rem auto',
          padding: '1.5rem',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          backgroundColor: '#fff',
        }}>
          
          <h3 className='section-subtitle'>
            Review & Confirm
          </h3>

          {/* REVIEW SUMMARY */}
          <div style={{ marginBottom: '1.5rem', lineHeight: 1.5 }}>
            <p>
              <strong>Location:</strong> {selectedBranch.branch_name}
            </p>
            <p>
              <strong>Service:</strong> {selectedBookingType.name} — £{selectedBookingType.price}
            </p>
            <p>
              <strong>Date:</strong> {formatDisplayDate(selectedDate)}
            </p>
            <p>
              <strong>Time:</strong> {selectedTime.slice(0, 5)}
            </p>
          </div>

          {user && user.id ? (
            <>
              <h3 className='section-subtitle'>Review & Condirm</h3>
              <button onClick={handleConfirm} className='confirm-booking-button'>Confirm Booking</button>
            </>
          ) : (
            <>
              <h3 className='section-subtitle'>Review & Enter Details</h3>
              <form onSubmit={handleConfirm}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1rem',
                }}>
                  <div className='name-input'>
                    <label className='details-form-label'></label>
                      First Name
                      <input
                        required
                        value={userDetails.firstName}
                        onChange={e=>setUserDetails({...userDetails, firstName:e.target.value})}
                        className='details-form-input'
                      />
                  </div>
                  <div className='name-input'>
                    <label className='details-form-label'></label>
                      Last Name
                      <input
                        required
                        value={userDetails.lastName}
                        onChange={e=>setUserDetails({...userDetails, lastName:e.target.value})}
                        className='details-form-input'
                      />
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <label className='details-form-label'></label>
                    Email
                    <input
                      type="email"
                      required
                      value={userDetails.email}
                      onChange={e=>setUserDetails({...userDetails, email:e.target.value})}
                      className='details-form-input'
                    />
                </div>
                <button type="submit" className='confirm-booking-button'>Confirm Booking</button>
              </form>
            </>
          )}
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default Booking;