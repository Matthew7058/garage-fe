import React, { useState, useEffect } from 'react';
import DateSelection from '../components/DateSelection';
import BranchSelection from '../components/BranchSelection';
import ServiceSelection from '../components/ServiceSelection';
import ReviewStep from '../components/ReviewStep';
import ConfirmationStep from '../components/ConfirmationStep';

// Progress bar configuration
const progressSteps = [
  { label: 'Location' },
  { label: 'Service' },
  { label: 'Date' },
  { label: 'Time' },
  { label: 'Review' }
];

const progressBarStyles = {
  width: '60%',
  margin: '40px auto 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  listStyle: 'none',
  marginBottom: '2rem',
  padding: 0
};

const baseCircleStyles = {
  display: 'block',
  margin: '0 auto 0.5rem',
  width: '2rem',
  height: '2rem',
  borderRadius: '50%',
  lineHeight: '2rem',
  border: '2px solid #ccc'
};

const completedCircleStyles = {
  ...baseCircleStyles,
  backgroundColor: '#0c2e6e',
  borderColor: '#0c2e6e',
  color: '#fff'
};

const currentCircleStyles = {
  ...baseCircleStyles,
  borderColor: '#0c2e6e',
  color: '#0c2e6e'
};

function Booking({user}) {
  // Wizard steps: 1=Branch selection, 2=Service, 3=Date, 4=Time, 5=Details
  const [step, setStep] = useState(1);
  // Form error state for details validation
  const [formError, setFormError] = useState('');

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
    email: '',
    phone: ''
  });

  const [message, setMessage] = useState('');
  // Vehicle registration & comments
  const [registration, setRegistration] = useState('');
  const [comments, setComments] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [isVehicleValid, setIsVehicleValid] = useState(false);
  const [vesError, setVesError] = useState('');

  const [bookingInfo, setBookingInfo] = useState(null);

  function handleFindVehicle() {
    setVesError('');
    setVehicleDetails(null);
    setIsVehicleValid(false);
    // Use DVLA VES API to validate registration
    const vrn = registration.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    fetch('/api/validate-vehicle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ registrationNumber: vrn })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setVehicleDetails(data);
        setIsVehicleValid(true);
      })
      .catch(() => {
        setVesError('Vehicle not found. Please check your registration or call the garage.');
      });
  }

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
    const iso = formatDateLocal(dateObj);
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
    const length = selectedBookingType.length || 1;
    const totalAvail = closeHour - openHour;
    if (length > totalAvail) {
      setMessage('Selected service extends beyond closing time; your car will need to be left overnight.');
      setAvailableTimes([]);
      return;
    }
    let slots = [];
    for (let h = openHour; h <= closeHour - length; h++) {
      slots.push(`${String(h).padStart(2,'0')}:00:00`);
    }

    // filter out past slots if booking for today
    const todayStr = formatDateLocal(new Date());
    if (date === todayStr) {
      const now = new Date();
      slots = slots.filter(s => {
        const [hour, minute] = s.split(':').map(Number);
        const slotDate = new Date();
        slotDate.setHours(hour, minute, 0, 0);
        return slotDate > now;
      });
    }

    // remove already-booked slots with capacity logic
    fetch(`https://garage-w5eq.onrender.com/api/bookings/branch/${selectedBranch.id}/date/${date}`)
      .then(res => res.json())
      .then(({ bookings }) => {
        // count existing 1-hour bookings per slot
        const bookedCounts = {};
        bookings.forEach(b => {
          const type = bookingTypes.find(t => t.id === b.booking_type_id);
          if (type && type.length === 1) {
            bookedCounts[b.booking_time] = (bookedCounts[b.booking_time] || 0) + 1;
          }
        });
        const available = slots.filter(s => {
          // apply capacity only for 1-hour bookings
          if (length === 1) {
            return (bookedCounts[s] || 0) < hoursForDay.capacity_per_hour;
          }
          return true;
        });
        setAvailableTimes(available);
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
        status: 'confirmed',
        vehicle: registration,
        comments,
      })
    })
    .then(r => {
      if (!r.ok) return r.json().then(e => Promise.reject(e.msg));
      return r.json();
    });
  }

  // Final confirmation
  const handleConfirm = e => {
    e.preventDefault();
    // Validate required details for anonymous users
    if (!user?.id) {
      const { firstName, lastName, email, phone } = userDetails;
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
        setFormError('Please fill out all required fields.');
        return;
      }
      // New: validate email format
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        setFormError('Please enter a valid email address.');
        return;
      }
      setFormError('');
    }
    // require vehicle lookup for anonymous users
    if (!(user && user.id) && !isVehicleValid) {
      alert('Please click "Find Vehicle" to validate your registration before confirming your booking.');
      return;
    }

    if (user && user.id) {
      // Logged‐in: just book
      createBooking(user.id)
      .then(({ booking }) => {
        // stash everything we want to show in the confirmation
        setBookingInfo({
          bookingId: booking.id,
          userDetails,
          selectedBranch,
          selectedBookingType,
          selectedDate,
          selectedTime,
          comments,
          vehicleDetails
        });
        setStep(6);
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
          phone:      userDetails.phone,
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
        // stash everything like in logged‑in branch
        setBookingInfo({
          bookingId: booking.id,
          userDetails,
          selectedBranch,
          selectedBookingType,
          selectedDate,
          selectedTime,
          comments,
          vehicleDetails
        });
        setStep(6);
      })
      .catch(msg => setMessage(msg));
    }
  };

  function reset() {
    setStep(branches.length > 1 ? 1 : 2);
    setSelectedBookingType(null);
    setSelectedDate('');
    setSelectedTime('');
    setUserDetails({ firstName:'', lastName:'', email:'', phone:'' });
    setRegistration('');
    setComments('');
    setVehicleDetails(null);
    setIsVehicleValid(false);
    setVesError('');
  }


  return (
    <div className="container">
      <h2 className='section-title'>MAKE A BOOKING</h2>

      <ul style={progressBarStyles}>
        {progressSteps.map((stepItem, idx) => {
          const stepNum = idx + 1;
          let circleStyle = baseCircleStyles;
          let textColor = '#ccc';
          if (stepNum < step) {
            circleStyle = completedCircleStyles;
            textColor = '#0c2e6e';
          } else if (stepNum === step) {
            circleStyle = currentCircleStyles;
            textColor = '#0c2e6e';
          }
          return (
            <li
              key={stepNum}
              onClick={() => {
                if (stepNum < step) {
                  setStep(stepNum);
                }
              }}
              style={{
                flex: 1,
                textAlign: 'center',
                color: textColor,
                cursor: stepNum < step ? 'pointer' : 'default'
              }}
            >
              <span style={circleStyle}>
                {stepNum < step ? '✓' : stepNum}
              </span>
              <span style={{ display: 'block' }}>{stepItem.label}</span>
            </li>
          );
        })}
      </ul>

      {/* Step 1: Branch selection (only if more than one) */}
      {step === 1 && branches.length > 1 && (
        <div>
          <h3 className='section-subtitle'>SELECT YOUR LOCATION</h3>
          <BranchSelection
            branches={branches}
            onBranchSelect={handleBranchSelect}
            mapKey="HIDDEN"
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
        <ReviewStep
          user={user}
          formError={formError}
          userDetails={userDetails}
          setUserDetails={setUserDetails}
          registration={registration}
          setRegistration={setRegistration}
          isVehicleValid={isVehicleValid}
          vehicleDetails={vehicleDetails}
          setVehicleDetails={setVehicleDetails}
          setIsVehicleValid={setIsVehicleValid}
          setVesError={setVesError}
          vesError={vesError}
          comments={comments}
          setComments={setComments}
          handleFindVehicle={handleFindVehicle}
          handleConfirm={handleConfirm}
          selectedBranch={selectedBranch}
          selectedBookingType={selectedBookingType}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          formatDisplayDate={formatDisplayDate}
        />
      )}

      {step === 6 && bookingInfo && (
        <ConfirmationStep
          {...bookingInfo}
          reset={reset}
        />
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default Booking;