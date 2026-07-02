import type { TripType } from "../types";

type IconProps = { className?: string };

export function FlightIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.8 19.2 16 11l3.5-3.5a1.7 1.7 0 0 0-2.4-2.4L13.6 8.6 5.4 6.8 3.9 8.3l6 3.1-2.9 2.9-2.5-.4L3 15.3l3.6 1.5L8.1 20l1.4-1.5-.4-2.5 2.9-2.9 3.1 6 1.5-1z" />
    </svg>
  );
}

export function HotelIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 20V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v14" />
      <path d="M14 10h5a1 1 0 0 1 1 1v9" />
      <path d="M2 20h20" />
      <path d="M6 8h2M6 11h2M6 14h2M10 8h1M10 11h1M10 14h1M17 14h1M17 17h1" />
    </svg>
  );
}

export function CarIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 13l1.6-4.2A2 2 0 0 1 8.5 7.5h7a2 2 0 0 1 1.9 1.3L19 13" />
      <path d="M3 17v-2.5a2 2 0 0 1 1.3-1.9l.7-.2h14l.7.2A2 2 0 0 1 21 14.5V17a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <circle cx="7.5" cy="15.5" r="1" />
      <circle cx="16.5" cy="15.5" r="1" />
    </svg>
  );
}

export function TripIcon({
  type,
  className,
}: {
  type: TripType;
  className?: string;
}) {
  if (type === "FLIGHT") return <FlightIcon className={className} />;
  if (type === "HOTEL") return <HotelIcon className={className} />;
  return <CarIcon className={className} />;
}
