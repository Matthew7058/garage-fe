import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Footer from '../components/Footer';

export default function BookingsAdmin({ user }) {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [bookingTypes, setBookingTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const settingsRef = useRef(null);
  const [settingsPos, setSettingsPos] = useState({ top: 0, left: 0 });
  const calendarContainerRef = useRef(null);
  const calendarApiRef = useRef(null);
  const [popupPos, setPopupPos] = useState(null);
  // Removed arrow state
  const popupRef = useRef(null);
  const [popupVehicleInfo, setPopupVehicleInfo] = useState(null);
  // --- Vehicle popup state and ref ---
  const [showVehiclePopup, setShowVehiclePopup] = useState(false);
  const [vehiclePopupPos, setVehiclePopupPos] = useState(null);
  const vehiclePopupRef = useRef(null);

  // --- Add Booking popup state and ref ---
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [addPopupPos, setAddPopupPos] = useState(null); // { top, left, dateStr }
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    reg: '',
    bookingTypeId: bookingTypes[0]?.id || '',
    time: '09:00',
    comments: ''
  });
  const addPopupRef = useRef(null);
  // --- Calendar width state ---
  const [calendarWidth, setCalendarWidth] = useState('75%');
// Render a "+" icon in each calendar day cell for adding a booking
function renderDayCell(arg) {
  const frame = arg.el.querySelector('.fc-daygrid-day-frame');
  if (!frame) return;
  frame.style.position = 'relative';
  const plus = document.createElement('span');
  plus.innerText = '+';
  plus.title = 'Add Booking';
  plus.classList.add('day-plus-button');
  // ensure the "+" is on top
  plus.style.zIndex = '1000';
  Object.assign(plus.style, {
    position: 'absolute',
    top: '4px',
    left: '4px',
    fontSize: '14px',
    color: '#007bff',
    cursor: 'pointer'
  });
  plus.addEventListener('click', e => {
    e.stopPropagation();
    const cellRect = frame.getBoundingClientRect();
    const containerRect = calendarContainerRef.current.getBoundingClientRect();
    const popupWidth = 375;
    const popupHeight = 410; // approximate popup height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    // horizontal: right if fits, otherwise left
    let calcLeft;
    if (cellRect.right + popupWidth + 10 < viewportWidth) {
      calcLeft = cellRect.right - containerRect.left + 10;
    } else {
      calcLeft = cellRect.left - containerRect.left - popupWidth - 10;
    }
    // vertical: below if fits, otherwise above
    let calcTop;
    if (cellRect.top + popupHeight + 10 < viewportHeight) {
      calcTop = cellRect.top - containerRect.top;
    } else {
      calcTop = cellRect.top - containerRect.top - popupHeight - 10;
    }
    // compute local YYYY-MM-DD without timezone shifts
    const year = arg.date.getFullYear();
    const month = String(arg.date.getMonth() + 1).padStart(2, '0');
    const day = String(arg.date.getDate()).padStart(2, '0');
    setAddPopupPos({
      top: calcTop,
      left: calcLeft,
      dateStr: `${year}-${month}-${day}`
    });
    setAddForm({
      name: '',
      email: '',
      phone: '',
      reg: '',
      bookingTypeId: bookingTypes[0]?.id || '',
      time: '09:00',
      comments: ''
    });
    setShowAddPopup(true);
  });
  frame.prepend(plus);
}
// default the bookingTypeId when the add-popup opens
useEffect(() => {
  if (bookingTypes.length > 0 && showAddPopup) {
    setAddForm(prev => ({
      ...prev,
      bookingTypeId: bookingTypes[0].id.toString()
    }));
  }
}, [bookingTypes, showAddPopup]);

  // Determine min/max time for calendar based on selected branch hours
  const currentBranch = branches.find(b => b.id === selectedBranch) || {};
  const minTime = currentBranch.opening_time || '08:00:00';
  const maxTime = currentBranch.closing_time || '20:00:00';
  useEffect(() => {
    function handlePopupClickOutside(event) {
      if (
        popupPos &&
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        (!vehiclePopupRef.current || !vehiclePopupRef.current.contains(event.target))
      ) {
        setSelectedEvent(null);
        setPopupPos(null);
        setShowVehiclePopup(false);
      }
    }
    document.addEventListener('mousedown', handlePopupClickOutside);
    return () => {
      document.removeEventListener('mousedown', handlePopupClickOutside);
    };
  }, [popupPos]);
  // --- Add Booking popup: click-outside handler ---
  useEffect(() => {
    function handleAddPopupClickOutside(event) {
      if (showAddPopup && addPopupRef.current && !addPopupRef.current.contains(event.target)) {
        setShowAddPopup(false);
      }
    }
    document.addEventListener('mousedown', handleAddPopupClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleAddPopupClickOutside);
    };
  }, [showAddPopup]);
  useEffect(() => {
    function handleClickOutside(event) {
      if (branchDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setBranchDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [branchDropdownOpen]);

  useEffect(() => {
    function handleSettingsClickOutside(event) {
      if (settingsOpen) {
        const dropdownEl = settingsRef.current;
        const clickedOnButton = event.target.closest('.fc-settings-button');
        if (dropdownEl && !dropdownEl.contains(event.target) && !clickedOnButton) {
          setSettingsOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', handleSettingsClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleSettingsClickOutside);
    };
  }, [settingsOpen]);

useEffect(() => {
  if (settingsOpen && calendarContainerRef.current) {
    const btn = document.querySelector('.fc-settings-button');
    const containerRect = calendarContainerRef.current.getBoundingClientRect();
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const left = rect.left - containerRect.left;
      const top = rect.bottom - containerRect.top;
      setSettingsPos({ top, left });
    }
  }
}, [settingsOpen]);


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

  // format "YYYY-MM-DD" → "DD-MM-YYYY"
  function formatDisplayDate(isoDate) {
    if (!isoDate) return '';
    return isoDate.split('-').reverse().join('-');
  }

  // fetch and reload bookings for the selected branch
  function loadBookings() {
    if (!selectedBranch) return;
    setIsLoading(true);
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
  if (!selectedBranch) return;
  fetch(`https://garage-w5eq.onrender.com/api/booking-types/branch/${selectedBranch}`)
    .then(res => res.json())
    .then(({ booking_types }) => {
      setBookingTypes(booking_types);
    })
    .catch(() => setMessage('Failed to load booking types'));
}, [selectedBranch]);

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
                  status: b.status,
                  bookingId: b.id,
                  registration: b.vehicle,
                  bookingCreated: b.created_at,
                  comments: b.comments,
                  firstName: userData.user.first_name,
                  lastName:  userData.user.last_name,
                  email:     userData.user.email,
                  phone:     userData.user.phone,
                  bookingTypeId: b.booking_type_id,
                }
              };
            });
        });
    }))
    .then(evts => {
      setEvents(evts);
      setIsLoading(false);
    })
    .catch(err => setMessage('Failed to load event types'))
    .finally(() => setIsLoading(false));
  }, [bookings]);

  // handle clicks on calendar events: open popup for cancel/reschedule
  function handleEventClick(info) {
    const { event, el } = info;
    const rect = el.getBoundingClientRect();
    const containerRect = calendarContainerRef.current.getBoundingClientRect();
    const popupWidth = 370;
    const viewportWidth = window.innerWidth;
    let popupAbsoluteLeft;
    if (rect.right + popupWidth + 10 < viewportWidth) {
      popupAbsoluteLeft = rect.right + 10;
    } else {
      popupAbsoluteLeft = rect.left - popupWidth - 20;
    }
    const left = popupAbsoluteLeft - containerRect.left;
    // Determine vertical position relative to container
    const defaultTop = rect.top - containerRect.top;
    const popupHeight = popupRef.current ? popupRef.current.offsetHeight : 380;
    const margin = 20;
    const absoluteEventTop = rect.top + window.scrollY;
    const viewportBottom = window.scrollY + window.innerHeight;
    let top;
    if (absoluteEventTop + popupHeight + margin > viewportBottom) {
      // place above the booking if it would overflow below
      top = defaultTop - popupHeight - margin;
    } else {
      // place below the booking
      top = defaultTop;
    }
    setPopupPos({ top, left });
    setShowVehiclePopup(false);
    // Determine side (left or right) for arrow
    const centerOfEvent = rect.left + (rect.width / 2);
    const popupLeftAbsolute = containerRect.left + left;
    const threshold = popupWidth / 2;
    const side = centerOfEvent - popupLeftAbsolute < threshold ? 'left' : 'right';
    // Removed arrow calculations

    setSelectedEvent(event);
    // clear previous info and fetch new vehicle details
    setPopupVehicleInfo(null);
    const vrn = event.extendedProps.registration.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    fetch(`/api/mot-history/${vrn}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setPopupVehicleInfo({ make: data.make, model: data.model, year: data.manufactureDate.slice(0,4), fuel: data.fuelType, engine: data.engineSize, motExpiry: data.motTests[0].expiryDate });
      })
      .catch(() => {
        setPopupVehicleInfo({ error: 'Failed to load vehicle info' });
      });
    setNewDate(event.startStr.split('T')[0]);
    const h = event.start.getHours().toString().padStart(2, '0');
    const m = event.start.getMinutes().toString().padStart(2, '0');
    setNewTime(`${h}:${m}`);
    setRescheduling(false);
  }

  // Handle click on vehicle row to show vehicle popup
  function handleVehicleClick() {
    if (!popupRef.current || !popupPos) return;
    // dimensions
    const parentWidth = popupRef.current.offsetWidth;
    const detailWidth = 280;
    // decide left or right
    let left;
    if (popupPos.left + parentWidth + detailWidth + 10 < calendarContainerRef.current.offsetWidth) {
      left = popupPos.left + parentWidth + 10;
    } else {
      left = popupPos.left - detailWidth - 10;
    }
    // same vertical position
    const top = popupPos.top;
    setVehiclePopupPos({ top, left });
    setShowVehiclePopup(true);
  }

  function handleDateClick(info) {
    // Detect a double-click (detail === 2)
    if (info.jsEvent.detail === 2) {
      const calendarApi = calendarApiRef.current.getApi();
      calendarApi.changeView('timeGridDay', info.dateStr);
    }
  }

  function handleCancel() {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      fetch(`https://garage-w5eq.onrender.com/api/bookings/${selectedEvent.id}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error();
          loadBookings();
        })
        .catch(() => setMessage('Failed to cancel booking'))
        .finally(() => {
          setSelectedEvent(null);
          setPopupPos(null);
        });
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
        loadBookings();
      })
      .catch(() => setMessage('Failed to reschedule booking'))
      .finally(() => {
        setSelectedEvent(null);
        setPopupPos(null);
      });
  }

  function handlePay() {
    fetch(`https://garage-w5eq.onrender.com/api/bookings/${selectedEvent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        loadBookings();
      })
      .catch(() => setMessage('Failed to pay booking'))
      .finally(() => {
        setSelectedEvent(null);
        setPopupPos(null);
      });
  }

  function handleGenerateInvoice() {
    if (!selectedEvent) return;
    const {
      firstName,
      lastName,
      email,
      phone,
      bookingTypeId
    } = selectedEvent.extendedProps;
    const bookingType = bookingTypes.find(bt => bt.id === bookingTypeId);
    const rate = bookingType?.price || 0;
    const hours = 1; // adjust if you store hours per booking type
    const amount = rate * hours;

    // Business details
    const businessName = 'Bakestone Motors Ltd';
    const branchData = branches.find(b => b.id === selectedBranch) || {};
    const businessAddress = branchData.address || '';
    const businessContact = branchData.phone || '';
    const businessEmail = branchData.email || '';

    // Invoice info
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    const invoiceNo = selectedEvent.id;

    // Customer
    const customerName = `${firstName} ${lastName}`;
    const customerLines = [
      customerName,
      selectedEvent.extendedProps.comments || '',
      // add address lines if available
    ].filter(Boolean);

    // Create PDF
    const doc = new jsPDF('p','pt','a4');
    const leftMargin = 40;
    const rightEdge = doc.internal.pageSize.getWidth() - leftMargin;

    // Title
    doc.setFontSize(34);
    doc.setFont('helvetica','bold');
    doc.text('Invoice', leftMargin, 60);

    // Date & Invoice No.
    doc.setFontSize(12);
    doc.setFont('helvetica','normal');
    doc.text(dateStr, rightEdge, 60, { align: 'right' });
    doc.text(`Invoice No. ${invoiceNo}`, rightEdge, 78, { align: 'right' });

    // Horizontal line
    doc.setLineWidth(1);
    doc.line(leftMargin, 90, rightEdge, 90);

    // Billed To
    doc.setFontSize(14);
    doc.text('Billed to:', leftMargin, 120);
    doc.setFontSize(12);
    customerLines.forEach((line, i) => {
      doc.text(line, leftMargin, 140 + i*16);
    });

    // Line before table
    const tableTop = 160 + customerLines.length * 16;
    doc.line(leftMargin, tableTop, rightEdge, tableTop);

    // Table of items
    autoTable(doc, {
      startY: tableTop + 10,
      margin: { left: leftMargin, right: leftMargin },
      head: [['Description', 'Rate', 'Hours', 'Amount']],
      body: [
        [bookingType.name, `£${rate}/hr`, `${hours}`, `£${amount}`]
      ],
      styles: { fontSize: 12 },
      headStyles: { fillColor: [230,230,230], textColor: [0,0,0], halign: 'left' }
    });

    // Totals with 20% tax included in the final price
    const finalY = doc.lastAutoTable.finalY + 10;
    const gross = amount;
    const tax = gross * 0.20;
    const net = gross - tax;
    doc.setFontSize(12);
    doc.text(`Subtotal: £${net.toFixed(2)}`, rightEdge, finalY, { align: 'right' });
    doc.text(`Tax (20%): £${tax.toFixed(2)}`, rightEdge, finalY + 16, { align: 'right' });
    doc.text(`Total: £${gross.toFixed(2)}`, rightEdge, finalY + 32, { align: 'right' });

    // Footer: Payment and Business Info
    const footerY = doc.internal.pageSize.getHeight() - 100;
    doc.setLineWidth(0.5);
    doc.line(leftMargin, footerY, rightEdge, footerY);
    // Payment Info (left)
    doc.setFontSize(10);
    // Business Contact (right)
    doc.text(businessName, rightEdge, footerY + 20, { align: 'right' });
    doc.text(businessAddress, rightEdge, footerY + 36, { align: 'right' });
    doc.text(businessContact, rightEdge, footerY + 52, { align: 'right' });
    doc.text(businessEmail, rightEdge, footerY + 68, { align: 'right' });

    // Open PDF
    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
  }

  return (
    <>
      <style>{`
        /* shrink the all-day events bar only in day view */
        .fc .fc-timeGridDay-view .fc-daygrid-day-frame.fc-scrollgrid-sync-inner {
          min-height: 20px !important;
          height: 20px !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .fc .fc-daygrid-day-frame { aspect-ratio: 1 / 1; }
        .fc .fc-toolbar-title { font-weight: 400; }
        .branch-dropdown {
          position: absolute;
          top: 1.25rem;
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          border-radius: 6px 6px 0 0;
          padding: 4px 12px;
          font-size: 22pt;
          font-weight: 400;
          color: #333;
          cursor: pointer;
          text-align: center;
          user-select: none;
          margin-top: -20px;
          z-index: 2000;
        }
        .branch-dropdown.active {
          background: #f0f0f0;
          cursor: pointer;
        }
          .branch-dropdown:hover {
          background: rgba(0, 156, 223, 0.15);
          cursor: pointer;
        }
          
        .branch-options {
          position: absolute;
          top: 2.75rem;
          left: 50%;
          transform: translateX(-50%);
          background: #f0f0f0;
          border-radius: 0 0 6px 6px;
          overflow: hidden;
          z-index: 2000;
        }
        .branch-option {
          padding: 8px 12px;
          font-size: 22pt;
          color: #333;
          cursor: pointer;
          white-space: nowrap;
          text-align: center;
        }
        .branch-option:not(:last-child) {
          border-bottom: 1px solid rgba(0, 156, 223, 0.15);
        }
        .branch-option:hover {
          background: rgba(0, 156, 223, 0.15);
        }
        /* FullCalendar view switcher pill */
        .fc .fc-toolbar .fc-button-group {
          background: #f0f0f0;
          border-radius: 10px;
          padding: 4px;
        }

        .fc .fc-toolbar .fc-button-group .fc-button {
          background: transparent;
          border: none;
          border-radius: 7px;
          color: #333;
          padding: 4px 12px;
          margin: 0 2px;
        }
        .fc .fc-toolbar .fc-button-group .fc-button.fc-button-active {
          background: #fff;
          box-shadow: none;
        }
        .fc .fc-toolbar .fc-button-group .fc-button:focus {
          outline: none;
        }
        .fc .fc-toolbar .fc-button-group .fc-button:hover {
          background: rgba(0, 156, 223, 0.15);
        }
        /* Settings (filter) button */
        .fc .fc-toolbar .fc-button.fc-settings-button {
          background: #f0f0f0;
          border: none;
          font-size: 18px;
          padding: 4px 15px;
          color: #333;
          cursor: pointer;
        }
        .fc .fc-toolbar .fc-button.fc-settings-button:hover {
          background: rgba(0, 156, 223, 0.15);
        }
        /* Settings dropdown */
        .settings-dropdown {
          /* position: absolute; */
          /* top: 2.5rem; */
          /* right: 1.5rem; */
          background: #f0f0f0;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          z-index: 1000;
        }
        .filter-option {
          padding: 8px 12px;
          font-size: 14px;
          color: #333;
          cursor: pointer;
          white-space: nowrap;
        }
        .filter-option:not(:last-child) {
          border-bottom: 1px solid rgba(0, 156, 223, 0.15);
        }
        .filter-option:hover {
          background: rgba(0, 156, 223, 0.15);
        }
        /* keep selected event styled like hover */
        .fc .fc-daygrid-event.fc-event-selected,
        .fc .fc-timegrid-event.fc-event-selected {
          filter: brightness(0.85) !important;
        }
        /* grey background for the weekday header row, center header text, remove side borders */
        .fc .fc-col-header-cell {
          background-color:rgba(0, 156, 223, 0.15);
          height: 40px;
          border-left: none !important;
          border-right: none !important;
        }
        .fc .fc-col-header-cell-cushion {
          margin-top: 5px;
        }
        /* modern circle highlight for today */
        .fc .fc-daygrid-day.fc-day-today {
          background-color: transparent !important;
        }
        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          position: relative;
          z-index: 1;
        }
        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 32px;
          height: 32px;
          transform: translate(-50%, -50%);
          border: 2px solid #009cdf;
          border-radius: 50%;
          z-index: -1;
        }
        /* shift month-view date numbers 2px to the left */
        .fc .fc-daygrid-day-top .fc-daygrid-day-number {
          transform: translateX(-5px) translateY(2px) !important;
        }

        /* Simplify input/textarea borders in popups */
        .event-popup .details-form-input {
          border: none !important;
          border-bottom: 1px solid rgba(0,0,0,0.2) !important;
          background: transparent !important;
          border-radius: 0 !important;
          padding: 6px 4px !important;
          text-align: right !important;
        }
        .event-popup .details-form-input:focus {
          outline: none !important;
          border-bottom-color: #007bff !important;
        }
      /* Plus-button hover pill background */
      .day-plus-button {
        padding: 2px 6px;
        transition: background-color 0.2s;
        border-radius: 999px;
        display: inline-block;
      }
      .day-plus-button:hover {
        background-color: #f0f0f0;
      }
      /* shrink only the day view grid to 75%, keep toolbar full width */
      .fc .fc-timeGridDay-view {
        max-width: 35%;
        margin: 0 auto;
      }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"></link>
      <div className="bookings-admin-container">
      {message && <p className="admin-message">{message}</p>}
      <h2 className="section-title">MANAGE BOOKINGS</h2>

      <div style={{ width: calendarWidth, margin: '60px auto', position: 'relative' }}>
        <div ref={dropdownRef}>
          <div
            className={`branch-dropdown ${branchDropdownOpen ? 'active' : ''}`}
            onClick={() => setBranchDropdownOpen(prev => !prev)}
          >
            {branches.find(b => b.id === selectedBranch)?.branch_name || 'Select Branch'} <span style={{paddingLeft: '10px'}}></span>&#9662;
          </div>
          {branchDropdownOpen && (
            <div
              className="branch-options"
              style={{
                width: dropdownRef.current
                  ? dropdownRef.current.querySelector('.branch-dropdown').offsetWidth
                  : 'auto'
              }}
            >
              {branches.filter(b => b.id !== selectedBranch).map(b => (
                <div
                  key={b.id}
                  className="branch-option"
                  onClick={() => {
                    setSelectedBranch(b.id);
                    setBranchDropdownOpen(false);
                  }}
                >
                  {b.branch_name}
                </div>
              ))}
            </div>
          )}
        </div>
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.7)',
            zIndex: 1000
          }}>
            <div>Loading bookings...</div>
          </div>
        )}
        <div ref={calendarContainerRef} style={{ position: 'relative', overflow: 'visible' }}>
          <FullCalendar
            ref={calendarApiRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            datesSet={info => {
              setCalendarWidth(
                info.view.type === 'timeGridDay' ? '75%' : '75%'
              );
            }}
            customButtons={{
              settings: {
                text: '⚙',
                classNames: ['fc-settings-button'],
                click: () => setSettingsOpen(prev => !prev)
              }
            }}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'title',
              center: '',
              right: 'settings dayGridMonth,timeGridWeek,timeGridDay prev,today,next'
            }}
            events={
              selectedType === 'all'
                ? events
                : events.filter(evt => evt.extendedProps.bookingTypeId === parseInt(selectedType))
            }
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            eventClassNames={(info) =>
              info.event.id === selectedEvent?.id ? ['fc-event-selected'] : []
            }
            dayCellDidMount={renderDayCell}
            height="auto"
            selectable={true}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            dayMaxEvents={5}
            fixedWeekCount={false}
            slotMinTime={minTime}
            slotMaxTime={maxTime}
            eventDidMount={(info) => {
              const dot = info.el.querySelector('.fc-daygrid-event-dot');
              if (dot) {
                const status = info.event.extendedProps.status;
                if (status === 'paid') {
                  dot.style.border = '4px solid #46741a';
                } else if (status === 'unpaid') {
                  dot.style.border = '4px solid #ff0000';
                } else {
                  dot.style.border = '4px solid #ffc107';
                }
              }
            }}
          />
          {settingsOpen && (
            <div
              className="settings-dropdown"
              ref={settingsRef}
              style={{ position: 'absolute', top: settingsPos.top, left: settingsPos.left }}
            >
              <div
                className="filter-option"
                onClick={() => {
                  setSelectedType('all');
                  setSettingsOpen(false);
                }}
              >
                {selectedType === 'all' && <span style={{ marginRight: '0.5rem' }}>✓</span>}
                All
              </div>
              {bookingTypes.map(bt => (
                <div
                  key={bt.id}
                  className="filter-option"
                  onClick={() => {
                    setSelectedType(bt.id.toString());
                    setSettingsOpen(false);
                  }}
                >
                  {selectedType === bt.id.toString() && <span style={{ marginRight: '0.5rem' }}>✓</span>}
                  {bt.name}
                </div>
              ))}
            </div>
          )}
          {selectedEvent && popupPos && (
            <>
            <div
              className="event-popup"
              ref={popupRef}
              style={{
                position: 'absolute',
                top: popupPos.top,
                left: popupPos.left,
                width: '320px',
                background: '#fff',
                borderRadius: '25px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                padding: '40px 30px 30px 30px',
                overflow: 'visible',
                zIndex: 3000
              }}
            >
              <button
                onClick={() => { setSelectedEvent(null); setPopupPos(null); }}
                style={{
                  position: 'absolute',
                  display: 'inline',
                  top: '20px',
                  right: '4px',
                  border: 'none',
                  background: 'transparent',
                  color: 'black',
                  fontSize: '25px',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
              <p style={{textAlign: "left", fontSize: '20pt', marginTop: '-10px', fontWeight: 600, letterSpacing: '0.5px'}}>{selectedEvent.title}</p>
              <div className="confirmation-summary-item">
                <span>Booking #</span>
                <span style={{ fontWeight: 600 }}>{selectedEvent.extendedProps.bookingId}</span>
              </div>
              <div className="confirmation-summary-item">
                <span>Name</span>
                <span style={{ fontWeight: 600 }}>{selectedEvent.extendedProps.firstName} {selectedEvent.extendedProps.lastName}</span>
              </div>
              <div className="confirmation-summary-item">
                <span>Email</span>
                <span style={{ fontWeight: 600 }}>{selectedEvent.extendedProps.email}</span>
              </div>
              <div className="confirmation-summary-item">
                <span>Phone</span>
                <span style={{ fontWeight: 600 }}>{selectedEvent.extendedProps.phone}</span>
              </div>
              <div className="confirmation-summary-item">
                <span>Vehicle</span>
                <span
                  onClick={handleVehicleClick}
                  style={{
                    fontStyle: popupVehicleInfo === null ? 'italic' : 'normal',
                    fontWeight: 600,
                    textDecoration: popupVehicleInfo === null ? 'none' : 'underline',
                    color: popupVehicleInfo === null ? '#999' : 'rgb(0, 123, 255)',
                    cursor: popupVehicleInfo === null ? 'default' : 'pointer'
                  }}
                >
                  {popupVehicleInfo === null
                    ? 'Loading...'
                    : popupVehicleInfo.error
                      ? popupVehicleInfo.error
                      : `${popupVehicleInfo.make} ${popupVehicleInfo.model} (${popupVehicleInfo.year})`}
                </span>
              </div>
              <div className="confirmation-summary-item">
                <span style={{ marginRight: '20px' }}>Comments</span>
                <span style={{ fontWeight: 600, textAlign: 'right'}}>{selectedEvent.extendedProps.comments}</span>
              </div>
              <p
                onClick={() => setShowDetails(prev => !prev)}
                style={{
                  cursor: 'pointer',
                  color: '#007bff',
                  fontSize: '0.9em',
                  margin: '10px 0 0 0',
                  userSelect: 'none'
                }}
              >
                {showDetails ? 'Hide details' : 'More info'}
              </p>
              {showDetails && (() => {
                const d = new Date(selectedEvent.extendedProps.bookingCreated);
                const dateStr = d.toLocaleDateString('en-GB').split('/').join('-');
                const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <>
                    <div className="confirmation-summary-item">
                      <span>Date Booking Made</span>
                      <span style={{ fontWeight: 600 }}>{dateStr}</span>
                    </div>
                    <div className="confirmation-summary-item">
                      <span>Time Booking Made</span>
                      <span style={{ fontWeight: 600 }}>{timeStr}</span>
                    </div>
                  </>
                );
              })()}
              {!rescheduling ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                  <button className="btn-popup cancel" onClick={handleCancel} title="Cancel Booking"><i className="fa fa-times"></i></button>
                  <button className="btn-popup reschedule" onClick={() => setRescheduling(true)} title="Reschedule Booking"><i className="fa fa-clock"></i></button>
                  <button className="btn-popup paid" onClick={handlePay} title="Mark as Paid"><i className="fa fa-check"></i></button>
                  <button className="btn-popup invoice" onClick={handleGenerateInvoice} title="Generate Invoice"><i className="fa fa-file-invoice"></i></button>
                </div>
              ) : (
                <div style={{ marginTop: '15px' }}>
                  <div className="confirmation-summary-item">
                    <span>New Date</span>
                    <input
                      type="date"
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="details-form-input"
                      style={{ width: '40%', fontSize: '13px', padding: '3px', marginTop: '-5px'}}
                    />
                  </div>
                  <div className="confirmation-summary-item">
                    <span>New Time</span>
                    <input
                      type="time"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      step="60"
                      className="details-form-input"
                      style={{ width: '40%', fontSize: '13px', padding: '3px', marginTop: '-5px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '10px' }}>
                    <button
                      className="btn-popup save"
                      onClick={handleSaveReschedule}
                      title="Save"
                    >
                      <i className="fa fa-save"></i>
                    </button>
                    <button
                      className="btn-popup back"
                      onClick={() => setRescheduling(false)}
                      title="Back"
                    >
                      <i className="fa fa-arrow-left"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* --- Vehicle detail popup --- */}
            {showVehiclePopup && vehiclePopupPos && (
              <div
                className="event-popup"
                ref={vehiclePopupRef}
                style={{
                  position: 'absolute',
                  top: vehiclePopupPos.top,
                  left: vehiclePopupPos.left,
                  width: '280px',
                  background: '#fff',
                  borderRadius: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  padding: '20px',
                  zIndex: 4000
                }}
              >
                <button
                  onClick={e => { e.stopPropagation(); setShowVehiclePopup(false); }}
                  style={{
                    position: 'absolute',
                    display: 'inline',
                    top: '20px',
                    right: '4px',
                    border: 'none',
                    background: 'transparent',
                    color: 'black',
                    fontSize: '25px',
                    cursor: 'pointer'
                  }}
                >
                  &times;
                </button>
                <p style={{ fontSize: '18pt', fontWeight: 600, marginTop: '15px', marginBottom: '27px' }}>
                  {popupVehicleInfo && !popupVehicleInfo.error
                    ? `${popupVehicleInfo.make} ${popupVehicleInfo.model}`
                    : 'Vehicle'}
                </p>
                <div className="confirmation-summary-item">
                  <span>Vehicle Reg.</span>
                  <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    {selectedEvent.extendedProps.registration}
                  </span>
                </div>
                <div className="confirmation-summary-item">
                  <span>Year</span>
                  <span style={{ fontWeight: 600 }}>
                    {popupVehicleInfo && !popupVehicleInfo.error ? popupVehicleInfo.year : ''}
                  </span>
                </div>
                <div className="confirmation-summary-item">
                  <span>Fuel Type</span>
                  <span style={{ fontWeight: 600 }}>
                    {popupVehicleInfo && !popupVehicleInfo.error ? popupVehicleInfo.fuel : ''}
                  </span>
                </div>
                <div className="confirmation-summary-item">
                  <span>Fuel Type</span>
                  <span style={{ fontWeight: 600 }}>
                    {popupVehicleInfo && !popupVehicleInfo.error ? popupVehicleInfo.engine + 'cc': ''}
                  </span>
                </div>
                <div className="confirmation-summary-item">
                  <span>MOT Expiry</span>
                  <span style={{ fontWeight: 600 }}>
                    {popupVehicleInfo && !popupVehicleInfo.error
                      ? formatDisplayDate(popupVehicleInfo.motExpiry)
                      : ''}
                  </span>
                </div>
                {/* add more rows here */}
              </div>
            )}
            </>
          )}

          {showAddPopup && addPopupPos && (
            <div
              className="event-popup"
              ref={addPopupRef}
              style={{
                position: 'absolute',
                top: addPopupPos.top,
                left: addPopupPos.left,
                width: '320px',
                background: '#fff',
                borderRadius: '25px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                padding: '30px',
                zIndex: 3000
              }}
            >
              <button
                onClick={e => { e.stopPropagation(); setShowAddPopup(false); }}
                style={{
                  position: 'absolute',
                  display: 'inline',
                  top: '20px',
                  right: '4px',
                  border: 'none',
                  background: 'transparent',
                  color: 'black',
                  fontSize: '25px',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
              <p style={{ fontSize: '18pt', fontWeight: 600, marginBottom: '20px', marginTop: '4px' }}>
                New Booking
              </p>
              <div className="confirmation-summary-item">
                <span>Date</span>
                <span style={{ fontWeight: 600 }}>
                  {formatDisplayDate(addPopupPos.dateStr)}
                </span>
              </div>
              {[
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'phone', label: 'Phone', type: 'text' },
                { key: 'reg', label: 'Vehicle Reg.', type: 'text' }
              ].map(({ key, label, type }) => (
                <div key={key} className="confirmation-summary-item">
                  <span>{label}</span>
                  <input
                    type={type}
                    className="details-form-input"
                    style={{ width: '50%', padding: '4px', fontSize: '13px' }}
                    value={addForm[key]}
                    onChange={e => setAddForm({ ...addForm, [key]: e.target.value })}
                  />
                </div>
              ))}
          <div className="confirmation-summary-item">
            <span>Service</span>
            <select
              className="details-form-input"
              value={addForm.bookingTypeId}
              style={{ width: '50%', padding: '4px', fontSize: '13px' }}
              onChange={e => setAddForm({ ...addForm, bookingTypeId: e.target.value })}
            >
              {bookingTypes.map(bt => (
                <option key={bt.id} value={bt.id}>
                  {bt.name} — £{bt.price}
                </option>
              ))}
            </select>
          </div>
          <div className="confirmation-summary-item">
            <span>Time</span>
            <input
              type="time"
              className="details-form-input"
              value={addForm.time}
              onChange={e => setAddForm({ ...addForm, time: e.target.value })}
              style={{ width: '15%', padding: '4px 2px', fontSize: '13px' }}
            />
          </div>
          <div className="confirmation-summary-item">
            <span>Comments</span>
            <textarea
              className="details-form-input"
              value={addForm.comments}
              style={{ width: '70%', padding: '4px', fontSize: '13px' }}
              onChange={e => setAddForm({ ...addForm, comments: e.target.value })}
            />
          </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                <button
                  className="btn-popup save"
                  onClick={() => {
                    // create temp user then booking, with HTTP error checking and logging
                    fetch(`https://garage-w5eq.onrender.com/api/users`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        garage_id: branches.find(b => b.id === selectedBranch).garage_id,
                        first_name: addForm.name,
                        last_name: '',
                        email: addForm.email,
                        phone: addForm.phone,
                        password_hash: '',
                        role: 'temporary'
                      })
                    })
                      .then(res => {
                        if (!res.ok) return res.json().then(err => Promise.reject(err));
                        return res.json();
                      })
                      .then(({ user: nu }) => {
                        return fetch(`https://garage-w5eq.onrender.com/api/bookings`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            branch_id: selectedBranch,
                            user_id: nu.id,
                            booking_date: addPopupPos.dateStr,
                            booking_time: `${addForm.time}:00`,
                            booking_type_id: Number(addForm.bookingTypeId),
                            status: 'unpaid',
                            vehicle: addForm.reg,
                            comments: addForm.comments
                          })
                        });
                      })
                      .then(res => {
                        if (!res.ok) return res.json().then(err => Promise.reject(err));
                        return res.json();
                      })
                      .then(() => {
                        setShowAddPopup(false);
                        loadBookings();
                      })
                      .catch(err => {
                        console.error('Add booking error:', err);
                        setMessage('Failed to add booking: ' + (err.msg || err.message || 'Server error'));
                      });
                  }}
                  title="Save"
                >
                  <i className="fa fa-save"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
       <Footer />
    </>
  );
}
