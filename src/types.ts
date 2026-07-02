export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
export type Category = 'Sedan' | 'Hatchback' | 'SUV' | 'Coupe' | 'MPV' | 'Pickup' | 'EV';

export interface CarReview {
  title: string;
  rating: number;
  highlight: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  category: Category;
  price: number;
  safetyRating: number;
  fuelType: FuelType;
  seats: number;
  rangeKm: number;
  acceleration: number;
  luggage: string;
  comfort: number;
  reliability: number;
  premium: number;
  summary: string;
  reviews: CarReview[];
}

export interface QuizAnswers {
  budget: number;
  seats: number;
  category: Category;
  fuelType: FuelType | 'Any';
  priorities: {
    safety: number;
    economy: number;
    performance: number;
    comfort: number;
  };
}

export interface CarMatch extends Car {
  score: number;
  insights: string[];
}

export interface ShortlistEntry {
  carId: string;
  note: string;
}

export interface ShortlistRecord {
  shortlist: ShortlistEntry[];
}
