"use client";

import { useMemo, useState } from 'react';
import type { QuizAnswers, Category, FuelType } from '@/types';

interface QuizWizardProps {
  onSubmit: (answers: QuizAnswers) => void;
  loading?: boolean;
}

const categories: Category[] = ['Sedan', 'Hatchback', 'SUV', 'Coupe', 'MPV', 'Pickup', 'EV'];
const fuelTypes: (FuelType | 'Any')[] = ['Any', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];

const categoryInfo: Record<Category, { emoji: string; desc: string }> = {
  Sedan: { emoji: '🚗', desc: 'Comfortable classic' },
  Hatchback: { emoji: '🚗', desc: 'Compact & agile' },
  SUV: { emoji: '🚙', desc: 'Spacious & elevated' },
  Coupe: { emoji: '🏎️', desc: 'Sporty & sleek' },
  MPV: { emoji: '🚐', desc: 'Family & utility' },
  Pickup: { emoji: '🛻', desc: 'Rugged & tough' },
  EV: { emoji: '⚡', desc: 'Pure electric drive' },
};

const fuelInfo: Record<FuelType | 'Any', { emoji: string; desc: string }> = {
  Any: { emoji: '🌟', desc: 'Any fuel type' },
  Petrol: { emoji: '⛽', desc: 'Traditional petrol' },
  Diesel: { emoji: '⛽', desc: 'Efficient diesel' },
  Hybrid: { emoji: '🔌', desc: 'Petrol + electric' },
  Electric: { emoji: '⚡', desc: 'Zero emissions' },
};

export default function QuizWizard({ onSubmit, loading = false }: QuizWizardProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    budget: 35000,
    seats: 5,
    category: 'SUV',
    fuelType: 'Any',
    priorities: {
      safety: 8,
      economy: 7,
      performance: 5,
      comfort: 7,
    },
  });

  const steps = useMemo(
    () => [
      {
        title: 'Set your budget',
        render: (
          <div className="card">
            <div className="input-group">
              <label className="input-label">Maximum budget</label>
              <input
                type="range"
                min={18000}
                max={55000}
                step={1000}
                value={answers.budget}
                onChange={(event) => setAnswers((prev) => ({ ...prev, budget: Number(event.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--blue)', cursor: 'pointer' }}
              />
              <span className="listing-label" style={{ fontSize: '1.2rem', color: 'var(--blue)', fontWeight: 700 }}>
                Up to ${answers.budget.toLocaleString()}
              </span>
            </div>
          </div>
        ),
      },
      {
        title: 'Choose seating',
        render: (
          <div className="card">
            <div className="input-group">
              <label className="input-label">Passengers to seat</label>
              <input
                type="number"
                min={2}
                max={7}
                value={answers.seats}
                onChange={(event) => setAnswers((prev) => ({ ...prev, seats: Number(event.target.value) }))}
                className="input-field"
                style={{ fontSize: '1.2rem', fontWeight: 600 }}
              />
              <span className="listing-label">Comfortable room for {answers.seats} people</span>
            </div>
          </div>
        ),
      },
      {
        title: 'Pick your ideal car type',
        render: (
          <div className="choice-card-grid">
            {categories.map((category) => {
              const info = categoryInfo[category];
              return (
                <div
                  key={category}
                  className={`choice-card ${answers.category === category ? 'selected' : ''}`}
                  onClick={() => setAnswers((prev) => ({ ...prev, category }))}
                >
                  <span className="choice-emoji">{info.emoji}</span>
                  <span className="choice-label">{category}</span>
                  <span className="input-label" style={{ fontSize: '0.8rem' }}>{info.desc}</span>
                </div>
              );
            })}
          </div>
        ),
      },
      {
        title: 'Fuel preference',
        render: (
          <div className="choice-card-grid">
            {fuelTypes.map((fuel) => {
              const info = fuelInfo[fuel];
              return (
                <div
                  key={fuel}
                  className={`choice-card ${answers.fuelType === fuel ? 'selected' : ''}`}
                  onClick={() => setAnswers((prev) => ({ ...prev, fuelType: fuel }))}
                >
                  <span className="choice-emoji">{info.emoji}</span>
                  <span className="choice-label">{fuel}</span>
                  <span className="input-label" style={{ fontSize: '0.8rem' }}>{info.desc}</span>
                </div>
              );
            })}
          </div>
        ),
      },
      {
        title: 'Priority values',
        render: (
          <div className="card grid-2">
            {(['safety', 'economy', 'performance', 'comfort'] as const).map((field) => (
              <div key={field} className="slider-row" style={{ padding: '0.5rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="input-label" style={{ fontWeight: 600, color: 'var(--text)' }}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </span>
                  <span className="listing-label" style={{ color: 'var(--blue)', fontWeight: 700 }}>
                    {answers.priorities[field]}/10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={answers.priorities[field]}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      priorities: { ...prev.priorities, [field]: Number(event.target.value) },
                    }))
                  }
                  style={{ width: '100%', accentColor: 'var(--blue)', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>
        ),
      },
    ],
    [answers]
  );

  const currentStep = steps[step];

  return (
    <section 
      className="card" 
      style={{ 
        maxWidth: '680px', 
        margin: '2rem auto', 
        minHeight: '520px', 
        position: 'relative', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      {/* Absolute Progress Bar at the top of Card */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.06)' }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${((step + 1) / steps.length) * 100}%`, 
            background: 'linear-gradient(90deg, var(--emerald), var(--blue-glow))',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
          }} 
        />
      </div>

      <div>
        {/* Step Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem', marginTop: '0.5rem' }}>
          <div>
            <p className="listing-label" style={{ fontSize: '0.78rem', color: 'var(--blue-glow)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quiz Step {step + 1} of {steps.length}
            </p>
            <h2 style={{ fontSize: '1.6rem', marginTop: '0.2rem', fontWeight: 700 }}>{currentStep.title}</h2>
          </div>
          <div className="listing-label" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            {Math.round(((step + 1) / steps.length) * 100)}% Done
          </div>
        </div>

        {/* Dynamic Render Slot */}
        <div style={{ margin: '1.5rem 0' }}>{currentStep.render}</div>
      </div>

      {/* Action Footer */}
      <div 
        className="card-actions" 
        style={{ 
          marginTop: '2rem', 
          borderTop: '1px solid rgba(255,255,255,0.06)', 
          paddingTop: '1.25rem', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          {step > 0 ? (
            <button className="tab-button" type="button" onClick={() => setStep(step - 1)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
              ⬅️ Back
            </button>
          ) : <div />}
        </div>
        
        <div>
          {step < steps.length - 1 ? (
            <button className="button" type="button" onClick={() => setStep(step + 1)} style={{ padding: '0.75rem 1.8rem', borderRadius: '12px', background: 'var(--blue)', fontWeight: 600 }}>
              Next Step ➡️
            </button>
          ) : (
            <button 
              className="button" 
              type="button" 
              onClick={() => onSubmit(answers)} 
              disabled={loading}
              style={{ 
                padding: '0.75rem 2rem', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, var(--emerald) 0%, var(--blue-glow) 100%)', 
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)' 
              }}
            >
              {loading ? 'Matching Preferences...' : '⚡ Generate My Matches'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
