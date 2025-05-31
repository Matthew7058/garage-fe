// BranchSelection.jsx
import React, { useState, useMemo, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const mapStyle = [
  {
      "featureType": "administrative",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "color": "#444444"
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [
          {
              "color": "#f2f2f2"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "all",
      "stylers": [
          {
              "saturation": -100
          },
          {
              "lightness": 45
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "transit",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "all",
      "stylers": [
          {
              "color": "#b6dae0"
          },
          {
              "visibility": "on"
          }
      ]
  }
]

export default function BranchSelection({ branches, onBranchSelect, mapKey }) {
  const [expandedId, setExpandedId] = useState(null);
  const [hoursByBranch, setHoursByBranch] = useState({});
  const mapRef = useRef(null);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // center map on average of all branch coords
  const center = useMemo(() => {
    if (!branches.length) return { lat: 0, lng: 0 };
    const avgLat = branches.reduce((sum, b) => sum + Number(b.lat), 0) / branches.length;
    const avgLng = branches.reduce((sum, b) => sum + Number(b.lng), 0) / branches.length;
    return { lat: avgLat, lng: avgLng };
  }, [branches]);

  // load Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'branch-map',
    googleMapsApiKey: mapKey
  });

  const mapOptions = {
    styles: mapStyle,
    disableDefaultUI: true,     // optional: turn off default controls
    zoomControl: true,          // optional: re-enable your chosen controls
  };

  const handleExpand = (id) => {
    const newId = expandedId === id ? null : id;
    setExpandedId(newId);

    // zoom to selected branch on map
    if (newId && mapRef.current) {
      const branch = branches.find(b => b.id === newId);
      if (branch) {
        mapRef.current.panTo({ lat: Number(branch.lat), lng: Number(branch.lng) });
        mapRef.current.setZoom(15);
      }
    }

    // Fetch hours if we’re expanding this branch and haven’t already
    if (newId && !hoursByBranch[newId]) {
      fetch(`https://garage-w5eq.onrender.com/api/operating-hours/branch/${newId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch operating hours');
          return res.json();
        })
        .then(data => {
          // assume { open_time: "...", close_time: "..." }
          setHoursByBranch(prev => ({ ...prev, [newId]: data.operating_hours }));
        })
        .catch(err => {
          console.error(err);
          // mark as error so we don’t keep retrying
          setHoursByBranch(prev => ({ ...prev, [newId]: { error: true } }));
        });
    }
  };

  return (
    <div style={{ display: 'flex', height: '500px' }}>
      {/* LEFT PANEL */}
      <div style={{ flex: "0 0 50%", overflowY: 'auto', padding: '0 1rem'}}>
        {branches.map((b) => (

          <div
            key={b.id}
            style={{
              border: '1px solid #ddd',
              marginBottom: '1rem',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0, fontSize: '18pt', fontWeight: '500' }}>{b.branch_name}</h4>
              <button
                onClick={() => handleExpand(b.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007bff' }}
              >
                <FontAwesomeIcon icon={expandedId === b.id ? faChevronUp : faChevronDown} />
              </button>
            </div>
            <button
                  onClick={() => onBranchSelect(b)}
                  style={{
                    display: 'block',
                    //margin: 'auto',
                    marginLeft: 'auto', 
                    marginRight: '0',
                    hover: 'right',
                    marginTop: '1rem',
                    padding: '0.75rem 3rem',
                    fontSize: '12pt',
                    backgroundColor: '#0c2e6e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '30px',
                    cursor: 'pointer'
                  }}
                >
                  SELECT THIS BRANCH
                </button>

            {expandedId === b.id && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#333', display: 'flex' }}>
                <div style={{ flex: '0 0 50%'}}>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Address:</strong><br />
                    {
                      b.address
                      .split(',')
                      .map(line => line.trim())
                      .map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))
                    }
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Phone:</strong> <a href={`tel:${b.phone}`}>{b.phone}</a>
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Opening Hours:</strong> {' '}
                  </p>
                    {(() => {
                    const hrs = hoursByBranch[b.id];
                    if (!hrs) {
                      return <p style={{ margin: '0.25rem 0' }}>Loading…</p>;
                    }
                    if (hrs.error) {
                      return <p style={{ margin: '0.25rem 0' }}>Unavailable</p>;
                    }
                    return (
                      <ul style={{ margin: '0.25rem 0', paddingLeft: '1rem', listStyle: 'none' }}>
                        {hrs.map(entry => (
                          <li key={entry.day_of_week}>
                            <strong>{dayNames[entry.day_of_week]}:</strong> {entry.open_time} – {entry.close_time}
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
                
              </div>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: "0 0 50%", position: 'relative' }}>
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            //center={{lat: 53.421946, lng: -2.118459}}
            zoom={12}
            options={mapOptions}
            onLoad={map => { mapRef.current = map; }}
          >
            {branches.map((b) => (
              <Marker
                key={b.id}
                position={{ lat: Number(b.lat), lng: Number(b.lng) }}
                icon={{
                  url: 'src/assets/garage-marker.png',
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
                //position={{ lat: 53.421946, lng: -2.118459}}
                onClick={() => {
                  setExpandedId(b.id);
                  handleExpand(b.id);
                  // optionally scroll card into view:
                  document
                    .querySelector(`[data-branch-id="${b.id}"]`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              />
            ))}
          </GoogleMap>
        )}
      </div>
    </div>
);
}