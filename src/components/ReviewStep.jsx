import React from 'react';

export default function ReviewStep({
  user,
  formError,
  userDetails,
  setUserDetails,
  registration,
  setRegistration,
  vehicleDetails,
  setVehicleDetails,
  isVehicleValid,
  setIsVehicleValid,
  vesError,
  setVesError,
  comments,
  setComments,
  handleFindVehicle,
  handleConfirm,
  selectedBranch,
  selectedBookingType,
  selectedDate,
  selectedTime,
  formatDisplayDate
}) {
  return (
    <div className="review-container">
      <div className="review-details">
        {!user?.id ? (
          <>
            <h3 className="section-subtitle-summary">Fill out your details</h3>
            {formError && <p className="error" style={{ marginBottom: '1rem' }}>{formError}</p>}
            <form onSubmit={handleConfirm}>
              {/* First & Last Name */}
              <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
              }}>
                <div className="name-input">
                  <label className="details-form-label">First Name*</label>
                  <input
                    required
                    placeholder="e.g. John"
                    autoComplete="given-name"
                    className="details-form-input"
                    style={{
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    value={userDetails.firstName}
                    onChange={e=>setUserDetails({...userDetails, firstName:e.target.value})}
                  />
                </div>
                <div className="name-input">
                  <label className="details-form-label">Last Name*</label>
                  <input
                    required
                    placeholder="e.g. Smith"
                    autoComplete="family-name"
                    className="details-form-input"
                    style={{
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    value={userDetails.lastName}
                    onChange={e=>setUserDetails({...userDetails, lastName:e.target.value})}
                  />
                </div>
              </div>
              {/* Email */}
              <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
              }}>
                <div className='name-input'>
                    <label className="details-form-label">Email*</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="details-form-input"
                      value={userDetails.email}
                      onChange={e=>setUserDetails({...userDetails, email:e.target.value})}
                    />
                </div>
                <div className='name-input'>
                <label className="details-form-label">Phone Number*</label>
                <input
                  type="tel"
                  required
                  placeholder="01234 567890"
                  autoComplete="tel"
                  className="details-form-input"
                  style={{
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  value={userDetails.phone}
                  onChange={e=>setUserDetails({...userDetails, phone: e.target.value})}
                />
              </div>
            </div>
              {/* Registration + Vehicle Lookup */}
              <label className="details-form-label">Registration*</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                gap: '1rem',
                alignItems: 'start'
              }}>
                <div>
                  <div style={{ alignItems: 'center', marginTop: '0.5rem' }}>
                    <div style={{ position: 'relative', width: '165px' }}>
                      <input
                        className="registration-ui"
                        id="reg"
                        type="text"
                        placeholder="AB12 CDE"
                        value={registration}
                        onChange={e => {
                          setRegistration(e.target.value);
                          setVesError('');
                          setVehicleDetails(null);
                          setIsVehicleValid(false);
                        }}
                        style={{
                          width: '100%',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                          transition: 'border-color 0.2s, box-shadow 0.2s'
                        }}
                        autoComplete="off"
                      />
                      <span className="unit">UK</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleFindVehicle}
                      disabled={!registration.trim()}
                      style={{
                        padding: '0.5rem 1.25rem',
                        opacity: !registration.trim() ? 0.6 : 1,
                        cursor: !registration.trim() ? 'not-allowed' : 'pointer',
                        transition: 'opacity 0.2s'
                      }}
                    >
                      Find Vehicle
                    </button>
                  </div>
                </div>
                <div style={{ marginLeft: '0.75rem' }}>
                  {vehicleDetails && (
                    <div>
                        <img
                        src={`https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/refs/heads/master/logos/optimized/${vehicleDetails.make.toLowerCase().replace(/\s+/g, '-')}.png`}
                        alt={`${vehicleDetails.make} logo`}
                        className="car-logo"
                      />
                      <p><strong>Make:</strong> {vehicleDetails.make}</p>
                      <p><strong>Model:</strong> {vehicleDetails.model}</p>
                      <p><strong>Year:</strong> {vehicleDetails.yearOfManufacture}</p>
                      
                    </div>
                  )}
                  {vesError && <p className="error">{vesError}</p>}
                </div>
                <div>
                    
                </div>
              </div>
              
              {/* Comments */}
              <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <label className="details-form-label">Comments</label>
                <textarea
                  className="details-form-input"
                  placeholder="Any additional info?"
                  style={{
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                />
              </div>
            </form>
          </>
        ) : (
          <p>Everything looks good—click “Confirm Booking” on the right to finish.</p>
        )}
      </div>
      <aside className="booking-summary" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h3 className="section-subtitle-summary">Booking Summary</h3>
        <div className="summary-details">
          <p><strong>Location:</strong> {selectedBranch.branch_name}</p>
          <p><strong>Service:</strong> {selectedBookingType.name} — £{selectedBookingType.price}</p>
          <p><strong>Date:</strong> {formatDisplayDate(selectedDate)}</p>
          <p style={{borderBottom: '1px solid #111', paddingBottom: '40px', marginBottom: '130px'}}><strong>Time:</strong> {selectedTime.slice(0, 5)}</p>
        </div>
        <div className="summary-footer">
          <p className="note"><strong>Please note:</strong> After making a booking, a member of the All Trans Autos team may contact you to change this appointment. We will endeavour to keep your original request, however, at times this may not be possible. Thank you for your understanding.</p>
          <button onClick={handleConfirm} className="confirm-booking-button">
            Confirm Booking
          </button>
        </div>
      </aside>
    </div>
  )}