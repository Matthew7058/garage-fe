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
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    selectedBranch.address || selectedBranch.name
  )}&output=embed`;

  return (
    <div className="confirmation-container">
      <div className="confirmation-header">
        <div className="checkmark">✔︎</div>
        <h2>
          See you soon
          {userDetails.firstName ? `, ${userDetails.firstName}` : ''}!
        </h2>
        <p>Thanks for booking with us.</p>
      </div>

      <div className="confirmation-body">
        <div className="confirmation-summary">
          <p><strong>Booking #</strong> {bookingId}</p>
          <p><strong>Date:</strong> {selectedDate}</p>
          <p><strong>Time:</strong> {selectedTime.slice(0,5)}</p>
          <p>
            <strong>Service:</strong> {selectedBookingType.name} &ndash; £
            {selectedBookingType.price}
          </p>
          <p><strong>Location:</strong> {selectedBranch.name}</p>
          <p>
            <strong>Name:</strong> {userDetails.firstName}{' '}
            {userDetails.lastName}
          </p>
          {vehicleDetails && (
            <p>
              <strong>Vehicle:</strong> {vehicleDetails.make}{' '}
              {vehicleDetails.model} ({vehicleDetails.yearOfManufacture})
            </p>
          )}
          {comments && (
            <p>
              <strong>Comments:</strong> {comments}
            </p>
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
    </div>
  );
}