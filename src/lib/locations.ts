// Rich, static location datasets that power the auto-suggest comboboxes in the
// New travel request wizard. Deliberately large so the demo shows how
// type-ahead filtering behaves across many options. No African
// under-developed destinations are included (per client preference); a few
// sanctioned/high-risk cities are kept so policy escalation stays demoable.

interface AirportMeta {
  city: string;
  code: string;
  country: string;
}

export const AIRPORTS: AirportMeta[] = [
  { city: "London", code: "LHR", country: "United Kingdom" },
  { city: "London", code: "LGW", country: "United Kingdom" },
  { city: "Manchester", code: "MAN", country: "United Kingdom" },
  { city: "Edinburgh", code: "EDI", country: "United Kingdom" },
  { city: "Dublin", code: "DUB", country: "Ireland" },
  { city: "Paris", code: "CDG", country: "France" },
  { city: "Paris", code: "ORY", country: "France" },
  { city: "Nice", code: "NCE", country: "France" },
  { city: "Amsterdam", code: "AMS", country: "Netherlands" },
  { city: "Brussels", code: "BRU", country: "Belgium" },
  { city: "Berlin", code: "BER", country: "Germany" },
  { city: "Munich", code: "MUC", country: "Germany" },
  { city: "Frankfurt", code: "FRA", country: "Germany" },
  { city: "Hamburg", code: "HAM", country: "Germany" },
  { city: "Madrid", code: "MAD", country: "Spain" },
  { city: "Barcelona", code: "BCN", country: "Spain" },
  { city: "Valencia", code: "VLC", country: "Spain" },
  { city: "Lisbon", code: "LIS", country: "Portugal" },
  { city: "Porto", code: "OPO", country: "Portugal" },
  { city: "Rome", code: "FCO", country: "Italy" },
  { city: "Milan", code: "MXP", country: "Italy" },
  { city: "Venice", code: "VCE", country: "Italy" },
  { city: "Zurich", code: "ZRH", country: "Switzerland" },
  { city: "Geneva", code: "GVA", country: "Switzerland" },
  { city: "Vienna", code: "VIE", country: "Austria" },
  { city: "Prague", code: "PRG", country: "Czech Republic" },
  { city: "Warsaw", code: "WAW", country: "Poland" },
  { city: "Krakow", code: "KRK", country: "Poland" },
  { city: "Budapest", code: "BUD", country: "Hungary" },
  { city: "Copenhagen", code: "CPH", country: "Denmark" },
  { city: "Stockholm", code: "ARN", country: "Sweden" },
  { city: "Oslo", code: "OSL", country: "Norway" },
  { city: "Helsinki", code: "HEL", country: "Finland" },
  { city: "Athens", code: "ATH", country: "Greece" },
  { city: "Reykjavik", code: "KEF", country: "Iceland" },
  { city: "New York", code: "JFK", country: "United States" },
  { city: "New York", code: "EWR", country: "United States" },
  { city: "Boston", code: "BOS", country: "United States" },
  { city: "Washington", code: "IAD", country: "United States" },
  { city: "Chicago", code: "ORD", country: "United States" },
  { city: "San Francisco", code: "SFO", country: "United States" },
  { city: "Los Angeles", code: "LAX", country: "United States" },
  { city: "Seattle", code: "SEA", country: "United States" },
  { city: "Miami", code: "MIA", country: "United States" },
  { city: "Toronto", code: "YYZ", country: "Canada" },
  { city: "Vancouver", code: "YVR", country: "Canada" },
  { city: "Montreal", code: "YUL", country: "Canada" },
  { city: "Dubai", code: "DXB", country: "United Arab Emirates" },
  { city: "Abu Dhabi", code: "AUH", country: "United Arab Emirates" },
  { city: "Doha", code: "DOH", country: "Qatar" },
  { city: "Riyadh", code: "RUH", country: "Saudi Arabia" },
  { city: "Tel Aviv", code: "TLV", country: "Israel" },
  { city: "Istanbul", code: "IST", country: "Turkey" },
  { city: "Tokyo", code: "HND", country: "Japan" },
  { city: "Tokyo", code: "NRT", country: "Japan" },
  { city: "Osaka", code: "KIX", country: "Japan" },
  { city: "Seoul", code: "ICN", country: "South Korea" },
  { city: "Singapore", code: "SIN", country: "Singapore" },
  { city: "Hong Kong", code: "HKG", country: "Hong Kong" },
  { city: "Shanghai", code: "PVG", country: "China" },
  { city: "Beijing", code: "PEK", country: "China" },
  { city: "Bangkok", code: "BKK", country: "Thailand" },
  { city: "Kuala Lumpur", code: "KUL", country: "Malaysia" },
  { city: "Sydney", code: "SYD", country: "Australia" },
  { city: "Melbourne", code: "MEL", country: "Australia" },
  { city: "Auckland", code: "AKL", country: "New Zealand" },
  { city: "Mumbai", code: "BOM", country: "India" },
  { city: "New Delhi", code: "DEL", country: "India" },
  { city: "Mexico City", code: "MEX", country: "Mexico" },
  { city: "Sao Paulo", code: "GRU", country: "Brazil" },
  { city: "Buenos Aires", code: "EZE", country: "Argentina" },
  { city: "Santiago", code: "SCL", country: "Chile" },
];

// Additional (mostly capital / major) cities without a dedicated airport row,
// plus a few sanctioned cities for policy demos.
const EXTRA_CITIES: { city: string; country: string }[] = [
  { city: "Lyon", country: "France" },
  { city: "Rotterdam", country: "Netherlands" },
  { city: "Florence", country: "Italy" },
  { city: "Naples", country: "Italy" },
  { city: "Seville", country: "Spain" },
  { city: "Gothenburg", country: "Sweden" },
  { city: "Luxembourg", country: "Luxembourg" },
  { city: "Dubrovnik", country: "Croatia" },
  { city: "Moscow", country: "Russia" },
  { city: "Minsk", country: "Belarus" },
  { city: "Tehran", country: "Iran" },
];

// "City (CODE)" — used for flight origin.
export const AIRPORT_OPTIONS: string[] = AIRPORTS.map(
  (a) => `${a.city} (${a.code})`
);

// "City, Country" — used for destinations (flights, hotels, cars).
export const CITY_OPTIONS: string[] = (() => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of [...AIRPORTS, ...EXTRA_CITIES.map((c) => ({ ...c, code: "" }))]) {
    const label = `${a.city}, ${a.country}`;
    if (!seen.has(label)) {
      seen.add(label);
      out.push(label);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
})();

// Rich pick-up / drop-off options: for each unique city, a handful of hubs.
export const CAR_PLACE_OPTIONS: string[] = (() => {
  const byCity = new Map<string, string>(); // city -> primary code
  for (const a of AIRPORTS) if (!byCity.has(a.city)) byCity.set(a.city, a.code);
  const out: string[] = [];
  for (const [city, code] of byCity) {
    out.push(`${city} Airport (${code})`);
    out.push(`${city} City Centre`);
    out.push(`${city} Central Station`);
    out.push(`${city} Downtown`);
  }
  return out.sort((a, b) => a.localeCompare(b));
})();
