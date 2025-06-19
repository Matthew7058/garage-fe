import React from 'react';

export default function ConfirmationStep({
  userDetails,
  selectedBranch,
  selectedBookingType,
  selectedDate,
  selectedTime,
  comments,
  vehicleDetails,
  bookingId,
  reset
}) {

  // Build an embed‐map URL from the branch’s address (you can tweak to use lat/lng if you have it)
  const mapSrc = `https://www.google.com/maps?q=${selectedBranch.lat},${selectedBranch.lng}&output=embed`;

  return (
    <div className="confirmation-container">
      <div className="confirmation-header">
        <div className="checkmark">✔︎</div>
        <h2>
          See you soon
          {userDetails.firstName ? `, ${userDetails.firstName}` : ''}!
        </h2>
        <p>A confimation email will be sent.</p>
      </div>

      <div className="confirmation-body">
        <div
          className="confirmation-summary"
          style={{
            padding: '1.5rem'
          }}
        >
          <div className="confirmation-summary-item">
            <span style={{ fontWeight: 600 }}>Booking #</span>
            <span>{bookingId}</span>
          </div>
          <div className="confirmation-summary-item">
            <span style={{ fontWeight: 600 }}>Date</span>
            <span>{selectedDate}</span>
          </div>
          <div className="confirmation-summary-item">
            <span style={{ fontWeight: 600 }}>Time</span>
            <span>{selectedTime.slice(0, 5)}</span>
          </div>
          <div className="confirmation-summary-item">
            <span style={{ fontWeight: 600 }}>Service</span>
            <span>
              {selectedBookingType.name} – £{selectedBookingType.price}
            </span>
          </div>
          <div className="confirmation-summary-item">
            <span style={{ fontWeight: 600 }}>Location</span>
            <span>{selectedBranch.branch_name}</span>
          </div>
          <div className="confirmation-summary-item">
            <span style={{ fontWeight: 600 }}>Name</span>
            <span>
              {userDetails.firstName} {userDetails.lastName}
            </span>
          </div>
          {vehicleDetails && (
            <div className="confirmation-summary-item">
              <span style={{ fontWeight: 600 }}>Vehicle</span>
              <span>
                {vehicleDetails.make} {vehicleDetails.model} ({vehicleDetails.manufactureDate.slice(0, 4)})
              </span>
            </div>
          )}
          {comments && (
            <div className="confirmation-summary-item">
              <span style={{ fontWeight: 600 }}>Comments</span>
              <span>{comments}</span>
            </div>
          )}
        </div>
        <div className="confirmation-map">
          <iframe
            title="Location map"
            src={mapSrc}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
          />
        </div>
      </div>
      <div className="confirmation-actions">
        <a href="/" className="home-button">Return Home</a>
      </div>
    </div>
  );
}