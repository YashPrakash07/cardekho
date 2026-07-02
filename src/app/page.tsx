"use client";

import { useEffect, useMemo, useState } from 'react';
import type { CarMatch, QuizAnswers, ShortlistEntry } from '@/types';
import { cars } from '@/data/cars';
import QuizWizard from '@/components/QuizWizard';
import Dashboard from '@/components/Dashboard';
import CarDetailModal from '@/components/CarDetailModal';
import ShortlistDrawer from '@/components/ShortlistDrawer';
import ComparisonBoard from '@/components/ComparisonBoard';

export default function Page() {
  const [view, setView] = useState<'quiz' | 'dashboard'>('quiz');
  const [recommendations, setRecommendations] = useState<CarMatch[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarMatch | null>(null);
  const [shortlist, setShortlist] = useState<ShortlistEntry[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Comparison states
  const [compareCarIds, setCompareCarIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [activeQuizAnswers, setActiveQuizAnswers] = useState<QuizAnswers | null>(null);

  useEffect(() => {
    async function initShortlist() {
      // 1. Check for shared shortlist via query parameters
      let urlCarIds: string[] = [];
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const slParam = params.get('shortlist');
        if (slParam) {
          urlCarIds = slParam.split(',').filter(Boolean);
        }
      }

      // 2. Fetch shortlist from database
      try {
        const response = await fetch('/api/shortlist');
        const data = await response.json();
        let dbList: ShortlistEntry[] = data.shortlist ?? [];

        // Merge query param shortlist into database shortlist if present
        if (urlCarIds.length > 0) {
          const dbIds = new Set(dbList.map((item) => item.carId));
          const mergedList = [...dbList];

          urlCarIds.forEach((id) => {
            if (!dbIds.has(id)) {
              mergedList.push({ carId: id, note: '' });
            }
          });

          dbList = mergedList;
          // Persist the merged shortlist back to DB
          await fetch('/api/shortlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shortlist: mergedList }),
          });
        }

        setShortlist(dbList);

        // If direct share link, pre-populate compare selection and go directly to comparison
        if (urlCarIds.length > 0) {
          setCompareCarIds(urlCarIds);
          setCompareOpen(true);
          setView('dashboard');
        }
      } catch {
        // Fallback in case of DB read error
        if (urlCarIds.length > 0) {
          const initial = urlCarIds.map((id) => ({ carId: id, note: '' }));
          setShortlist(initial);
          setCompareCarIds(urlCarIds);
          setCompareOpen(true);
          setView('dashboard');
        }
      }
    }
    initShortlist();
  }, []);

  const shortlistIds = useMemo(
    () => new Set(shortlist.map((item) => item.carId)),
    [shortlist]
  );

  // Map compared IDs to CarMatches
  const comparedCars = useMemo(() => {
    return compareCarIds
      .map((id) => {
        const matched = recommendations.find((car) => car.id === id);
        if (matched) return matched;
        const staticCar = cars.find((car) => car.id === id);
        if (staticCar) {
          return {
            ...staticCar,
            score: 100,
            insights: ['Loaded from shared shortlist link.'],
          } as CarMatch;
        }
        return null;
      })
      .filter((car): car is CarMatch => car !== null);
  }, [compareCarIds, recommendations]);

  async function persistShortlist(next: ShortlistEntry[]) {
    setShortlist(next);
    await fetch('/api/shortlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shortlist: next }),
    });
  }

  async function handleQuizSubmit(answers: QuizAnswers) {
    setLoading(true);
    setError(null);
    setActiveQuizAnswers(answers);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      const data = await response.json();
      const results = data.results ?? [];
      setRecommendations(results);
      setView('dashboard');
      setDrawerOpen(false);

      // Auto-select top 2 recommended matches for comparison
      if (results.length >= 2) {
        setCompareCarIds([results[0].id, results[1].id]);
      } else {
        setCompareCarIds([]);
      }
    } catch {
      setError('Unable to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleToggleShortlist(carId: string) {
    const exists = shortlistIds.has(carId);
    const next = exists
      ? shortlist.filter((item) => item.carId !== carId)
      : [...shortlist, { carId, note: '' }];
    void persistShortlist(next);
  }

  function handleNoteUpdate(carId: string, note: string) {
    const next = shortlist.map((item) => (item.carId === carId ? { ...item, note } : item));
    void persistShortlist(next);
  }

  function handleToggleCompareCar(carId: string) {
    if (carId === '') {
      setCompareCarIds([]);
      return;
    }
    setCompareCarIds((prev) =>
      prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId]
    );
  }

  const selectedItem = selectedCar ? recommendations.find((car) => car.id === selectedCar.id) ?? selectedCar : null;

  return (
    <main className="main-shell">
      <div className="header-panel">
        <div>
          <p className="listing-label" style={{ color: 'var(--blue)', fontWeight: 700 }}>🚗 CARMATCH ENGINE</p>
          <h1 className="page-title">Find Your Perfect Car</h1>
          <p className="page-copy">
            Answer a few quick questions about your budget, utility, and driving priorities. We'll build a tailored shortlist with long-term cost estimates and safety assessments.
          </p>
        </div>
        <div className="card card-actions">
          <button className="button" onClick={() => setView('quiz')}>
            🔄 Restart Quiz
          </button>
          <button className="button" style={{ background: shortlist.length > 0 ? 'rgba(91, 125, 255, 0.15)' : undefined }} onClick={() => setDrawerOpen((current) => !current)}>
            ❤️ Saved Shortlist ({shortlist.length})
          </button>
        </div>
      </div>

      {view === 'quiz' ? (
        <QuizWizard onSubmit={handleQuizSubmit} loading={loading} />
      ) : (
        <Dashboard
          recommendations={recommendations}
          shortlistIds={shortlistIds}
          onSelectCar={(car) => setSelectedCar(car)}
          onToggleShortlist={handleToggleShortlist}
          onRunNewQuiz={() => setView('quiz')}
          loading={loading}
          error={error}
          compareCarIds={compareCarIds}
          onToggleCompareCar={handleToggleCompareCar}
          onOpenCompare={() => setCompareOpen(true)}
        />
      )}

      {selectedItem ? (
        <CarDetailModal
          car={selectedItem}
          open={Boolean(selectedItem)}
          onClose={() => setSelectedCar(null)}
          onToggleShortlist={handleToggleShortlist}
          shortlisted={shortlistIds.has(selectedItem.id)}
        />
      ) : null}

      {drawerOpen ? (
        <ShortlistDrawer
          shortlist={shortlist}
          onClose={() => setDrawerOpen(false)}
          onNoteChange={handleNoteUpdate}
          onRemove={(carId) => handleToggleShortlist(carId)}
          onOpenCompare={() => setCompareOpen(true)}
        />
      ) : null}

      {compareOpen ? (
        <ComparisonBoard
          cars={comparedCars}
          quizAnswers={activeQuizAnswers}
          onClose={() => setCompareOpen(false)}
          onRemove={(carId) => handleToggleCompareCar(carId)}
        />
      ) : null}
    </main>
  );
}
