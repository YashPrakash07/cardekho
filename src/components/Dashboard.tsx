"use client";

import { useMemo, useState } from 'react';
import type { CarMatch, Category, FuelType } from '@/types';

interface DashboardProps {
  recommendations: CarMatch[];
  shortlistIds: Set<string>;
  onSelectCar: (car: CarMatch) => void;
  onToggleShortlist: (carId: string) => void;
  onRunNewQuiz: () => void;
  loading: boolean;
  error: string | null;
  compareCarIds: string[];
  onToggleCompareCar: (carId: string) => void;
  onOpenCompare: () => void;
}

const categoryFilters: (Category | 'All')[] = ['All', 'Sedan', 'Hatchback', 'SUV', 'Coupe', 'MPV', 'Pickup', 'EV'];
const fuelFilters: (FuelType | 'All')[] = ['All', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];

export default function Dashboard({
  recommendations,
  shortlistIds,
  onSelectCar,
  onToggleShortlist,
  onRunNewQuiz,
  loading,
  error,
  compareCarIds,
  onToggleCompareCar,
  onOpenCompare,
}: DashboardProps) {
  const [categoryFilter, setCategoryFilter] = useState<'All' | Category>('All');
  const [fuelFilter, setFuelFilter] = useState<'All' | FuelType>('All');

  const filtered = useMemo(
    () =>
      recommendations.filter((car) =>
        (categoryFilter === 'All' || car.category === categoryFilter) &&
        (fuelFilter === 'All' || car.fuelType === fuelFilter)
      ),
    [recommendations, categoryFilter, fuelFilter]
  );

  return (
    <section style={{ position: 'relative' }}>
      <div className="card grid-2" style={{ alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <p className="listing-label">Matchmaking dashboard</p>
          <h2>Recommended cars for your profile</h2>
          <p className="page-copy" style={{ marginTop: '0.25rem' }}>
            Filter, compare, and shortlist the cars that best fit your preferences. Select 2 or more to compare.
          </p>
        </div>
        <div className="card-actions" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="button" onClick={onRunNewQuiz}>
            ✏️ Edit quiz
          </button>
          {compareCarIds.length >= 2 ? (
            <button className="button" style={{ background: 'linear-gradient(135deg, var(--emerald) 0%, var(--blue) 100%)', fontWeight: 600 }} onClick={onOpenCompare}>
              📊 Compare Selected ({compareCarIds.length})
            </button>
          ) : null}
        </div>
      </div>

      <div className="control-list" style={{ margin: '1.5rem 0' }}>
        <div className="input-group">
          <label className="input-label">Filter Category</label>
          <select className="select-field" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as any)}>
            {categoryFilters.map((option) => (
              <option key={option} value={option}>
                {option === 'All' ? 'All Car Types' : option}
              </option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Filter Fuel Type</label>
          <select className="select-field" value={fuelFilter} onChange={(event) => setFuelFilter(event.target.value as any)}>
            {fuelFilters.map((option) => (
              <option key={option} value={option}>
                {option === 'All' ? 'All Fuel Types' : option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="page-copy">Analyzing dataset and matching preferences…</p>
        </div>
      ) : error ? (
        <div className="card" style={{ borderColor: 'var(--warning)', padding: '2rem' }}>
          <p style={{ color: 'var(--warning)' }}>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="page-copy">No matches found for these filters. Try broadening the filter settings or adjust the quiz.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {filtered.map((car, index) => {
            const isShortlisted = shortlistIds.has(car.id);
            const isComparing = compareCarIds.includes(car.id);

            // Match category colors to indicator dot styles
            let dotClass = 'dot-sedan';
            if (car.category === 'EV' || car.fuelType === 'Hybrid') dotClass = 'dot-ev';
            else if (car.category === 'SUV') dotClass = 'dot-suv';
            else if (car.category === 'Coupe') dotClass = 'dot-coupe';
            else if (car.category === 'MPV') dotClass = 'dot-mpv';
            else if (car.category === 'Hatchback') dotClass = 'dot-hatchback';
            else if (car.category === 'Pickup') dotClass = 'dot-pickup';

            const isBestMatch = index === 0 && car.score >= 80;
            const bestMatchClass = isBestMatch ? 'card-best-match' : '';

            return (
              <article 
                key={car.id} 
                className={`card ${bestMatchClass}`} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  position: 'relative', 
                  overflow: 'hidden',
                  borderRadius: '20px',
                  borderWidth: isBestMatch ? '1px' : '1px',
                  borderColor: isBestMatch ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255,255,255,0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                      {isBestMatch && (
                        <div style={{ marginBottom: '0.6rem' }}>
                          <span className="best-match-badge">🥇 Best Match</span>
                        </div>
                      )}
                      <p className="listing-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center' }}>
                        <span className={`dot-indicator ${dotClass}`} />
                        {car.category} · {car.fuelType}
                      </p>
                      <h3 style={{ fontSize: '1.35rem', marginTop: '0.3rem', fontWeight: 700 }}>{car.make} {car.model}</h3>
                    </div>
                    <div className={`match-badge ${car.score >= 80 ? 'high-match' : ''}`}>
                      {car.score}% Match
                    </div>
                  </div>

                  <p className="page-copy" style={{ margin: '1rem 0', fontSize: '0.92rem' }}>{car.summary}</p>
                  
                  <div className="control-list" style={{ margin: '1.2rem 0', fontSize: '0.88rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="input-label">Seats:</span>
                      <span style={{ fontWeight: 600 }}>{car.seats} Passengers</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="input-label">Price:</span>
                      <span style={{ fontWeight: 600, color: 'var(--blue)' }}>${car.price.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="input-label">Safety:</span>
                      <span style={{ fontWeight: 600, color: 'var(--emerald)' }}>⭐ {car.safetyRating}/5</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        checked={isComparing} 
                        onChange={() => onToggleCompareCar(car.id)} 
                      />
                      <span className="checkmark" />
                      <span>Compare</span>
                    </label>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="tab-button" style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }} onClick={() => onSelectCar(car)}>
                        🔍 Details
                      </button>
                      <button 
                        className={`button ${isShortlisted ? '' : 'tab-button'}`} 
                        style={{ 
                          padding: '0.5rem 0.8rem', 
                          fontSize: '0.85rem',
                          background: isShortlisted ? 'rgba(91, 125, 255, 0.2)' : undefined,
                          borderColor: isShortlisted ? 'var(--blue)' : undefined
                        }} 
                        onClick={() => onToggleShortlist(car.id)}
                      >
                        {isShortlisted ? '❤️ Saved' : '🤍 Save'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {compareCarIds.length > 0 ? (
        <div className="compare-bar">
          <span style={{ fontSize: '0.95rem' }}>
            📊 <strong>{compareCarIds.length}</strong> {compareCarIds.length === 1 ? 'car' : 'cars'} selected to compare
          </span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="button" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.08)' }} onClick={() => onToggleCompareCar('') /* Special toggle-all clear or handle separately */}>
              Clear
            </button>
            {compareCarIds.length >= 2 ? (
              <button 
                className="button" 
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, var(--emerald) 0%, var(--blue) 100%)', fontWeight: 600 }}
                onClick={onOpenCompare}
              >
                Compare Now
              </button>
            ) : (
              <span className="input-label" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
                (Select 1 more to compare)
              </span>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
