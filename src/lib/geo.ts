// Lightweight, offline country detection for location strings so we can show a
// flag and a map without any external geocoding dependency.

export interface CountryInfo {
  code: string; // ISO 3166-1 alpha-2
  name: string; // canonical display name
}

// Country name (and common aliases) -> ISO2. Lowercased keys.
const NAME_TO_ISO: Record<string, string> = {
  afghanistan: "af",
  albania: "al",
  algeria: "dz",
  argentina: "ar",
  australia: "au",
  austria: "at",
  bahrain: "bh",
  bangladesh: "bd",
  belarus: "by",
  belgium: "be",
  benin: "bj",
  brazil: "br",
  bulgaria: "bg",
  "burkina faso": "bf",
  cambodia: "kh",
  cameroon: "cm",
  canada: "ca",
  chad: "td",
  chile: "cl",
  china: "cn",
  colombia: "co",
  "congo": "cg",
  "dr congo": "cd",
  "democratic republic of the congo": "cd",
  croatia: "hr",
  cyprus: "cy",
  "czech republic": "cz",
  czechia: "cz",
  denmark: "dk",
  ecuador: "ec",
  egypt: "eg",
  ethiopia: "et",
  finland: "fi",
  france: "fr",
  germany: "de",
  ghana: "gh",
  greece: "gr",
  "hong kong": "hk",
  hungary: "hu",
  india: "in",
  indonesia: "id",
  iran: "ir",
  iraq: "iq",
  ireland: "ie",
  israel: "il",
  italy: "it",
  "ivory coast": "ci",
  "cote d'ivoire": "ci",
  japan: "jp",
  jordan: "jo",
  kazakhstan: "kz",
  kenya: "ke",
  kuwait: "kw",
  lebanon: "lb",
  libya: "ly",
  luxembourg: "lu",
  malaysia: "my",
  mali: "ml",
  malta: "mt",
  mexico: "mx",
  morocco: "ma",
  mozambique: "mz",
  myanmar: "mm",
  nepal: "np",
  netherlands: "nl",
  "the netherlands": "nl",
  "new zealand": "nz",
  niger: "ne",
  nigeria: "ng",
  "north korea": "kp",
  norway: "no",
  oman: "om",
  pakistan: "pk",
  "palestine": "ps",
  peru: "pe",
  philippines: "ph",
  poland: "pl",
  portugal: "pt",
  qatar: "qa",
  romania: "ro",
  russia: "ru",
  "russian federation": "ru",
  rwanda: "rw",
  "saudi arabia": "sa",
  senegal: "sn",
  serbia: "rs",
  singapore: "sg",
  slovakia: "sk",
  slovenia: "si",
  somalia: "so",
  "south africa": "za",
  "south korea": "kr",
  "south sudan": "ss",
  spain: "es",
  "sri lanka": "lk",
  sudan: "sd",
  sweden: "se",
  switzerland: "ch",
  syria: "sy",
  taiwan: "tw",
  tanzania: "tz",
  thailand: "th",
  tunisia: "tn",
  turkey: "tr",
  "türkiye": "tr",
  uganda: "ug",
  ukraine: "ua",
  "united arab emirates": "ae",
  uae: "ae",
  "united kingdom": "gb",
  uk: "gb",
  "great britain": "gb",
  england: "gb",
  "united states": "us",
  "united states of america": "us",
  usa: "us",
  us: "us",
  america: "us",
  uruguay: "uy",
  venezuela: "ve",
  vietnam: "vn",
  yemen: "ye",
  zambia: "zm",
  zimbabwe: "zw",
};

const ISO_TO_NAME: Record<string, string> = Object.entries(NAME_TO_ISO).reduce(
  (acc, [name, iso]) => {
    // Prefer the first (canonical-ish) name we encounter for each ISO.
    if (!acc[iso]) acc[iso] = name.replace(/\b\w/g, (c) => c.toUpperCase());
    return acc;
  },
  {} as Record<string, string>
);

// Turn "gb" into the corresponding flag emoji using regional indicators.
export function flagEmoji(iso2: string): string {
  const code = iso2.trim().toUpperCase();
  if (code.length !== 2) return "";
  return code.replace(/./g, (c) =>
    String.fromCodePoint(127397 + c.charCodeAt(0))
  );
}

// Best-effort country from a location string like "Madrid, Spain" or "Spain".
export function countryOf(location?: string): CountryInfo | null {
  if (!location) return null;
  const parts = location.split(",").map((p) => p.trim().toLowerCase());
  // Try last segment first (usually the country), then the whole string.
  const candidates = [parts[parts.length - 1], location.trim().toLowerCase()];
  for (const cand of candidates) {
    const cleaned = cand.replace(/[.]/g, "").trim();
    const iso = NAME_TO_ISO[cleaned];
    if (iso) return { code: iso, name: ISO_TO_NAME[iso] ?? cleaned };
  }
  return null;
}

export function flagFor(location?: string): string {
  const c = countryOf(location);
  return c ? flagEmoji(c.code) : "";
}

// Google Maps embed URL (no API key required) for an inline preview iframe.
export function mapEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=11&output=embed`;
}

// Google Maps search link for "open in a new tab".
export function mapLinkUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}
