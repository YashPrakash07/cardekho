"use client";

import type { CarMatch } from '@/types';

interface CarDetailModalProps {
  car: CarMatch;
  open: boolean;
  onClose: () => void;
  onToggleShortlist: (carId: string) => void;
  shortlisted: boolean;
}

function metricLabel(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function CarDetailModal({ car, open, onClose, onToggleShortlist, shortlisted }: CarDetailModalProps) {
  if (!open) return null;

  const safety = car.safetyRating / 5;
  const economy = car.fuelType === 'Electric' ? 1 : car.fuelType === 'Hybrid' ? 0.9 : 0.78;
  const performance = Math.max(0, Math.min(1, (10 - car.acceleration) / 10));
  const comfort = car.comfort / 10;

  return (
    <div className="modal-wrapper" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div>
            <p className="listing-label">Match insights</p>
            <h2>{car.make} {car.model}</h2>
            <p className="page-copy">{car.summary}</p>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close details">
            ×
          </button>
        </div>

        <div className="grid-2" style={{ marginTop: '1.5rem' }}>
          <div>
            <p className="listing-label">Score</p>
            <h3>{car.score}% Match</h3>
            <div className="control-list" style={{ marginTop: '1rem' }}>
              <span>Category: {car.category}</span>
              <span>Fuel: {car.fuelType}</span>
              <span>Seats: {car.seats}</span>
              <span>Price: ${car.price.toLocaleString()}</span>
            </div>
          </div>
          <div className="control-list">
            <div>
              <span className="listing-label">Acceleration</span>
              <p>{car.acceleration}s 0-100 km/h</p>
            </div>
            <div>
              <span className="listing-label">Range</span>
              <p>{car.rangeKm} km</p>
            </div>
            <div>
              <span className="listing-label">Cargo</span>
              <p>{car.luggage}</p>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '1.5rem', marginTop: '1.5rem' }}>
          {[
            { label: 'Safety', value: safety },
            { label: 'Economy', value: economy },
            { label: 'Performance', value: performance },
            { label: 'Comfort', value: comfort },
          ].map((metric) => (
            <div key={metric.label} className="card">
              <p className="listing-label">{metric.label}</p>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: metricLabel(metric.value) }} />
              </div>
              <p style={{ marginTop: '0.75rem' }}>{metricLabel(metric.value)}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3>Why this car matches</h3>
          <ul className="insight-list">
            {car.insights.map((insight, index) => (
              <li key={index} className="page-copy">• {insight}</li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3>User reviews</h3>
          <div className="review-list">
            {car.reviews.map((review) => (
              <div key={review.title} style={{ gap: '0.5rem', display: 'grid' }}>
                <strong>{review.title}</strong>
                <p className="page-copy">{review.highlight}</p>
                <span className="listing-label">Rating: {review.rating}/5</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-actions" style={{ marginTop: '1.5rem' }}>
          <button className="button" onClick={() => onToggleShortlist(car.id)}>
            {shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
          </button>
          <button className="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
