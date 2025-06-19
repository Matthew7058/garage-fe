import React, { useEffect, useState, useRef } from 'react';
import garageVideo from '../assets/garage-video-cropped.mov';
import mechanic from '../assets/mechanic.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faClipboardCheck, faWrench, faSnowflake, faCarSide, faExchangeAlt, faCogs, faSyncAlt, faCarCrash, faClock, faTools } from '@fortawesome/free-solid-svg-icons';
import Footer from '../components/Footer';

function Home() {
  // If you want to dynamically fetch your chain name, keep this logic
  // otherwise, remove the effect and chain-related states.
  const [chainName, setChainName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [branchesList, setBranchesList] = useState([]);
  const [branchHours, setBranchHours] = useState({});

  // Sample customer reviews
  const reviews = [
    { id: 3, author: 'Lucy P.', date: 'March 2025', text: 'Great value and excellent workmanship.', rating: 5,
      imageUrl: '/src/assets/lucy.png' },
    { id: 2, author: 'Mark S.', date: 'April 2025', text: 'Quick MOT, and they explained everything clearly.', rating: 4,
      imageUrl: '/src/assets/mark.png' },
    { id: 3, author: 'Jane D.', date: 'May 2025', text: 'Fantastic service and friendly staff!', rating: 5,
      imageUrl: '/src/assets/jane.png' },
    { id: 4, author: 'Tom B.', date: 'June 2025', text: 'Friendly staff and top-quality work!', rating: 5,
      imageUrl: '/src/assets/tom.png' },
    { id: 5, author: 'Alice W.', date: 'July 2025', text: 'Very professional and transparent service.', rating: 5,
      imageUrl: '/src/assets/alice.png' }
  ];
  const carouselRef = useRef(null);
  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const width = carouselRef.current.offsetWidth;
    carouselRef.current.scrollBy({ left: direction * width, behavior: 'smooth' });
  };

  useEffect(() => {
    // Example of fetching chain name with ID=1
    fetch('https://garage-w5eq.onrender.com/api/garage-chains/1')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch chain details');
        }
        return res.json();
      })
      .then((data) => {
        // e.g., data.chain = { id: 1, name: "All Trans Autos LTD", ... }
        setChainName(data.chain?.name || '');
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch('https://garage-w5eq.onrender.com/api/garage-chains/1/branches')
      .then(res => res.json())
      .then(({ branches }) => {
        setBranchesList(branches);
        branches.forEach(branch => {
          fetch(`https://garage-w5eq.onrender.com/api/operating-hours/branch/${branch.id}`)
            .then(r => r.json())
            .then(({ operating_hours }) =>
              setBranchHours(prev => ({ ...prev, [branch.id]: operating_hours }))
            );
        });
      })
      .catch(err => console.error('Error fetching branches', err));
  }, []);

  // Handle loading or error states
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="hero">
      {/* Overlay for shading the background image */}
        <video autoPlay loop muted>
          <source src={garageVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
            
        <div className="hero-overlay">
          <div className="hero-content">
            {/* 
                Option A: Hard-coded text (matching screenshot style)
                <h1>WE PROVIDE TOTAL CAR SERVICING</h1> 
                
                Option B: Dynamic chain name, if you fetched from API:
            */}
            <h1>
                WE ARE <br />
                <span style={{ color: '#0c2e6e' }}>BAKESTONE </span>
            </h1>
            
            <p>
                As an independently run garage based in Colchester and only 5 minutes away
                from the A12, we provide a friendly professional service for all vehicles
                offering you a prompt and reliable service.
            </p>
            <a href="/book" className="book-button">
                BOOK ONLINE
            </a>
          </div>
        </div>
      </div>

      <div class="container2">
  
        <div class="half image-side">
          <img src={mechanic} alt="Mechanic Image"/>
        </div>
        <div class="half text-side">
          <h3>WELCOME TO</h3>
          <h1>BAKESTONE MOTORS LTD</h1>
          <p>
            Bakestone Motors Ltd, your local garage, MOT &amp; van hire centre. 
            Serving Colchester and the surrounding areas.
          </p>
          <p>
            As an independently run garage, based in Colchester and only 5 minutes away from the A12, we provide friendly professional servicing for all vehicles offering you a prompt and reliable car service.

            As an MOT Centre, we offer a same day car service whilst you wait. Our friendly team will look after you in our comfortable reception area and answer any questions you may have. With the very latest up-to-date diagnostic equipment and technical data, the All Trans Autos Ltd garage ensures all vehicles are serviced to manufacturers specifications.
          </p>
          <p>  
            FAMILY RUN BUSINESS
          </p>
          <p>
            All Trans Autos Ltd is one of the largest privately-owned car garages in Colchester, their passion and determination have grown and developed into a business you can trust for all your vehicles requirements.
          </p>
        </div>
      </div>
      
      <div class="services-section">
        <section id="services">
          <h2>OUR SERVICES</h2>
          <div class="services-grid">
            
            <div class="service">
              <div class="icon"><FontAwesomeIcon icon={faCar} /></div>
              <h3>Vehicle Servicing &amp; Maintenance</h3>
              <p>Vehicle servicing and maintenance to main dealer standards.</p>
            </div>
            
            <div class="service">
              <div class="icon"><FontAwesomeIcon icon={faClipboardCheck} /></div>
              <h3>MOT Preparation &amp; Testing</h3>
              <p>MOT preparation and testing.</p>
            </div>
            
            <div class="service">
              <div class="icon"><FontAwesomeIcon icon={faWrench} /></div>
              <h3>Advanced Diagnostics</h3>
              <p>Advanced vehicle diagnostics, fault identification and rectification.</p>
            </div>
            
            <div class="service">
              <div class="icon"><FontAwesomeIcon icon={faSnowflake} /></div>
              <h3>Air Conditioning Servicing</h3>
              <p>Air conditioning maintenance and servicing.</p>
            </div>
            
            <div class="service">
              <div class="icon"><FontAwesomeIcon icon={faCarSide} /></div>
              <h3>Tyre Replacement &amp; Inspections</h3>
              <p>Replacement tyres, punctures and inspections. (Stockport garage only)</p>
            </div>
            
            <div class="service">
              <div class="icon"><FontAwesomeIcon icon={faExchangeAlt} /></div>
              <h3>Exhaust Systems Replacement</h3>
              <p>Replacement exhaust systems.</p>
            </div>
            
            <div class="service">
              <div class="icon"><FontAwesomeIcon icon={faCogs} /></div>
              <h3>Gearbox Repairs &amp; Overhauls</h3>
              <p>Gearbox repairs and overhauls.</p>
            </div>
            
            <div class="service">
              <div class="icon"><FontAwesomeIcon icon={faSyncAlt} /></div>
              <h3>Clutch Replacement</h3>
              <p>Replacement clutches.</p>
            </div>
            
            <div class="service">
              <div class="icon"><FontAwesomeIcon icon={faCarCrash} /></div>
              <h3>Brake Safety &amp; Repairs</h3>
              <p>Brake safety check, replacement and repairs. We are Ferodo brake specialists.</p>
            </div>
            
            <div class="service">
              <div class="icon"><FontAwesomeIcon icon={faClock} /></div>
              <h3>Interim Servicing</h3>
              <p>Interim vehicle servicing.</p>
            </div>
            
            <div class="service">
              <div class="icon"><FontAwesomeIcon icon={faTools} /></div>
              <h3>General Servicing &amp; Repairs</h3>
              <p>Servicing and repair work for all makes and models.</p>
            </div>
            
          </div>
        </section>
      </div>
      {/* ————— Need Help? banner ————— */}
      <section
        className="help-banner"
        style={{
          backgroundColor: '#001169',
          color: '#fff',
          padding: '3rem 1rem',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>
            <span style={{ color: '#46741a' }}>NEED</span>{' '}
            <span style={{ color: '#fff' }}>HELP?</span>
          </h2>
          <p style={{ flex: 1, margin: '0 1rem', fontSize: '1.1rem' }}>
            If you have any questions, we’re always happy to help you and provide free and professional car servicing advice.
          </p>
          <a
            href="/contact"
            className="contact-button"
            style={{
              background: '#fff',
              color: '#46741a',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            CONTACT US
          </a>
        </div>
      </section>
      {/* ————— End banner ————— */}
      <section className="branches-section" style={{ padding: '3rem 2rem', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem', color: '#003399' }}>
          OUR BRANCHES
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          {branchesList.map(branch => (
            <div key={branch.id} style={{
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 style={{ margin: 0, color: '#0c2e6e', fontSize: '1.25rem' }}>
                {branch.branch_name}
              </h3>
              <p style={{ margin: '0.5rem 0 1rem', fontSize: '0.95rem', color: '#333' }}>
                {branch.address}
              </p>
              <div style={{
                flexGrow: 1,
                marginBottom: '1rem',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <iframe
                  title={`Map of ${branch.branch_name}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(chainName + branch.branch_name)}&output=embed`}
                  width="100%"
                  height="180"
                  frameBorder="0"
                  style={{ border: 0 }}
                  allowFullScreen
                />
              </div>
              <div style={{ marginTop: 'auto' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#0c2e6e', fontSize: '1rem' }}>
                  Opening Hours
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {(branchHours[branch.id] || []).map(hour => (
                    <li key={hour.id} style={{ fontSize: '0.9rem', lineHeight: 1.4, color: '#555' }}>
                      {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][hour.day_of_week]}
                      : {hour.open_time.slice(0,5)}–{hour.close_time.slice(0,5)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* ————— Customer Reviews ————— */}
      <section
        className="reviews-section"
        style={{
          backgroundColor: '#f1f1f1',
          color: '#333',
          padding: '4rem 2rem'
        }}
      >
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem', color: '#003399' }}>
          WHAT OUR CUSTOMERS SAY
        </h2>
        <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={() => scrollCarousel(-1)}
            style={{
              position: 'absolute',
              top: '47%',
              left: '-4rem',
              fontSize: '35pt',
              fontWeight: 'bold',
              transform: 'translateY(-50%)',
              background: 'transparent',
              color: '#003399',
              border: 'none',
              borderRadius: '50%',
              width: '2rem',
              height: '9rem',
              cursor: 'pointer'
            }}
          >
            ‹
          </button>
          <div
            ref={carouselRef}
            style={{
              display: 'flex',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              gap: '1rem',
              paddingBottom: '1rem'
            }}
          >
            {reviews.map(r => (
              <div
                key={r.id}
                style={{
                  flex: '0 0 500px',
                  display: 'flex',
                  background: '#fff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  scrollSnapAlign: 'start'
                }}
              >
                {/* Text column */}
                <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p style={{ fontStyle: 'italic', marginBottom: '1rem', flexGrow: 1 }}>
                    “{r.text}”
                  </p>
                  <div>
                    <p style={{ fontWeight: 600, margin: 0 }}>{r.author}</p>
                    <p style={{ fontSize: '0.85rem', color: '#555' }}>{r.date}</p>
                  </div>
                </div>
                {/* Image column */}
                <div style={{ flex: 1 }}>
                  <img
                    src={r.imageUrl}
                    alt={`${r.author} review`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => scrollCarousel(1)}
            style={{
              position: 'absolute',
              top: '47%',
              right: '-3rem',
              transform: 'translateY(-50%)',
              background: 'transparent',
              color: '#003399',
              border: 'none',
              fontSize: '35pt',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '2rem',
              height: '9rem',
              cursor: 'pointer'
            }}
          >
            ›
          </button>
        </div>
      </section>
      {/* ————— End Reviews ————— */}
      <Footer />
    </div>

    
  );
}

// Hide native scrollbar in reviews carousel
// (Injects a <style> block if not already present at the top of the file)
if (typeof document !== "undefined" && !document.getElementById("reviews-carousel-scrollbar-style")) {
  const style = document.createElement("style");
  style.id = "reviews-carousel-scrollbar-style";
  style.innerHTML = `
    /* Hide native scrollbar in reviews carousel */
    .reviews-section div::-webkit-scrollbar {
      display: none;
    }
    .reviews-section div {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;
  document.head.appendChild(style);
}

export default Home;