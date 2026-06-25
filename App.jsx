import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Dynamic backend database sync loop
  useEffect(() => {
    fetch('https://volttrack-server.onrender.com/api/stations')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setStations(data);
        }
      })
      .catch((err) => console.error("Error syncing grid infrastructure:", err));
  }, []);

  // --- USER AUTHENTICATION STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // --- INPUT STATES ---
  const [authInput, setAuthInput] = useState({ 
    name: '', 
    evNo: '', 
    phone: '', 
    city: 'Karur', 
    paymentPreference: '' 
  });

  // --- LOCAL HISTORY SUGGESTIONS CLEARED AS REQUESTED ---
  const [pastRegistrations, setPastRegistrations] = useState([]);

  // --- DROP-DOWN SUGGESTION VISIBILITY STATES ---
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showEvSuggestions, setShowEvSuggestions] = useState(false);
  const [selectedStationForModal, setSelectedStationForModal] = useState(null);

  // --- INLINE REAL-TIME VALIDATION ERROR STATES ---
  const [errors, setErrors] = useState({
    name: '',
    evNo: '',
    phone: '', 
    city: ''
  });

  // --- INTERACTIVE PORTAL STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [powerFilter, setPowerFilter] = useState('All');
  const [selectedStation, setSelectedStation] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  
  // --- REAL-TIME LIVE LIFECYCLE ENGINE TIMERS ---
  const [bookingTimeRemaining, setBookingTimeRemaining] = useState(3600); 
  const [isBufferPhase, setIsBufferPhase] = useState(false);
  const [bufferElapsedSeconds, setBufferElapsedSeconds] = useState(0);
  const [accruedFine, setAccruedFine] = useState(0);
  const [lastLoggedMinute, setLastLoggedMinute] = useState(0);

  // --- EXCLUSIVE 5-MINUTE ADVANTAGE FREEZE STATES ---
  const [freezeActive, setFreezeActive] = useState(false);
  const [freezeTimer, setFreezeTimer] = useState(300); 
  const [freezeStationId, setFreezeStationId] = useState(null);
  const [freezeExpiredNotice, setFreezeExpiredNotice] = useState(false);

  // --- CENTRAL REGISTRY DATA MATRIX ---
  const [stations, setStations] = useState([]);

  // --- BACKGROUND SCROLL MANAGEMENT ---
  useEffect(() => {
    if (showRegister) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showRegister]);

  // --- AUTOMATED TIMELINE LIFECYCLE LOOP ---
  useEffect(() => {
    let lifecycleInterval = null;
    
    if (activeBooking) {
      lifecycleInterval = setInterval(() => {
        if (!isBufferPhase) {
          setBookingTimeRemaining((prev) => {
            if (prev <= 1) {
              setIsBufferPhase(true);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setBufferElapsedSeconds((prev) => {
            const nextSecs = prev + 1;
            const currentMins = Math.ceil(nextSecs / 60);
            const computedFine = currentMins * 5;

            if (currentMins !== lastLoggedMinute) {
              setLastLoggedMinute(currentMins);
              fetch('https://volttrack-server.onrender.com/api/audit/fine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: currentUser?.name, minutes: currentMins, fineAmount: computedFine })
              }).catch(err => console.error(err));
            }

            if (nextSecs >= 900) {
              alert("Telemetry Timeout: 15-Minute absolute buffer window completely exhausted. Booking dropped. Account flagged for settlement collection.");
              executeHardExpiryDrop();
            }
            setAccruedFine(computedFine);
            return nextSecs;
          });
        }
      }, 1000);
    }

    return () => clearInterval(lifecycleInterval);
  }, [activeBooking, isBufferPhase, lastLoggedMinute, currentUser]);

  // --- EXCLUSIVE LOCK FREEZE ENGINE LOOP ---
  useEffect(() => {
    let freezeInterval = null;
    if (freezeActive && freezeTimer > 0) {
      freezeInterval = setInterval(() => {
        setFreezeTimer((prev) => prev - 1);
      }, 1000);
    } else if (freezeTimer === 0 && freezeActive) {
      setFreezeActive(false);
      setFreezeStationId(null);
      setFreezeExpiredNotice(true);
      clearInterval(freezeInterval);
    }
    return () => clearInterval(freezeInterval);
  }, [freezeActive, freezeTimer]);

  // --- AUTOMATED FORCED TIMEOUT CLEANUP ---
  const executeHardExpiryDrop = () => {
    if (!activeBooking) return;
    const stationId = activeBooking.stationId;

    fetch(`https://volttrack-server.onrender.com/api/stations/${stationId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: currentUser, type: 'HARD_EXPIRY' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStations(prev => prev.map(st => st && String(st.id) === String(stationId) ? data.updatedStation : st));
        }
      })
      .catch(err => console.error("Expiry drop network fault:", err));

    setActiveBooking(null);
    setIsBufferPhase(false);
    setBufferElapsedSeconds(0);
    setBookingTimeRemaining(3600);
    setLastLoggedMinute(0);
  };

  // --- MANUAL VOID INTERRUPT FOR FREEZE STATE ---
  const handleManualVoidFreeze = () => {
    if (!freezeActive) return;
    const stationId = freezeStationId;

    fetch(`https://volttrack-server.onrender.com/api/stations/${stationId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: currentUser, type: 'MANUAL_VOID' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStations(prev => prev.map(st => st && String(st.id) === String(stationId) ? data.updatedStation : st));
        }
      })
      .catch(err => console.error("Manual freeze void sync error:", err));

    setFreezeActive(false);
    setFreezeStationId(null);
    setFreezeExpiredNotice(false);
    alert("Freeze Advantage Manual Bypass: Locked pipeline released. Slot is now exposed to the public pool.");
  };

  // --- REAL-TIME INLINE FIELD INTERCEPTOR VALIDATION ---
  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthInput(prev => ({ ...prev, [name]: value }));

    switch (name) {
      case 'name': {
        const nameRegex = /^[A-Za-z\s]*$/;
        if (!nameRegex.test(value)) {
          setErrors(prev => ({ ...prev, name: '⚠️ Invalid Character: Only alphabetical letters are authorized.' }));
        } else if (value.trim().length === 0 && value.length > 0) {
          setErrors(prev => ({ ...prev, name: '⚠️ Name cannot consist only of blank spaces.' }));
        } else {
          setErrors(prev => ({ ...prev, name: '' }));
        }
        break;
      }
      case 'evNo': {
        if (value.trim() === '') {
          setErrors(prev => ({ ...prev, evNo: '' }));
          break;
        }
        const partialAllowedRegex = /^[A-Za-z0-9\s-]*$/;
        if (!partialAllowedRegex.test(value)) {
          setErrors(prev => ({ ...prev, evNo: '⚠️ Blocked Character: Symbols or punctuation are invalid.' }));
          break;
        }
        if (value.trim().length >= 3) {
          const evIdRegex = /^[A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,2}[-\s]?\d{4}$/i;
          if (!evIdRegex.test(value.trim())) {
            setErrors(prev => ({ ...prev, evNo: '⚠️ Wrong Format. Must follow standard: TN-47-AA-1234' }));
          } else {
            setErrors(prev => ({ ...prev, evNo: '' }));
          }
        } else {
          setErrors(prev => ({ ...prev, evNo: '' }));
        }
        break;
      }
      case 'phone': {
        if (value.trim() === '') {
          setErrors(prev => ({ ...prev, phone: '' }));
          break;
        }
        const digitsOnlyRegex = /^[0-9]*$/;
        if (!digitsOnlyRegex.test(value)) {
          setErrors(prev => ({ ...prev, phone: '⚠️ Blocked Entry: Only digits are allowed.' }));
          break;
        }
        if (value.length > 0 && !/^[6-9]\d{9}$/.test(value)) {
          setErrors(prev => ({ ...prev, phone: '⚠️ Wrong Mobile Format: Must be 10 digits starting with 6-9.' }));
        } else {
          setErrors(prev => ({ ...prev, phone: '' }));
        }
        break;
      }
      case 'city': {
        const cityRegex = /^[A-Za-z\s]*$/;
        if (!cityRegex.test(value)) {
          setErrors(prev => ({ ...prev, city: '⚠️ Invalid Location Entry: Numbers/Symbols are blocked.' }));
        } else {
          setErrors(prev => ({ ...prev, city: '' }));
        }
        break;
      }
      default:
        break;
    }
  };

  const handlePreferenceToggle = (targetMode) => {
    if (authInput.paymentPreference === targetMode) {
      setAuthInput(prev => ({ ...prev, paymentPreference: '' }));
    } else {
      setAuthInput(prev => ({ ...prev, paymentPreference: targetMode }));
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (isFormInvalid) return;

    const savedRecord = {
      name: authInput.name.trim(), 
      evNo: authInput.evNo.trim().toUpperCase(), 
      phone: authInput.phone.trim(),
      city: authInput.city.trim(),
      preference: authInput.paymentPreference 
    };

    fetch('https://volttrack-server.onrender.com/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedRecord)
    })
      .then(res => res.json())
      .then(() => {
        setCurrentUser(savedRecord);
        setIsLoggedIn(true);
        setShowRegister(false);
      })
      .catch(err => console.error("Error saving user registration:", err));
  };

  const handleMockLogin = () => {
    const mockDriver = { name: "Kaushal Sakthivel", evNo: "TN-47-XX-9999", phone: "9474747474", city: "Karur", preference: "UPI_Lockout" };
    setCurrentUser(mockDriver);
    setIsLoggedIn(true);
  };

  const handleOpenRegistrationWindow = () => {
    setAuthInput({ name: '', evNo: '', phone: '', city: 'Karur', paymentPreference: '' });
    setErrors({ name: '', evNo: '', phone: '', city: '' });
    setShowRegister(true);
  };

  // --- BOOKING DISPATCHER ---
  const executeBooking = (station) => {
    if (!station) return;
    if (!isLoggedIn) {
      alert("Security Protocol: Registration profile node missing. Please Sign In or Register at the top right.");
      return;
    }
    if (activeBooking) {
      alert("Grid Conflict: You already hold an active station reservation slot.");
      return;
    }
    if (freezeActive && String(freezeStationId) !== String(station.id)) {
      alert("System Lockout: Another profile's active freeze advantage is protecting this specific node pipeline.");
      return;
    }

    fetch(`https://volttrack-server.onrender.com/api/stations/${station.id}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: currentUser })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStations(prevStations => 
            prevStations.map(st => st && String(st.id) === String(station.id) ? data.updatedStation : st)
          );
          
          setActiveBooking({
            stationId: station.id,
            stationName: station.name,
            location: station.location,
            timeReserved: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          
          setFreezeActive(false);
          setFreezeStationId(null);
          setBookingTimeRemaining(3600);
          setIsBufferPhase(false);
          setBufferElapsedSeconds(0);
          setAccruedFine(0);
          setLastLoggedMinute(0);
          setSelectedStation(null);
        } else {
          alert("Grid Sync Refused: " + (data.error || "Unknown allocation mismatch."));
        }
      })
      .catch(err => {
        console.error("Booking looping fault:", err);
        alert("Connection Error: Could not sync reservation to grid infrastructure.");
      });
  };
  
  // --- ADAPTIVE CONTEXTUAL CANCELLATION CONTROLLER ---
  const handleAdaptiveCancellation = () => {
    if (!activeBooking) return;
    const stationId = activeBooking.stationId;

    if (!isBufferPhase) {
      fetch(`https://volttrack-server.onrender.com/api/stations/${stationId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser, type: 'CORE_CANCEL' })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStations(prevStations =>
              prevStations.map(st => st && String(st.id) === String(stationId) ? data.updatedStation : st)
            );
          }
        })
        .catch(err => console.error("Cancellation network database sync error:", err));

      setFreezeStationId(stationId);
      setFreezeTimer(300); 
      setFreezeExpiredNotice(false);
      setFreezeActive(true);
      alert("Core Window Cancellation Confirmed: Your 5-Minute Freeze Time has started. Rebook protection enabled.");
    } else {
      fetch(`https://volttrack-server.onrender.com/api/stations/${stationId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser, type: 'BUFFER_CANCEL', fine: accruedFine })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStations(prevStations =>
              prevStations.map(st => st && String(st.id) === String(stationId) ? data.updatedStation : st)
            );
          }
        })
        .catch(err => console.error("Cancellation network database sync error:", err));
      
      const selectedPrefText = currentUser?.preference === 'Wallet_Auto' 
        ? "Linked Integrated Digital Wallet (Auto-Deduct)" 
        : "UPI Gateway Settlement / Manual On-Arrival Over-The-Counter";

      alert(`Buffer Penalty Settlement Mandate:\n\n` +
            `Since you cancelled during the active buffer window, you must settle the accrued fine of ₹${accruedFine}.\n\n` +
            `Transaction Processing Route Authorized: ${selectedPrefText}.\n\n` +
            `Note: The 5-Minute Freeze advantage is voided.`);
    }

    setActiveBooking(null);
    setLastLoggedMinute(0);
  };

  const filteredStations = stations.filter(station => {
    if (!station || !station.name || !station.location) return false;
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          station.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPower = powerFilter === 'All' || 
                         (powerFilter === 'DC' && station.type && station.type.toLowerCase().includes('dc')) || 
                         (powerFilter === 'AC' && station.type && station.type.toLowerCase().includes('ac'));
    return matchesSearch && matchesPower;
  });

  const formatClock = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isFormInvalid = 
    errors.name || errors.evNo || errors.phone || errors.city || 
    !authInput.name || !authInput.evNo || !authInput.phone || !authInput.city || 
    !authInput.paymentPreference;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0c', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', padding: '30px' }}>
      
      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #1f2937', marginBottom: '35px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem' }}>⚡</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, letterSpacing: '-0.025em', color: '#fff' }}>
            VOLT<span style={{ color: '#00e676' }}>TRACK</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {!isLoggedIn ? (
            <>
              <button onClick={handleMockLogin} style={{ background: 'transparent', border: 'none', color: '#00e676', cursor: 'pointer', fontWeight: '600' }}>Quick Sign In</button>
              <button onClick={handleOpenRegistrationWindow} style={{ backgroundColor: '#00e676', color: '#0a0a0c', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Register</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}>Bound Terminal: <strong style={{ color: '#00e676' }}>{currentUser?.name} ({currentUser?.evNo})</strong></span>
              <button onClick={() => { setIsLoggedIn(false); setActiveBooking(null); setFreezeActive(false); }} style={{ background: '#1f2937', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Disconnect</button>
            </div>
          )}
        </div>
      </nav>

      {/* DISCLAIMERS HEADER */}
      <div style={{ backgroundColor: '#111216', border: '1px solid #1f2937', padding: '25px', borderRadius: '12px', marginBottom: '30px', textAlign: 'left' }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: '1.3rem', color: '#fff' }}>Welcome to the VoltTrack Infrastructure Network</h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#a0aec0', maxWidth: '800px' }}>
          Providing intelligent, real-time localized charging node optimization pathways for clean electric mobility fleets across the Karur region.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem', borderTop: '1px solid #1a1b20', paddingTop: '15px' }}>
          <div style={{ lineHeight: '1.5', color: '#718096' }}>
            <strong style={{ color: '#ef4444', display: 'inline-block', marginRight: '6px' }}>🚨 ARRIVAL TIMEFRAME TARGET:</strong> 
            All reservations hold a target arrival window. Exceeding core limits initializes a strict 15-Minute buffer countdown with dynamic fine processing.
          </div>
          <div style={{ lineHeight: '1.5', color: '#718096' }}>
            <strong style={{ color: '#00e676', display: 'inline-block', marginRight: '6px' }}>🛡️ PRIORITY ADVANTAGE LOCK:</strong> 
            Cancelling your reservation within the Core Window triggers a 5-Minute lock advantage, protecting that specific space exclusively for your quick re-routing.
          </div>
        </div>
      </div>

      {/* MAIN DATA PLATFORM LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', textAlign: 'left' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ backgroundColor: '#111216', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Search highway corridors, hub points, or local landmarks..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', backgroundColor: '#1a1b20', border: '1px solid #2d3748', color: '#fff', fontSize: '0.95rem' }}
              />
              <select 
                value={powerFilter}
                onChange={(e) => setPowerFilter(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#1a1b20', border: '1px solid #2d3748', color: '#fff', cursor: 'pointer' }}
              >
                <option value="All">All Power Thresholds</option>
                <option value="DC">DC Rapid Charger</option>
                <option value="AC">AC Type 2 Infrastructure</option>
              </select>
            </div>
          </div>

          <div style={{ backgroundColor: '#111216', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', overflowX: 'auto' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#fff' }}>Central Power Grid Registry</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2d3748', color: '#718096', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px' }}>Station Node</th>
                  <th style={{ padding: '12px' }}>Power Metrics</th>
                  <th style={{ padding: '12px' }}>Slot Availability Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStations.map(station => {
                  if (!station) return null;
                  const availableSlots = station.totalSlots - station.bookedSlots;
                  const isFull = availableSlots === 0;
                  const isFrozenForMe = freezeActive && String(freezeStationId) === String(station.id);

                  // Fixed visual boundary rules: changes text color to red if availability is at critical boundary
                  const statusColor = (isFull && !isFrozenForMe) || (availableSlots === 1 && !activeBooking) ? '#ef4444' : '#00e676';

                  return (
                    <tr key={station.id} style={{ borderBottom: '1px solid #1a1b20', backgroundColor: isFrozenForMe ? 'rgba(0,230,118,0.03)' : 'transparent' }}>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ fontWeight: '600', color: '#fff', fontSize: '1rem' }}>{station.name}</span>
                        {isFrozenForMe && <span style={{ marginLeft: '8px', fontSize: '0.70rem', backgroundColor: '#00e676', color: '#0a0a0c', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>RE-BOOK LOCK HELD</span>}
                        <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '4px' }}>📍 {station.location}</div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ fontSize: '0.9rem' }}>{station.power}</div>
                        <span style={{ fontSize: '0.75rem', color: '#00e676', backgroundColor: 'rgba(0,230,118,0.1)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>{station.type}</span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '500', color: statusColor }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor, display: 'inline-block' }}></span>
                          {isFull && !isFrozenForMe ? (
                            <span>Fully Occupied ({station.bookedSlots}/{station.totalSlots})</span>
                          ) : (
                            <span>{isFrozenForMe ? availableSlots + 1 : availableSlots} of {station.totalSlots} Slots Free</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        <button 
                          onClick={() => { setSelectedStationForModal(station); setSelectedStation(station); }}
                          disabled={isFull && !isFrozenForMe && !isLoggedIn}
                          style={{ padding: '8px 14px', backgroundColor: isFull && !isFrozenForMe ? '#2d3748' : '#00e676', color: isFull && !isFrozenForMe ? '#718096' : '#0a0a0c', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          {isFrozenForMe ? (activeBooking && String(activeBooking.stationId) === String(station.id) ? 'Secured' : 'Rebook') : isFull ? 'Locked' : 'Inspect'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDE PANEL INFRASTRUCTURE MANAGEMENT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ backgroundColor: '#111216', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#fff' }}>Secure Pipeline Configuration</h3>
            {selectedStation ? (
              <div>
                <p style={{ fontSize: '0.85rem', color: '#a0aec0', marginBottom: '12px' }}>Target: <strong style={{ color: '#fff' }}>{selectedStation.name}</strong></p>
                <div style={{ background: '#1a1b20', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #2d3748' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#00e676', fontWeight: 'bold', fontSize: '0.8rem' }}>⏱️ Target Arrival:</span>
                    <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>1-Hour Standard Limit</span>
                  </div>
                </div>
                <button onClick={() => executeBooking(selectedStation)} style={{ width: '100%', padding: '10px', backgroundColor: '#00e676', color: '#0a0a0c', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                  Confirm Booking
                </button>
              </div>
            ) : (
              <div style={{ border: '2px dashed #2d3748', borderRadius: '8px', padding: '30px 20px', textAlign: 'center', color: '#718096', fontSize: '0.9rem' }}>
                Select a platform station node layout configuration to secure grid space.
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#111216', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#fff' }}>Active Node Allocation</h3>
            
            {activeBooking && (
              <div style={{ backgroundColor: isBufferPhase ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0, 230, 118, 0.04)', border: isBufferPhase ? '1px solid #ef4444' : '1px solid #00e676', padding: '15px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: isBufferPhase ? '#ef4444' : '#00e676', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  ● {isBufferPhase ? 'Penalty Buffer Active' : 'Allocation Secured'}
                </span>
                <h4 style={{ margin: '5px 0 2px 0', color: '#fff' }}>{activeBooking.stationName}</h4>
                <p style={{ margin: '0 0 15px 0', fontSize: '0.75rem', color: '#a0aec0' }}>Estimated Arrival Deadline: 60 Minutes Target Window</p>

                <div style={{ backgroundColor: '#1a1b20', border: '1px solid #2d3748', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                  {!isBufferPhase ? (
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#a0aec0', marginBottom: '2px' }}>Target Arrival Time Remaining:</span>
                      <strong style={{ fontSize: '1.1rem', color: '#00e676' }}>{formatClock(bookingTimeRemaining)}</strong>
                    </div>
                  ) : (
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold', marginBottom: '2px' }}>⚠️ Overtime Rolling Penalty Buffer:</span>
                      <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{formatClock(900 - bufferElapsedSeconds)} remaining</strong>
                      <div style={{ borderTop: '1px solid #2d3748', marginTop: '8px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: '#a0aec0' }}>Accrued Fine Balance:</span>
                        <strong style={{ color: '#ef4444' }}>₹{accruedFine}</strong>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={handleAdaptiveCancellation} style={{ width: '100%', padding: '10px', backgroundColor: isBufferPhase ? '#ef4444' : '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                  Cancel Reservation Node
                </button>
              </div>
            )}

            {freezeActive && !activeBooking && (
              <div style={{ backgroundColor: 'rgba(0, 230, 118, 0.08)', border: '1px dashed #00e676', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.3rem' }}>🛡️</span>
                <h4 style={{ margin: '5px 0', color: '#fff', fontSize: '0.9rem' }}>Priority Rebook Window Active</h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', color: '#a0aec0', lineHeight: '1.4' }}>
                  You have a 5-minute freeze window to modify or re-secure this specific slot node securely before public pool deployment.
                </p>
                <div style={{ display: 'inline-block', backgroundColor: '#00e676', color: '#0a0a0c', fontWeight: 'bold', padding: '4px 12px', borderRadius: '4px', fontSize: '0.95rem', fontFamily: 'monospace', marginBottom: '12px' }}>
                  ⏱️ Hold Lock: {formatClock(freezeTimer)}
                </div>
                
                <button 
                  type="button"
                  onClick={handleManualVoidFreeze}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                >
                  ❌ Void Advantage & Release Slot
                </button>
              </div>
            )}

            {freezeExpiredNotice && !freezeActive && !activeBooking && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px dashed #ef4444', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.3rem' }}>⚠️</span>
                <h4 style={{ margin: '5px 0', color: '#fff', fontSize: '0.9rem' }}>Priority Rebook Lock Expired</h4>
                <p style={{ margin: '0 0 0 0', fontSize: '0.75rem', color: '#a0aec0', lineHeight: '1.4' }}>
                  Slot protection dropped. Outside drivers can now intercept this registry resource path.
                </p>
              </div>
            )}

            {!activeBooking && !freezeActive && !freezeExpiredNotice && (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', textAlign: 'center', padding: '15px 0' }}>
                No active allocation configurations flagged in session memory loops.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      {showRegister && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: '#111216', border: '1px solid #00e676', borderRadius: '12px', padding: '25px', maxWidth: '540px', width: '100%', textAlign: 'left', boxShadow: '0 20px 40px rgba(0,0,0,0.8)', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>Portal Node Registration</h3>
              <button type="button" onClick={() => setShowRegister(false)} style={{ background: 'transparent', border: 'none', color: '#718096', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleRegisterSubmit} autoComplete="off">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#a0aec0', display: 'block', marginBottom: '6px' }}>Driver Full Name:</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="e.g. John Doe" 
                    value={authInput.name} 
                    onChange={handleAuthChange} 
                    required 
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', backgroundColor: '#1a1b20', border: errors.name ? '1px solid #ef4444' : '1px solid #2d3748', color: '#fff' }} 
                  />
                  {errors.name && <span style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: '5px', display: 'block' }}>{errors.name}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#a0aec0', display: 'block', marginBottom: '6px' }}>EV Registration ID:</label>
                  <input 
                    type="text" 
                    name="evNo" 
                    placeholder="e.g. TN-47-AA-1234" 
                    value={authInput.evNo} 
                    onChange={handleAuthChange} 
                    required 
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', backgroundColor: '#1a1b20', border: errors.evNo ? '1px solid #ef4444' : '1px solid #2d3748', color: '#fff' }} 
                  />
                  {errors.evNo && <span style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: '5px', display: 'block' }}>{errors.evNo}</span>}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '0.75rem', color: '#a0aec0', display: 'block', marginBottom: '6px' }}>Mobile Contact Number:</label>
                <input 
                  type="text" 
                  name="phone" 
                  placeholder="e.g. 9876543210"
                  value={authInput.phone} 
                  onChange={handleAuthChange} 
                  required 
                  maxLength={10}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', backgroundColor: '#1a1b20', border: errors.phone ? '1px solid #ef4444' : '1px solid #2d3748', color: '#fff' }} 
                />
                {errors.phone && <span style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: '5px', display: 'block' }}>{errors.phone}</span>}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '0.75rem', color: '#a0aec0', display: 'block', marginBottom: '6px' }}>Operating City Hub Node:</label>
                <input 
                  type="text" 
                  name="city" 
                  value={authInput.city} 
                  onChange={handleAuthChange} 
                  required 
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', backgroundColor: '#1a1b20', border: errors.city ? '1px solid #ef4444' : '1px solid #2d3748', color: '#fff' }} 
                />
                {errors.city && <span style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: '5px', display: 'block' }}>{errors.city}</span>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', color: '#fff', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Default Fine Collection Mode:</label>
                <div onClick={() => handlePreferenceToggle('UPI_Lockout')} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#1a1b20', padding: '12px', borderRadius: '6px', marginBottom: '10px', cursor: 'pointer', border: authInput.paymentPreference === 'UPI_Lockout' ? '2px solid #00e676' : '1px solid #2d3748' }}>
                  <div style={{ fontSize: '0.75rem' }}>
                    <strong style={{ color: '#fff', display: 'block' }}>Option 1: Over-The-Counter Cash / On-Arrival UPI Gate</strong>
                    <span style={{ color: '#a0aec0' }}>Settle accumulated buffer parameters directly at arrival destination.</span>
                  </div>
                </div>

                <div onClick={() => handlePreferenceToggle('Wallet_Auto')} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#1a1b20', padding: '12px', borderRadius: '6px', cursor: 'pointer', border: authInput.paymentPreference === 'Wallet_Auto' ? '2px solid #00e676' : '1px solid #2d3748' }}>
                  <div style={{ fontSize: '0.75rem' }}>
                    <strong style={{ color: '#fff', display: 'block' }}>Option 2: Cloud Container Wallet (Auto-Deduct)</strong>
                    <span style={{ color: '#a0aec0' }}>Processes automatic ledger settlement webhooks.</span>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isFormInvalid} style={{ width: '100%', padding: '12px', backgroundColor: isFormInvalid ? '#2d3748' : '#00e676', color: isFormInvalid ? '#718096' : '#0a0a0c', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: isFormInvalid ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}>
                Accept Agreements & Save Profile Node
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL DIAGNOSTICS MODAL */}
      {selectedStationForModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '450px', color: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#10b981' }}>⚡ Station Registry Metrics</h3>
              <button onClick={() => setSelectedStationForModal(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>HUB NAME</span>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '2px' }}>{selectedStationForModal.name}</div>
              </div>
              <div>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>LOCATION</span>
                <div style={{ fontSize: '0.95rem', marginTop: '2px' }}>{selectedStationForModal.location}</div>
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
                <div>
                  <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>POWER CAPACITY</span>
                  <div style={{ color: '#fbbf24', fontWeight: '600', marginTop: '2px' }}>{selectedStationForModal.power || '50 kW'}</div>
                </div>
                <div>
                  <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>CHARGER TYPE</span>
                  <div style={{ color: '#60a5fa', fontWeight: '600', marginTop: '2px' }}>{selectedStationForModal.type}</div>
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedStationForModal(null)} style={{ marginTop: '24px', width: '100%', backgroundColor: '#1f2937', color: '#ffffff', border: '1px solid #374151', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              Close Diagnostics
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;