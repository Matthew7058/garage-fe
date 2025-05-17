import React, { useEffect, useState } from 'react';
import garageVideo from '../assets/garage-video-cropped.mov';
import mechanic from '../assets/mechanic.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faClipboardCheck, faWrench, faSnowflake, faCarSide, faExchangeAlt, faCogs, faSyncAlt, faCarCrash, faClock, faTools } from '@fortawesome/free-solid-svg-icons';

function Home() {
  // If you want to dynamically fetch your chain name, keep this logic
  // otherwise, remove the effect and chain-related states.
  const [chainName, setChainName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    </div>

    
  );
}

export default Home;