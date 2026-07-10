import {
  GlassWater,
  Droplets,
  RefreshCw,
  Activity,
  Pill,
  HeartPulse,
  Thermometer,
  Droplet,
  Utensils,
  Footprints,
  Moon,
  CirclePlus,
  type LucideIcon,
} from 'lucide-react';

// Maps an event_type.icon slug (or emoji — handled separately) to a lucide icon.
// Unknown names fall back to a generic "+" so a user-created tracker still renders.
const ICONS: Record<string, LucideIcon> = {
  GlassWater,
  Droplets,
  Droplet,
  RefreshCw,
  Activity,
  Pill,
  HeartPulse,
  Thermometer,
  Utensils,
  Footprints,
  Moon,
};

export function resolveTrackerIcon(name?: string): LucideIcon {
  if (name && ICONS[name]) return ICONS[name];
  return CirclePlus;
}

// An emoji icon is any 1-2 char non-ASCII string; render those as text instead.
export function isEmojiIcon(name?: string): boolean {
  if (!name) return false;
  return !/^[A-Za-z]/.test(name);
}
