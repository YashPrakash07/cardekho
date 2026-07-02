import { NextResponse } from 'next/server';
import { cars } from '@/data/cars';
import type { QuizAnswers, CarMatch } from '@/types';

function normalize(value: number, min: number, max: number) {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function scoreCar(car: typeof cars[number], answers: QuizAnswers): CarMatch {
  const priceGap = Math.max(0, car.price - answers.budget);
  const budgetScore = answers.budget >= car.price ? 20 : Math.max(0, 10 - priceGap / 2000);
  const seatScore = car.seats >= answers.seats ? 15 : 0;
  const categoryScore = car.category === answers.category ? 15 : 5;
  const fuelScore = answers.fuelType === 'Any' || car.fuelType === answers.fuelType ? 15 : 3;
  const safetyWeight = answers.priorities.safety / 10;
  const economyWeight = answers.priorities.economy / 10;
  const performanceWeight = answers.priorities.performance / 10;
  const comfortWeight = answers.priorities.comfort / 10;

  const safetyScore = car.safetyRating / 5;
  const economyScore = car.fuelType === 'Electric' ? 1 : car.fuelType === 'Hybrid' ? 0.9 : 0.75;
  const performanceScore = normalize(10 - car.acceleration, 0, 10);
  const comfortScore = car.comfort / 10;

  const priorityScore =
    safetyWeight * safetyScore +
    economyWeight * economyScore +
    performanceWeight * performanceScore +
    comfortWeight * comfortScore;

  const rawScore =
    budgetScore +
    seatScore +
    categoryScore +
    fuelScore +
    priorityScore * 40;

  const score = Math.round(Math.max(0, Math.min(100, rawScore)));
  const insights: string[] = [];

  if (car.price <= answers.budget) {
    insights.push('Within your budget range.');
  } else {
    insights.push('Price is above your budget but may fit if you prioritize this model.');
  }

  if (car.seats >= answers.seats) {
    insights.push('Seat capacity matches your needs.');
  } else {
    insights.push('May be tight for your passenger requirements.');
  }

  if (car.category === answers.category) {
    insights.push('Matches your preferred category.');
  } else {
    insights.push(`Alternative class: ${car.category}.`);
  }

  if (answers.fuelType === 'Any' || car.fuelType === answers.fuelType) {
    insights.push('Fuel preference aligned.');
  } else {
    insights.push(`Fuel type is ${car.fuelType}.`);
  }

  if (answers.priorities.safety >= 8 && car.safetyRating >= 4.5) {
    insights.push('Excellent safety credentials for your priority.');
  }

  if (answers.priorities.economy >= 8 && economyScore >= 0.9) {
    insights.push('Outstanding efficiency for your economy goal.');
  }

  return { ...car, score, insights };
}

export async function POST(request: Request) {
  const body = (await request.json()) as QuizAnswers;
  const matches = cars
    .map((car) => scoreCar(car, body))
    .filter((car) => car.score > 45)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return NextResponse.json({ results: matches });
}
