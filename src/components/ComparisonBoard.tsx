"use client";

import { useState } from 'react';
import type { CarMatch, QuizAnswers } from '@/types';

interface ComparisonBoardProps {
  cars: CarMatch[];
  quizAnswers: QuizAnswers | null;
  onClose: () => void;
  onRemove: (carId: string) => void;
}

function calculate5YearFuelCost(fuelType: string): number {
  const annualKm = 15000;
  const years = 5;
  const totalKm = annualKm * years;
  
  switch (fuelType) {
    case 'Electric':
      return totalKm * 0.04; // $3,000
    case 'Hybrid':
      return totalKm * 0.08; // $6,000
    case 'Diesel':
      return totalKm * 0.12; // $9,000
    case 'Petrol':
    default:
      return totalKm * 0.14; // $10,500
  }
}

export default function ComparisonBoard({ cars, quizAnswers, onClose, onRemove }: ComparisonBoardProps) {
  const [showToast, setShowToast] = useState(false);

  const handleShare = () => {
    const ids = cars.map((c) => c.id).join(',');
    const url = `${window.location.origin}${window.location.pathname}?shortlist=${ids}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    });
  };

  if (cars.length === 0) {
    return (
      <div className="comparison-overlay">
        <div className="comparison-container" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>No cars selected for comparison</h2>
          <button className="button" style={{ marginTop: '2rem' }} onClick={onClose}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Determine winners
  const prices = cars.map((c) => c.price);
  const minPrice = Math.min(...prices);

  const safeties = cars.map((c) => c.safetyRating);
  const maxSafety = Math.max(...safeties);

  const ranges = cars.map((c) => c.rangeKm);
  const maxRange = Math.max(...ranges);

  const accelerations = cars.map((c) => c.acceleration);
  const minAcceleration = Math.min(...accelerations);

  const comfortScores = cars.map((c) => c.comfort);
  const maxComfort = Math.max(...comfortScores);

  const reliabilityScores = cars.map((c) => c.reliability);
  const maxReliability = Math.max(...reliabilityScores);

  const seatsList = cars.map((c) => c.seats);
  const maxSeats = Math.max(...seatsList);

  const hasCompare = cars.length > 1;

  // Confidence advisor alerts generator
  const getAdvisorNotes = (car: CarMatch) => {
    const notes: { type: 'success' | 'warning' | 'info'; text: string }[] = [];

    if (!quizAnswers) {
      notes.push({ type: 'info', text: 'Complete the quiz to get personalized advisor trade-off reviews.' });
      return notes;
    }

    // Budget check
    if (car.price <= quizAnswers.budget) {
      const savings = quizAnswers.budget - car.price;
      if (savings > 0) {
        notes.push({ type: 'success', text: `💰 Saves \$${savings.toLocaleString()} compared to your max budget.` });
      } else {
        notes.push({ type: 'success', text: '✅ Hits your budget target perfectly.' });
      }
    } else {
      const over = car.price - quizAnswers.budget;
      notes.push({ type: 'warning', text: `⚠️ Exceeds budget by \$${over.toLocaleString()}.` });
    }

    // Seating check
    if (car.seats >= quizAnswers.seats) {
      notes.push({ type: 'success', text: `👥 Seats ${car.seats} people (meets target of ${quizAnswers.seats}).` });
    } else {
      const diff = quizAnswers.seats - car.seats;
      notes.push({ type: 'warning', text: `⚠️ Under-capacity: Missing ${diff} seats relative to your goal.` });
    }

    // Category check
    if (car.category === quizAnswers.category) {
      notes.push({ type: 'success', text: `🎯 Matches preferred style: ${car.category}.` });
    }

    // Priority checks
    if (quizAnswers.priorities.safety >= 8) {
      if (car.safetyRating >= 4.8) {
        notes.push({ type: 'success', text: '🛡️ Top-tier Safety: Matches your strict crash-test priority.' });
      } else if (car.safetyRating < 4.5) {
        notes.push({ type: 'warning', text: `⚠️ Safety is only ${car.safetyRating}/5, which is lower than requested.` });
      }
    }

    if (quizAnswers.priorities.economy >= 8) {
      if (car.fuelType === 'Electric' || car.fuelType === 'Hybrid') {
        notes.push({ type: 'success', text: '🍀 Eco Champion: Fuel setup aligns with your high economy focus.' });
      } else {
        notes.push({ type: 'warning', text: `⚠️ Traditional ${car.fuelType} engine will increase long-term fuel costs.` });
      }
    }

    if (quizAnswers.priorities.performance >= 8) {
      if (car.acceleration <= 5.5) {
        notes.push({ type: 'success', text: `⚡ Performance: Blazing 0-100 km/h in ${car.acceleration}s.` });
      } else if (car.acceleration >= 8.5) {
        notes.push({ type: 'warning', text: `⚠️ Performance is mild: 0-100 takes ${car.acceleration}s.` });
      }
    }

    if (quizAnswers.priorities.comfort >= 8) {
      if (car.comfort >= 9) {
        notes.push({ type: 'success', text: '🛋️ Executive Comfort: Highly insulated cabin fits your request.' });
      } else if (car.comfort < 8) {
        notes.push({ type: 'warning', text: `⚠️ Comfort index is ${car.comfort}/10 (lower priority match).` });
      }
    }

    return notes;
  };

  return (
    <div className="comparison-overlay">
      {showToast && <div className="toast">🔗 Share link copied to clipboard!</div>}
      
      <div className="comparison-container">
        <div className="comparison-header">
          <div>
            <p className="listing-label">Confidence Engine</p>
            <h1 className="page-title">Side-by-Side Comparison</h1>
            <p className="page-copy" style={{ marginTop: '0.25rem' }}>
              Compare specifications, long-term costs, and advisor warnings to confidently choose your next car.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="button" onClick={handleShare}>
              📤 Share Shortlist
            </button>
            <button className="button" style={{ background: 'rgba(255,255,255,0.08)' }} onClick={onClose}>
              Close Compare
            </button>
          </div>
        </div>

        {/* Dynamic Column Grid */}
        <div 
          className="comparison-grid-cols" 
          style={{ gridTemplateColumns: `repeat(${cars.length + 1}, minmax(0, 1fr))` }}
        >
          {/* Attributes Labels Column */}
          <div className="comparison-card" style={{ background: 'transparent', borderColor: 'transparent', justifyContent: 'center' }}>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', height: '60px', display: 'flex', alignItems: 'center' }}>Specs</div>
            <div className="divider" />
            <div className="input-label" style={{ height: '35px', display: 'flex', alignItems: 'center' }}>Price</div>
            <div className="input-label" style={{ height: '35px', display: 'flex', alignItems: 'center' }}>Safety Rating</div>
            <div className="input-label" style={{ height: '35px', display: 'flex', alignItems: 'center' }}>Fuel Type</div>
            <div className="input-label" style={{ height: '35px', display: 'flex', alignItems: 'center' }}>Seats</div>
            <div className="input-label" style={{ height: '35px', display: 'flex', alignItems: 'center' }}>Fuel Range</div>
            <div className="input-label" style={{ height: '35px', display: 'flex', alignItems: 'center' }}>Acceleration (0-100)</div>
            <div className="input-label" style={{ height: '35px', display: 'flex', alignItems: 'center' }}>Comfort Level</div>
            <div className="input-label" style={{ height: '35px', display: 'flex', alignItems: 'center' }}>Reliability</div>
            <div className="input-label" style={{ height: '35px', display: 'flex', alignItems: 'center' }}>Cargo Vol</div>
          </div>

          {/* Cars Columns */}
          {cars.map((car) => {
            const isPriceWinner = hasCompare && car.price === minPrice;
            const isSafetyWinner = hasCompare && car.safetyRating === maxSafety;
            const isRangeWinner = hasCompare && car.rangeKm === maxRange;
            const isAccelWinner = hasCompare && car.acceleration === minAcceleration;
            const isComfortWinner = hasCompare && car.comfort === maxComfort;
            const isReliabilityWinner = hasCompare && car.reliability === maxReliability;
            const isSeatsWinner = hasCompare && car.seats === maxSeats;

            return (
              <div key={car.id} className="comparison-card highlighted">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: '60px' }}>
                  <div>
                    <span className="listing-label" style={{ fontSize: '0.75rem' }}>{car.category}</span>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{car.make} {car.model}</h3>
                  </div>
                  <button 
                    className="tab-button" 
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: 'rgba(239,68,68,0.1)' }}
                    onClick={() => onRemove(car.id)}
                  >
                    × Remove
                  </button>
                </div>
                
                <div className="divider" />
                
                {/* Price */}
                <div className={`compare-cell-winner`} style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isPriceWinner ? '0 0.5rem' : '0' }}>
                  <span style={{ fontWeight: 600, color: 'var(--blue)' }}>${car.price.toLocaleString()}</span>
                  {isPriceWinner && <span className="winner-badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Lowest</span>}
                </div>

                {/* Safety */}
                <div className={`compare-cell-winner`} style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isSafetyWinner ? '0 0.5rem' : '0' }}>
                  <span style={{ fontWeight: 600 }}>⭐ {car.safetyRating}/5</span>
                  {isSafetyWinner && <span className="winner-badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Safest</span>}
                </div>

                {/* Fuel */}
                <div style={{ height: '35px', display: 'flex', alignItems: 'center' }}>
                  <span>{car.fuelType}</span>
                </div>

                {/* Seats */}
                <div className={`compare-cell-winner`} style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isSeatsWinner ? '0 0.5rem' : '0' }}>
                  <span>{car.seats} Adults</span>
                  {isSeatsWinner && <span className="winner-badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Max Seats</span>}
                </div>

                {/* Range */}
                <div className={`compare-cell-winner`} style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isRangeWinner ? '0 0.5rem' : '0' }}>
                  <span>{car.rangeKm} km</span>
                  {isRangeWinner && <span className="winner-badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Max Range</span>}
                </div>

                {/* Acceleration */}
                <div className={`compare-cell-winner`} style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isAccelWinner ? '0 0.5rem' : '0' }}>
                  <span>{car.acceleration}s</span>
                  {isAccelWinner && <span className="winner-badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Fastest</span>}
                </div>

                {/* Comfort */}
                <div className={`compare-cell-winner`} style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isComfortWinner ? '0 0.5rem' : '0' }}>
                  <span>{car.comfort}/10</span>
                  {isComfortWinner && <span className="winner-badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Plush</span>}
                </div>

                {/* Reliability */}
                <div className={`compare-cell-winner`} style={{ height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isReliabilityWinner ? '0 0.5rem' : '0' }}>
                  <span>{car.reliability}/10</span>
                  {isReliabilityWinner && <span className="winner-badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Durable</span>}
                </div>

                {/* Cargo */}
                <div style={{ height: '35px', display: 'flex', alignItems: 'center' }}>
                  <span>{car.luggage}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5-Year Total Cost of Ownership Calculator Section */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>💰 5-Year Estimated Cost of Ownership</h3>
          <p className="page-copy" style={{ marginBottom: '1.5rem' }}>
            Calculated assuming an average of 15,000 km driven annually. Total cost represents the upfront purchase price plus estimated 5-year fuel/charging expenses.
          </p>

          <div className="grid-cards">
            {cars.map((car) => {
              const fuelCost = calculate5YearFuelCost(car.fuelType);
              const totalCost = car.price + fuelCost;
              const maxPossibleCost = 55000 + 10500; // max purchase + max fuel
              const percentage = (totalCost / maxPossibleCost) * 100;
              
              return (
                <div key={car.id} className="card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1.1rem' }}>{car.make} {car.model}</h4>
                    <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--blue)' }}>
                      ${totalCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="slider-row" style={{ gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span className="input-label">Purchase Price:</span>
                      <span>${car.price.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span className="input-label">5-Yr Fuel/Energy Cost:</span>
                      <span>${fuelCost.toLocaleString()} ({car.fuelType})</span>
                    </div>
                  </div>

                  <div className="progress-track" style={{ marginTop: '1rem', height: '10px' }}>
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${percentage}%`,
                        background: car.fuelType === 'Electric' 
                          ? 'linear-gradient(90deg, var(--emerald), #10b981)' 
                          : car.fuelType === 'Hybrid'
                          ? 'linear-gradient(90deg, #10b981, var(--blue))'
                          : 'linear-gradient(90deg, var(--blue), var(--indigo))'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confidence Advisor Analysis */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>🎯 CarMatch Confidence Advisor Report</h3>
          <p className="page-copy" style={{ marginBottom: '1.5rem' }}>
            Personalized alignment checks matching these models against your quiz answers.
          </p>

          <div className="grid-2" style={{ gap: '1.5rem' }}>
            {cars.map((car) => {
              const notes = getAdvisorNotes(car);
              return (
                <div key={car.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <h4 style={{ fontSize: '1.15rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                    {car.make} {car.model} Advisor Insights
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {notes.map((note, index) => {
                      let color = 'var(--text)';
                      let bg = 'rgba(255,255,255,0.02)';
                      let border = 'rgba(255,255,255,0.06)';
                      let icon = (
                        <svg style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      );

                      if (note.type === 'success') {
                        color = '#34d399';
                        bg = 'rgba(16, 185, 129, 0.05)';
                        border = 'rgba(16, 185, 129, 0.15)';
                        icon = (
                          <svg style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        );
                      } else if (note.type === 'warning') {
                        color = '#fbbf24';
                        bg = 'rgba(245, 158, 11, 0.05)';
                        border = 'rgba(245, 158, 11, 0.15)';
                        icon = (
                          <svg style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        );
                      }

                      return (
                        <div 
                          key={index} 
                          style={{ 
                            padding: '0.75rem 1rem', 
                            borderRadius: '12px', 
                            fontSize: '0.88rem', 
                            color, 
                            background: bg,
                            border: `1px solid ${border}`,
                            lineHeight: 1.4,
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'flex-start'
                          }}
                        >
                          {icon}
                          <span>{note.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
