// Curated list of timezones that cover our real users plus the common ones
// someone is likely to pick. Grouped by region for a dropdown with sections.
// If the user's detected browser timezone isn't on this list, the picker
// falls back to showing it as a one-off entry.

export interface TimeZoneOption {
  id: string; // IANA identifier
  label: string; // Human label shown in the UI
  group: string;
}

export const TIME_ZONES: TimeZoneOption[] = [
  // North America
  { id: 'America/New_York', label: 'Eastern Time (New York)', group: 'North America' },
  { id: 'America/Chicago', label: 'Central Time (Chicago)', group: 'North America' },
  { id: 'America/Denver', label: 'Mountain Time (Denver)', group: 'North America' },
  { id: 'America/Phoenix', label: 'Arizona (no DST)', group: 'North America' },
  { id: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)', group: 'North America' },
  { id: 'America/Anchorage', label: 'Alaska Time', group: 'North America' },
  { id: 'Pacific/Honolulu', label: 'Hawaii', group: 'North America' },

  // Central / South America
  { id: 'America/Mexico_City', label: 'Mexico City', group: 'Latin America' },
  { id: 'America/Bogota', label: 'Bogotá', group: 'Latin America' },
  { id: 'America/Lima', label: 'Lima', group: 'Latin America' },
  { id: 'America/Sao_Paulo', label: 'São Paulo', group: 'Latin America' },
  { id: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires', group: 'Latin America' },

  // Europe
  { id: 'Europe/London', label: 'London', group: 'Europe' },
  { id: 'Europe/Dublin', label: 'Dublin', group: 'Europe' },
  { id: 'Europe/Paris', label: 'Paris', group: 'Europe' },
  { id: 'Europe/Berlin', label: 'Berlin', group: 'Europe' },
  { id: 'Europe/Amsterdam', label: 'Amsterdam', group: 'Europe' },
  { id: 'Europe/Madrid', label: 'Madrid', group: 'Europe' },
  { id: 'Europe/Rome', label: 'Rome', group: 'Europe' },
  { id: 'Europe/Stockholm', label: 'Stockholm', group: 'Europe' },
  { id: 'Europe/Athens', label: 'Athens', group: 'Europe' },
  { id: 'Europe/Istanbul', label: 'Istanbul', group: 'Europe' },

  // Asia / Pacific
  { id: 'Asia/Dubai', label: 'Dubai', group: 'Asia / Pacific' },
  { id: 'Asia/Kolkata', label: 'India (Kolkata)', group: 'Asia / Pacific' },
  { id: 'Asia/Bangkok', label: 'Bangkok', group: 'Asia / Pacific' },
  { id: 'Asia/Singapore', label: 'Singapore', group: 'Asia / Pacific' },
  { id: 'Asia/Tokyo', label: 'Tokyo', group: 'Asia / Pacific' },
  { id: 'Asia/Seoul', label: 'Seoul', group: 'Asia / Pacific' },
  { id: 'Australia/Sydney', label: 'Sydney', group: 'Asia / Pacific' },
  { id: 'Pacific/Auckland', label: 'Auckland', group: 'Asia / Pacific' },

  // Fallback
  { id: 'UTC', label: 'UTC', group: 'Other' },
];

export function detectBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function findTimeZoneOption(id: string): TimeZoneOption | null {
  return TIME_ZONES.find((t) => t.id === id) || null;
}
