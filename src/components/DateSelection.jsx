// src/components/DateSelection.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function DateSelection({ onDateSelect, operatingHours }) {
  const [selectedDate, setSelectedDate] = useState(null);

  // Filter dates: disable past dates and dates when the garage is closed.
  // Here, operatingHours is an array of objects with a day_of_week property (0 = Sunday, 1 = Monday, …, 6 = Saturday).

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Pass the Date object to the parent's handler.
    onDateSelect(date);
  };

  const filterDate = (date) => {
    // Disallow past dates.
    const today = new Date();
    if (date < today.setHours(0, 0, 0, 0)) return false;

    // Allow only dates when the garage is open.
    const dayOfWeek = date.getDay();
    const isOpen = operatingHours.some((oh) => oh.day_of_week === dayOfWeek);
    return isOpen;
  };

  return (
    <div style={{ width: '390px', margin: 'auto' }}>
      <DatePicker
        inline                      // <-- always show the calendar
        selected={selectedDate}
        onChange={handleDateChange}
        filterDate={filterDate}
        dateFormat="dd-MM-yyyy"
        minDate={new Date()}
        shouldCloseOnSelect={false}
        calendarClassName="select-date-calendar"
      />
    </div>
  );
}

export default DateSelection;