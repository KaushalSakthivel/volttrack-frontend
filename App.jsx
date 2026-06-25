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
    phone: '', // Mobile number state
    city: 'Karur', 
    paymentPreference: '' 
  });

  // --- LOCAL HISTORY SUGGESTION REGISTRY ARRAYS ---
  const [pastRegistrations, setPastRegistrations] = useState([
    { name: "Kaushal Sakthivel", evNo: "TN-47-AA-1234", phone: "9876543210", city: "Karur", preference: "UPI_Lockout" },
    { name: "Sakthivel Kumar", evNo: "TN-47-B-5678", phone: "8765432109", city: "Karur", preference: "Wallet_Auto" }
  ]);

  // --- DROP-DOWN SUGGESTION VISIBILITY STATES ---
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showEvSuggestions, setShowEvSuggestions] = useState(false);
  const [selectedStationForModal, setSelectedStationForModal] = useState(null);

  // --- INLINE REAL-TIME VALIDATION ERROR STATES ---
  const [errors, setErrors] = useState({
    name: '',
    evNo: '',
    phone: '', // Mobile error state
    city: ''
  });

  // --- INTERACTIVE PORTAL STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [powerFilter, setPowerFilter] = useState('All');
  const [selectedStation, setSelectedStation] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  
  // --- REAL-TIME LIVE LIFECYCLE ENGINE TIMERS ---
  const [bookingTimeRemaining, setBookingTimeRemaining] = useState(3600); // 1 Hour standard duration
  const [isBufferPhase, setIsBufferPhase] = useState(false);
  const [bufferElapsedSeconds, setBufferElapsedSeconds] = useState(0);
  const [accruedFine, setAccruedFine] = useState(0);

  // --- EXCLUSIVE 5-MINUTE ADVANTAGE FREEZE STATES ---
  const [freezeActive, setFreezeActive] = useState(false);
  const [freezeTimer, setFreezeTimer] = useState(300); 
  const [freezeStationId, setFreezeStationId] = useState(null);
  const [freezeExpiredNotice, setFreezeExpiredNotice] = useState(false);

  // --- CENTRAL REGISTRY DATA MATRIX ---
  const [stations, setStations] = useState([]);

  const handleBookSlot = (stationId) => {
    fetch(`https://volttrack-server.onrender.com/api/stations/${stationId}/book`, {
      method: 'POST',
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => { throw new Error(err.error || "Failed to book slot.") });
        }
        return response.json();
      })
      .then((updatedData) => {
        if (updatedData.success) {
          setStations((prevStations) => 
            prevStations.map((station) => {
              if (!station) return station; // Safety check: skip null rows
              return station.id === stationId ? updatedData.updatedStation : station;
            })
          );
          alert("Slot successfully locked in memory!");
        }
      })
      .catch((error) => {
        console.error("Error booking slot:", error);
        alert(error.message || "Grid Conflict: Operational limit reached.");
      });
  };

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
            if (nextSecs >= 900) {
              alert("Telemetry Timeout: 15-Minute absolute buffer window completely exhausted. Booking dropped. Account flagged for settlement collection.");
              executeHardExpiryDrop();
            }
            setAccruedFine(Math.ceil(nextSecs / 60) * 5);
            return nextSecs;
          });
        }
      }, 1000);
    }

    return () => clearInterval(lifecycleInterval);
  }, [activeBooking, isBufferPhase]);

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
    setStations(prev => prev.map(st => {
      if (!st) return st;
      return st.id === activeBooking.stationId ? { ...st, bookedSlots: Math.max(0, st.bookedSlots - 1) } : st;
    }));
    setActiveBooking(null);
    setIsBufferPhase(false);
    setBufferElapsedSeconds(0);
    setBookingTimeRemaining(3600);
  };

  // --- MANUAL VOID INTERRUPT FOR FREEZE STATE ---
  const handleManualVoidFreeze = () => {
    if (!freezeActive) return;
    setStations(stations.map(st => {
      if (!st) return st;
      return st.id === freezeStationId ? { ...st, bookedSlots: Math.max(0, st.bookedSlots - 1) } : st;
    }));
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
        setShowNameSuggestions(true);
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
        setShowEvSuggestions(true);
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

  // --- RESPONSIVE DESELECTABLE INTERCEPTOR HANDLER ---
  const handlePreferenceToggle = (targetMode) => {
    if (authInput.paymentPreference === targetMode) {
      setAuthInput(prev => ({ ...prev, paymentPreference: '' }));
    } else {
      setAuthInput(prev => ({ ...prev, paymentPreference: targetMode }));
    }
  };

  // --- SUGGESTION POPULATE ACTION ---
  const applyPastProfileSuggestion = (profile) => {
    setAuthInput({
      name: profile.name,
      evNo: profile.evNo,
      phone: profile.phone || '',
      city: profile.city,
      paymentPreference: profile.preference
    });
    setErrors({ name: '', evNo: '', phone: '', city: '' });
    setShowNameSuggestions(false);
    setShowEvSuggestions(false);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    
    if (errors.name || errors.evNo || errors.phone || errors.city || !authInput.paymentPreference) {
      alert("Registration Denied: Please reconcile all highlighted operational telemetry faults first.");
      return;
    }

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
      .then(data => {
        setCurrentUser(savedRecord);
        setIsLoggedIn(true);
        setShowRegister(false);
      })
      .catch(err => console.error("Error saving user registration:", err));
  };

  const handleMockLogin = () => {
    setCurrentUser({ name: "Guest Driver", evNo: "TN-47-XX-9999", phone: "9474747474", city: "Karur", preference: "UPI_Lockout" });
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
      alert("Security Protocol: Registration node missing. Please Sign In or Create an Account at the top right.");
      return;
    }
    if (activeBooking) {
      alert("Grid Conflict: You already hold an active station reservation slot.");
      return;
    }
    if (freezeActive && freezeStationId !== station.id) {
      alert("System Lockout: Another profile's active freeze advantage is protecting this specific node pipeline.");
      return;
    }

    fetch(`https://volttrack-server.onrender.com/api/stations/${station.id}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStations(stations.map(st => st && st.id === station.id ? data.updatedStation : st));
          
          setActiveBooking({
            stationId: station.id,
            stationName: station.name,
            location: station.location,
            timeReserved: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          
          setBookingTimeRemaining(3600);
          setIsBufferPhase(false);
          setBufferElapsedSeconds(0);
          setAccruedFine(0);
          setSelectedStation(null);
        } else {
          alert("Grid Sync Refused: " + (data.error || "Unknown allocation mismatch."));
        }
      })
      .catch(err => {
        console.error("Booking loop network telemetry fault:", err);
        alert("Connection Error: Could not sync reservation to grid telemetry.");
      });
  };
  
  // --- ADAPTIVE CONTEXTUAL CANCELLATION CONTROLLER ---
  const handleAdaptiveCancellation = () => {
    if (!activeBooking) return;

    if (!isBufferPhase) {
      setFreezeStationId(activeBooking.stationId);
      setFreezeTimer(300); 
      setFreezeExpiredNotice(false);
      setFreezeActive(true);
      alert("Core Window Cancellation Confirmed: Your 5-Minute Freeze Time has started. No outside vehicle can secure this slot until your countdown timer expires.");
    } else {
      setStations(stations.map(st => {
        if (!st) return st;
        return st.id === activeBooking.stationId ? { ...st, bookedSlots: Math.max(0, st.bookedSlots - 1) } : st;
      }));
      
      const selectedPrefText = currentUser?.preference === 'Wallet_Auto' 
        ? "Linked Integrated Digital Wallet (Auto-Deduct)" 
        : "UPI Gateway Settlement / Manual On-Arrival Over-The-Counter";

      alert(`Buffer Penalty Settlement Mandate:\n\n` +
            `Since you cancelled during the active buffer window, you must settle the accrued fine of ₹${accruedFine}.\n\n` +
            `Transaction Processing Route Authorized: ${selectedPrefText} as configured during your profile node registration setup.\n\n` +
            `Note: The 5-Minute Freeze advantage is voided. Slot is now exposed to the public pool.`);
    }

    setActiveBooking(null);
  };

  // --- CENTRAL FILTER LOGIC ENGINE ---
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
              <button onClick={handleOpenRegistrationWindow} style={{ backgroundColor: '#00e676', color: '#0a0a0c', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Register Node</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}>EV Node Bound: <strong style={{ color: '#00e676' }}>{currentUser?.evNo} ({currentUser?.city})</strong></span>
              <button onClick={() => { setIsLoggedIn(false); setActiveBooking(null); setFreezeActive(false); }} style={{ background: '#1f2937', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Disconnect</button>
            </div>
          )}
        </div>
      </nav>

      {/* DISCLAIMERS COHORT HEADER */}
      <div style={{ backgroundColor: '#111216', border: '1px solid #1f2937', padding: '25px', borderRadius: '12px', marginBottom: '30px', textAlign: 'left' }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: '1.3rem', color: '#fff' }}>Welcome to the VoltTrack Infrastructure Network</h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#a0aec0', maxWidth: '800px' }}>
          Providing intelligent, real-time localized charging node optimization pathways for clean electric mobility fleets across the Karur region.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem', borderTop: '1px solid #1a1b20', paddingTop: '15px' }}>
          <div style={{ lineHeight: '1.5', color: '#718096' }}>
            <strong style={{ color: '#ef4444', display: 'inline-block', marginRight: '6px' }}>🚨 DISCLAIMER 1 (ARRIVAL TIMEFRAME):</strong> 
            All station reservations trigger a fixed 1-Hour operational target arrival slot window. If arrival conditions are delayed, a strict <strong>15-Minute maximum dynamic buffer countdown</strong> will initialize. Fines accrue per-minute during this phase. Unused buffer timers drop allocation automatically.
          </div>
          
          <div style={{ lineHeight: '1.5', color: '#718096' }}>
            <strong style={{ color: '#00e676', display: 'inline-block', marginRight: '6px' }}>💎 DISCLAIMER 2 (ADVANTAGE POLICY CLAUSE):</strong> 
            Cancelling your reservation within your 1-Hour Core Window triggers an exclusive <strong>5-Minute Freeze Advantage</strong>, locking that specific slot to your profile for seamless re-booking. If you enter the 15-Minute Dynamic Buffer Countdown Phase, the freeze advantage is completely forfeited.
          </div>
        </div>
      </div>

      {/* RESPONSIVE LAYOUT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', textAlign: 'left' }}>
        
        {/* LEFT COLUMN COMPONENTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ backgroundColor: '#111216', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Filter via highway corridor, hub name, or localized landmark locations..." 
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
                  const isFrozenForMe = freezeActive && freezeStationId === station.id;

                  return (
                    <tr key={station.id} style={{ borderBottom: '1px solid #1a1b20', backgroundColor: isFrozenForMe ? 'rgba(0,230,118,0.03)' : 'transparent' }}>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ fontWeight: '600', color: '#fff', fontSize: '1rem' }}>{station.name}</span>
                        {isFrozenForMe && <span style={{ marginLeft: '8px', fontSize: '0.7rem', backgroundColor: '#00e676', color: '#0a0a0c', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>RE-BOOK LOCK HELD</span>}
                        <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '4px' }}>📍 {station.location}</div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ fontSize: '0.9rem' }}>{station.power}</div>
                        <span style={{ fontSize: '0.75rem', color: '#00e676', backgroundColor: 'rgba(0,230,118,0.1)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>{station.type}</span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '500', color: isFull ? '#ef4444' : '#00e676' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isFull ? '#ef4444' : '#00e676', display: 'inline-block' }}></span>
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
                          disabled={isFull && !isFrozenForMe}
                          style={{ padding: '8px 14px', backgroundColor: isFull && !isFrozenForMe ? '#2d3748' : '#00e676', color: isFull && !isFrozenForMe ? '#718096' : '#0a0a0c', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: isFull && !isFrozenForMe ? 'not-allowed' : 'pointer' }}
                        >
                          {/* CONTEXTUAL STATE LABEL RE-STABILIZATION LOGIC */}
                          {isFrozenForMe ? (activeBooking && activeBooking.stationId == station.id ? 'Secured' : 'Rebook') : isFull ? 'Locked' : 'Inspect'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT CONTROL SIDEBAR FEED */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ backgroundColor: '#111216', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#fff' }}>Secure Telemetry Tunnel</h3>
            {selectedStation ? (
              <div>
                <p style={{ fontSize: '0.85rem', color: '#a0aec0', marginBottom: '12px' }}>Target Node: <strong style={{ color: '#fff' }}>{selectedStation.name}</strong></p>
                <div style={{ background: '#1a1b20', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #2d3748' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#00e676', fontWeight: 'bold', fontSize: '0.8rem' }}>⏱️ Core Window:</span>
                    <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>1-Hour Base Route</span>
                  </div>
                </div>
                <button onClick={() => executeBooking(selectedStation)} style={{ width: '100%', padding: '10px', backgroundColor: '#00e676', color: '#0a0a0c', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                  Confirm IoT Allocation
                </button>
              </div>
            ) : (
              <div style={{ border: '2px dashed #2d3748', borderRadius: '8px', padding: '30px 20px', textAlign: 'center', color: '#718096', fontSize: '0.9rem' }}>
                Select an available station node layout configuration to lock in localized telemetry pathways.
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#111216', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#fff' }}>Active Node Allocation</h3>
            
            {activeBooking && (
              <div style={{ backgroundColor: isBufferPhase ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0, 230, 118, 0.04)', border: isBufferPhase ? '1px solid #ef4444' : '1px solid #00e676', padding: '15px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: isBufferPhase ? '#ef4444' : '#00e676', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  ● {isBufferPhase ? 'Penalty Buffer Phase Active' : 'Allocation Secured'}
                </span>
                <h4 style={{ margin: '5px 0 2px 0', color: '#fff' }}>{activeBooking.stationName}</h4>
                <p style={{ margin: '0 0 15px 0', fontSize: '0.75rem', color: '#a0aec0' }}>IoT Handshake: {activeBooking.timeReserved}</p>

                <div style={{ backgroundColor: '#1a1b20', border: '1px solid #2d3748', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                  {!isBufferPhase ? (
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#a0aec0', marginBottom: '2px' }}>Simulated Core Arrival Time Left:</span>
                      <strong style={{ fontSize: '1.1rem', color: '#00e676' }}>{formatClock(bookingTimeRemaining)}</strong>
                    </div>
                  ) : (
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold', marginBottom: '2px' }}>⚠️ 15-Min Overtime Buffer Count:</span>
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
                <h4 style={{ margin: '5px 0', color: '#fff', fontSize: '0.9rem' }}>Exclusive 5-Minute Free Window Active</h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', color: '#a0aec0', lineHeight: '1.4' }}>
                  You have a 5-minute free time window to rebook this slot. The system has securely locked this station profile for your account.
                </p>
                <div style={{ display: 'inline-block', backgroundColor: '#00e676', color: '#0a0a0c', fontWeight: 'bold', padding: '4px 12px', borderRadius: '4px', fontSize: '0.95rem', fontFamily: 'monospace', marginBottom: '12px' }}>
                  ⏱️ Hold Lock: {formatClock(freezeTimer)}
                </div>
                
                <button 
                  type="button"
                  onClick={handleManualVoidFreeze}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                >
                  ❌ Void Freeze Advantage & Release Slot
                </button>
              </div>
            )}

            {freezeExpiredNotice && !freezeActive && !activeBooking && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px dashed #ef4444', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.3rem' }}>⚠️</span>
                <h4 style={{ margin: '5px 0', color: '#fff', fontSize: '0.9rem' }}>Your Free Time Window Has Expired</h4>
                <p style={{ margin: '0 0 0 0', fontSize: '0.75rem', color: '#a0aec0', lineHeight: '1.4' }}>
                  We cannot guarantee priority slot protection anymore. Outside drivers can now intercept this resource pool. If you still require allocation path access, please select a node and rebook manually.
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

      {/* FIXED VIEWPORT SCROLLING REGISTRATION MODAL */}
      {showRegister && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: '#111216', border: '1px solid #00e676', borderRadius: '12px', padding: '25px', maxWidth: '540px', width: '100%', textAlign: 'left', boxShadow: '0 20px 40px rgba(0,0,0,0.8)', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>Portal Node Registration Setup</h3>
              <button type="button" onClick={() => setShowRegister(false)} style={{ background: 'transparent', border: 'none', color: '#718096', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ backgroundColor: '#1a271c', border: '1px solid #00e676', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.75rem', color: '#a0aec0', lineHeight: '1.4' }}>
              <strong style={{ color: '#00e676', display: 'block', marginBottom: '2px' }}>🛡️ Registration Settlement Mandate:</strong>
              Account registration requires establishing a default settlement route. These channels manage structural penalties if arrival tracking exceeds core limits and drifts into the rolling buffer countdown.
            </div>

            <form onSubmit={handleRegisterSubmit} autoComplete="off">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                
                {/* FIELD 1: DRIVER NAME CONTAINER */}
                <div style={{ position: 'relative' }}>
                  <label style={{ fontSize: '0.75rem', color: '#a0aec0', display: 'block', marginBottom: '6px' }}>Driver Full Name:</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="e.g. John Doe" 
                    value={authInput.name} 
                    onChange={handleAuthChange} 
                    onFocus={() => setShowNameSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowNameSuggestions(false), 250)}
                    required 
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', backgroundColor: '#1a1b20', border: errors.name ? '1px solid #ef4444' : '1px solid #2d3748', color: '#fff' }} 
                  />
                  {errors.name ? (
                    <span style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: '5px', display: 'block', fontWeight: '500' }}>{errors.name}</span>
                  ) : (
                    <span style={{ fontSize: '0.65rem', color: '#718096', marginTop: '4px', display: 'block' }}>Letters only. Symbols/Numbers blocked.</span>
                  )}

                  {showNameSuggestions && pastRegistrations.length > 0 && (
                    <div style={{ position: 'absolute', top: '65px', left: 0, right: 0, backgroundColor: '#1a1b20', border: '1px solid #2d3748', borderRadius: '6px', zIndex: 1100, maxHeight: '120px', overflowY: 'auto' }}>
                      <span style={{ display: 'block', padding: '6px 10px', fontSize: '0.65rem', color: '#718096', borderBottom: '1px solid #2d3748' }}>PAST REGISTERED PROFILES</span>
                      {pastRegistrations.map((profile, index) => (
                        <div key={index} onMouseDown={() => applyPastProfileSuggestion(profile)} style={{ padding: '8px 10px', fontSize: '0.75rem', color: '#fff', cursor: 'pointer', borderBottom: '1px solid #111216' }}>{profile.name} ({profile.evNo})</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* FIELD 2: EV ID CONTAINER */}
                <div style={{ position: 'relative' }}>
                  <label style={{ fontSize: '0.75rem', color: '#a0aec0', display: 'block', marginBottom: '6px' }}>EV Registration ID:</label>
                  <input 
                    type="text" 
                    name="evNo" 
                    placeholder="e.g. TN-47-AA-1234" 
                    value={authInput.evNo} 
                    onChange={handleAuthChange} 
                    onFocus={() => setShowEvSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowEvSuggestions(false), 250)}
                    required 
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', backgroundColor: '#1a1b20', border: errors.evNo ? '1px solid #ef4444' : '1px solid #2d3748', color: '#fff' }} 
                  />
                  {errors.evNo ? (
                    <span style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: '5px', display: 'block', fontWeight: '500' }}>{errors.evNo}</span>
                  ) : (
                    <span style={{ fontSize: '0.65rem', color: '#718096', marginTop: '4px', display: 'block' }}>Format example: TN-47-AA-1234</span>
                  )}

                  {showEvSuggestions && pastRegistrations.length > 0 && (
                    <div style={{ position: 'absolute', top: '65px', left: 0, right: 0, backgroundColor: '#1a1b20', border: '1px solid #2d3748', borderRadius: '6px', zIndex: 1100, maxHeight: '120px', overflowY: 'auto' }}>
                      <span style={{ display: 'block', padding: '6px 10px', fontSize: '0.65rem', color: '#718096', borderBottom: '1px solid #2d3748' }}>PAST EV RECORDS</span>
                      {pastRegistrations.map((profile, index) => (
                        <div key={index} onMouseDown={() => applyPastProfileSuggestion(profile)} style={{ padding: '8px 10px', fontSize: '0.75rem', color: '#fff', cursor: 'pointer', borderBottom: '1px solid #111216' }}>{profile.evNo} - {profile.name}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* FIELD 3: MOBILE TELEPHONE CONTACT FIELD */}
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
                {errors.phone ? (
                  <span style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: '5px', display: 'block', fontWeight: '500' }}>{errors.phone}</span>
                ) : (
                  <span style={{ fontSize: '0.65rem', color: '#718096', marginTop: '4px', display: 'block' }}>10-digit mobile line database profile entry (digits starting with 6-9).</span>
                )}
              </div>

              {/* FIELD 4: HUB CITY CONTAINER */}
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
                {errors.city ? (
                  <span style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: '5px', display: 'block', fontWeight: '500' }}>{errors.city}</span>
                ) : (
                  <span style={{ fontSize: '0.65rem', color: '#718096', marginTop: '4px', display: 'block' }}>Identifies your regional operating zone. Alphabet characters only.</span>
                )}
              </div>

              {/* FIELD 5: CUSTOM PAYMENT TOGGLES */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', color: '#fff', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Default Fine Collection Mode (Click active option to completely deselect):</label>
                
                {/* OPTION CARD 1 */}
                <div onClick={() => handlePreferenceToggle('UPI_Lockout')} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#1a1b20', padding: '12px', borderRadius: '6px', marginBottom: '10px', cursor: 'pointer', border: authInput.paymentPreference === 'UPI_Lockout' ? '2px solid #00e676' : '1px solid #2d3748', transition: 'border 0.15s ease' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #2d3748', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '3px', backgroundColor: authInput.paymentPreference === 'UPI_Lockout' ? '#00e676' : 'transparent' }}>
                    {authInput.paymentPreference === 'UPI_Lockout' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0a0a0c' }} />}
                  </div>
                  <div style={{ fontSize: '0.75rem' }}>
                    <strong style={{ color: '#fff', display: 'block' }}>Option 1: Over-The-Counter Cash / On-Arrival UPI Gate</strong>
                    <span style={{ color: '#a0aec0' }}>Pay accumulated buffer penalties directly upon destination entry or instantly via localized UPI links.</span>
                  </div>
                </div>

                {/* OPTION CARD 2 */}
                <div onClick={() => handlePreferenceToggle('Wallet_Auto')} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#1a1b20', padding: '12px', borderRadius: '6px', cursor: 'pointer', border: authInput.paymentPreference === 'Wallet_Auto' ? '2px solid #00e676' : '1px solid #2d3748', transition: 'border 0.15s ease' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #2d3748', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '3px', backgroundColor: authInput.paymentPreference === 'Wallet_Auto' ? '#00e676' : 'transparent' }}>
                    {authInput.paymentPreference === 'Wallet_Auto' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0a0a0c' }} />}
                  </div>
                  <div style={{ fontSize: '0.75rem' }}>
                    <strong style={{ color: '#fff', display: 'block' }}>Option 2: Cloud Container Wallet (Auto-Deduct)</strong>
                    <span style={{ color: '#a0aec0' }}>Authorizes backend system webhooks to instantly process transaction logs and debit balances securely from linked digital accounts automatically.</span>
                  </div>
                </div>
              </div>

              {/* ACTION SUBMIT GATING BUTTON */}
              <button 
                type="submit" 
                disabled={isFormInvalid}
                style={{ width: '100%', padding: '12px', backgroundColor: isFormInvalid ? '#2d3748' : '#00e676', color: isFormInvalid ? '#718096' : '#0a0a0c', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: isFormInvalid ? 'not-allowed' : 'pointer', fontSize: '0.9rem', transition: 'background-color 0.2s' }}
              >
                {isFormInvalid ? "Resolve Validation Fields & Select Payment Mode to Enable" : "Accept Agreements & Save Profile Node"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL STATION DETAILS OVERLAY MODAL */}
      {selectedStationForModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '450px',
            color: '#ffffff',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#10b981' }}>⚡ Station Telemetry</h3>
              <button 
                onClick={() => setSelectedStationForModal(null)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
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

            <button 
              onClick={() => setSelectedStationForModal(null)}
              style={{
                marginTop: '24px',
                width: '100%',
                backgroundColor: '#1f2937',
                color: '#ffffff',
                border: '1px solid #374151',
                padding: '10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Close Diagnostics
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;