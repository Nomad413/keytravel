import type {
  CabinClass,
  CarClass,
  RoomType,
  TravelRequestDraft,
} from "../types";

// Deterministic pseudo-random from a string so results are stable per search.
function seedFrom(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function daysBetween(a?: string, b?: string): number {
  if (!a || !b) return 1;
  const start = new Date(a).getTime();
  const end = new Date(b).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 1;
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

function round5(n: number): number {
  return Math.round(n / 5) * 5;
}

// ---------------- Flights ----------------

export interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  departTime: string;
  arriveTime: string;
  durationLabel: string;
  stops: number;
  price: number;
}

const AIRLINES = [
  { name: "British Airways", code: "BA" },
  { name: "KLM", code: "KL" },
  { name: "Lufthansa", code: "LH" },
  { name: "Air France", code: "AF" },
  { name: "Qatar Airways", code: "QR" },
];

const cabinMultiplier: Record<CabinClass, number> = {
  ECONOMY: 1,
  PREMIUM_ECONOMY: 1.6,
  BUSINESS: 3,
  FIRST: 5,
};

export function searchFlights(draft: TravelRequestDraft): FlightOption[] {
  const base = 180 + (seedFrom(draft.destination + draft.origin) % 320);
  const mult = cabinMultiplier[draft.cabinClass ?? "ECONOMY"];
  const rt = draft.oneWay ? 1 : 1.9;

  return [0, 1, 2, 3].map((i) => {
    const s = seedFrom(`${draft.destination}-${draft.origin}-${i}`);
    const stops = i === 0 ? 0 : (s % 3 === 0 ? 1 : i === 3 ? 1 : 0);
    const airline = AIRLINES[s % AIRLINES.length];
    const departH = 6 + (s % 14);
    const durH = 2 + (s % 9) + stops * 2;
    const arriveH = (departH + durH) % 24;
    const priceRaw = (base + i * 60 + stops * -25) * mult * rt;
    return {
      id: `fl-${i}`,
      airline: airline.name,
      flightNumber: `${airline.code}${100 + (s % 900)}`,
      departTime: `${String(departH).padStart(2, "0")}:${(s % 6) * 10 === 0 ? "00" : String((s % 6) * 10).padStart(2, "0")}`,
      arriveTime: `${String(arriveH).padStart(2, "0")}:${((s + 3) % 6) * 10 === 0 ? "05" : String(((s + 3) % 6) * 10).padStart(2, "0")}`,
      durationLabel: `${durH}h ${(s % 6) * 10}m`,
      stops,
      price: round5(priceRaw),
    };
  });
}

export function flightOptionToDraft(
  o: FlightOption
): Partial<TravelRequestDraft> {
  return {
    airline: o.airline,
    flightNumber: o.flightNumber,
    departTime: o.departTime,
    arriveTime: o.arriveTime,
    durationLabel: o.durationLabel,
    stops: o.stops,
    estimatedCost: o.price,
  };
}

// ---------------- Hotels ----------------

export interface HotelOption {
  id: string;
  hotelName: string;
  address: string;
  url: string;
  rating: number;
  pricePerNight: number;
  nights: number;
  price: number;
}

const HOTEL_BRANDS = [
  "Grand Plaza",
  "Riverside Inn",
  "Park Central Hotel",
  "The Continental",
  "Harbour View Suites",
];

const roomMultiplier: Record<RoomType, number> = {
  STANDARD: 1,
  DELUXE: 1.4,
  SUITE: 2.2,
};

export function searchHotels(draft: TravelRequestDraft): HotelOption[] {
  const city = draft.destination || "City";
  const nights = daysBetween(draft.checkInDate, draft.checkOutDate);
  const base = 70 + (seedFrom(city) % 160);
  const mult = roomMultiplier[draft.roomType ?? "STANDARD"];

  return [0, 1, 2, 3].map((i) => {
    const s = seedFrom(`${city}-hotel-${i}`);
    const name = `${HOTEL_BRANDS[s % HOTEL_BRANDS.length]} ${city.split(",")[0]}`;
    const street = `${10 + (s % 200)} ${["Main St", "Market Sq", "Station Rd", "Church Ave"][s % 4]}`;
    const address = `${street}, ${city}`;
    const pricePerNight = round5((base + i * 25) * mult);
    return {
      id: `ho-${i}`,
      hotelName: name,
      address,
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${name} ${address}`
      )}`,
      rating: 3 + (s % 3), // 3..5
      pricePerNight,
      nights,
      price: pricePerNight * nights,
    };
  });
}

export function hotelOptionToDraft(o: HotelOption): Partial<TravelRequestDraft> {
  return {
    hotelName: o.hotelName,
    hotelAddress: o.address,
    hotelUrl: o.url,
    hotelRating: o.rating,
    estimatedCost: o.price,
  };
}

// ---------------- Cars ----------------

export interface CarOption {
  id: string;
  vendor: string;
  model: string;
  pricePerDay: number;
  days: number;
  price: number;
}

const CAR_VENDORS = ["Avis", "Hertz", "Europcar", "Sixt", "Enterprise"];
const CAR_MODELS: Record<CarClass, string[]> = {
  ECONOMY: ["VW Polo", "Ford Fiesta", "Toyota Yaris"],
  COMPACT: ["VW Golf", "Ford Focus", "Opel Astra"],
  SUV: ["Toyota RAV4", "Nissan X-Trail", "Kia Sportage"],
  PREMIUM: ["BMW 5 Series", "Mercedes E-Class", "Audi A6"],
};

const carMultiplier: Record<CarClass, number> = {
  ECONOMY: 1,
  COMPACT: 1.3,
  SUV: 1.8,
  PREMIUM: 2.6,
};

export function searchCars(draft: TravelRequestDraft): CarOption[] {
  const city = draft.destination || "City";
  const days = daysBetween(draft.pickupDate, draft.dropoffDate);
  const cls = draft.carClass ?? "ECONOMY";
  const base = 30 + (seedFrom(city + cls) % 45);
  const mult = carMultiplier[cls];
  const models = CAR_MODELS[cls];

  return [0, 1, 2, 3].map((i) => {
    const s = seedFrom(`${city}-car-${cls}-${i}`);
    const pricePerDay = round5((base + i * 8) * mult);
    return {
      id: `ca-${i}`,
      vendor: CAR_VENDORS[s % CAR_VENDORS.length],
      model: models[s % models.length],
      pricePerDay,
      days,
      price: pricePerDay * days,
    };
  });
}

export function carOptionToDraft(o: CarOption): Partial<TravelRequestDraft> {
  return {
    carVendor: o.vendor,
    carModel: o.model,
    estimatedCost: o.price,
  };
}
