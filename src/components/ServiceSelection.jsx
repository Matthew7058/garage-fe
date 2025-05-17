import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faClipboardCheck, faWrench, faSnowflake, faCarSide, faExchangeAlt, faCogs, faSyncAlt, faCarCrash, faClock, faTools, faOilCan } from '@fortawesome/free-solid-svg-icons';

export default function ServiceSelection({ bookingTypes, onTypeSelect }) {

    // 1. Build a metadata map keyed by the exact service-name string
    const SERVICE_META = {
        'Full Service': {
        icon: faCar,
        description: 'Vehicle servicing and maintenance to main dealer standards.'
        },
        'MOT': {
        icon: faClipboardCheck,
        description: 'MOT preparation and testing.'
        },
        'Oil Change': {
        icon: faOilCan,
        description: 'Change Oil after 10,000 miles or 365 days.'
        },
        'Advanced Diagnostics': {
        icon: faWrench,
        description: 'Advanced vehicle diagnostics, fault identification and rectification.'
        },
        'Air Conditioning Servicing': {
        icon: faSnowflake,
        description: 'Air conditioning maintenance and servicing.'
        },
        'Tyre Replacement & Inspections': {
        icon: faCarSide,
        description: 'Replacement tyres, punctures and inspections. (Stockport garage only)'
        },
        'Exhaust Systems Replacement': {
        icon: faExchangeAlt,
        description: 'Replacement exhaust systems.'
        },
        'Gearbox Repairs & Overhauls': {
        icon: faCogs,
        description: 'Gearbox repairs and overhauls.'
        },
        'Clutch Replacement': {
        icon: faSyncAlt,
        description: 'Replacement clutches.'
        },
        'Brake Safety & Repairs': {
        icon: faCarCrash,
        description: 'Brake safety check, replacement and repairs. We are Ferodo brake specialists.'
        },
        'Interim Servicing': {
        icon: faClock,
        description: 'Interim vehicle servicing.'
        },
        'General Servicing & Repairs': {
        icon: faTools,
        description: 'Servicing and repair work for all makes and models.'
        },
    };

    return (
        <div>

            <section id="services">
                <div className="services-grid">
                    {bookingTypes.map(type => {
                    // 2. lookup by the API‐returned name
                    const meta = SERVICE_META[type.name];
                    // 3. if you get something back, render it; otherwise skip or render a fallback
                    if (!meta) return null;

                    return (
                        <div className="service" key={type.id}>
                        <div className="icon">
                            <FontAwesomeIcon icon={meta.icon} />
                        </div>
                        <h3>{type.name}</h3>
                        <p>{meta.description}</p>
                        <button onClick={() => onTypeSelect(type)}>
                            Book now — £{type.price}
                        </button>
                        </div>
                    );
                    })}
                </div>
            </section>

          
               
                
        </div>
    )

}