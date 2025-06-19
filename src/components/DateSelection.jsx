// src/components/DateSelection.jsx
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function DateSelection({ onDateSelect, operatingHours }) {
  const [selectedDate, setSelectedDate] = useState(null);
  // List of UK bank holiday dates in 'YYYY-MM-DD' format
  const [bankHolidays, setBankHolidays] = useState([]);

  useEffect(() => {
    fetch('https://www.gov.uk/bank-holidays.json')
      .then((res) => res.json())
      .then((data) => {
        const events = data['england-and-wales'].events;
        const dates = events.map((e) => e.date); // e.date is 'YYYY-MM-DD'
        setBankHolidays(dates);
      })
      .catch((err) => console.error('Failed to load bank holidays', err));
  }, []);

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

    // Disallow Christmas Day (December 25)
    if (date.getMonth() === 11 && date.getDate() === 25) {
      return false;
    }

    // Disallow UK bank holidays
    // Compute local date string to match bank holiday API format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    if (bankHolidays.includes(dateStr)) {
      return false;
    }

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