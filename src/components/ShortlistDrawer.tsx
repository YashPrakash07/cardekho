"use client";

import { useMemo } from 'react';
import { cars } from '@/data/cars';
import type { ShortlistEntry } from '@/types';

interface ShortlistDrawerProps {
  shortlist: ShortlistEntry[];
  onClose: () => void;
  onNoteChange: (carId: string, note: string) => void;
  onRemove: (carId: string) => void;
  onOpenCompare: () => void;
}

export default function ShortlistDrawer({ shortlist, onClose, onNoteChange, onRemove, onOpenCompare }: ShortlistDrawerProps) {
  const items = useMemo(
    () =>
      shortlist
        .map((entry) => ({
          entry,
          car: cars.find((item) => item.id === entry.carId),
        }))
        .filter((item) => item.car),
    [shortlist]
  );

  return (
    <div className="drawer-wrapper" onClick={onClose}>
      <div className="drawer" onClick={(event) => event.stopPropagation()}>
        <div className="grid-2" style={{ alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <p className="listing-label">Shortlist</p>
            <h3>Saved cars ({items.length})</h3>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close shortlist drawer">
            ×
          </button>
        </div>

        {items.length >= 2 ? (
          <button
            className="button"
            style={{
              width: '100%',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, var(--emerald) 0%, var(--blue) 100%)',
              fontWeight: 700,
              fontSize: '0.95rem',
              boxShadow: '0 4px 15px rgba(52, 211, 153, 0.2)'
            }}
            onClick={() => {
              onClose();
              onOpenCompare();
            }}
          >
            📊 Compare Shortlist Side-by-Side
          </button>
        ) : null}

        {items.length === 0 ? (
          <div className="card" style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p className="page-copy">No shortlisted cars yet. Save cars from the dashboard to start building your list.</p>
          </div>
        ) : (
          <div className="grid-cards" style={{ display: 'grid', gap: '1rem' }}>
            {items.map(({ car, entry }) => (
              <div key={car!.id} className="card" style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <p className="listing-label" style={{ fontSize: '0.75rem' }}>{car!.category} · {car!.fuelType}</p>
                    <h4 style={{ fontSize: '1.1rem', margin: '0.1rem 0' }}>{car!.make} {car!.model}</h4>
                  </div>
                  <button 
                    className="tab-button" 
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' }} 
                    onClick={() => onRemove(car!.id)}
                  >
                    Remove
                  </button>
                </div>
                <p className="listing-label" style={{ fontSize: '0.85rem', color: 'var(--blue)' }}>Price: ${car!.price.toLocaleString()}</p>
                <div className="input-group" style={{ marginTop: '0.75rem' }}>
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>My Note</label>
                  <textarea
                    className="textarea-field"
                    value={entry.note}
                    onChange={(event) => onNoteChange(car!.id, event.target.value)}
                    placeholder="E.g., perfect safety, a bit expensive but hybrid..."
                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', minHeight: '60px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
