import type { RiskLevel, ZoneType } from '@suraksha/shared';

// One place for colors, so the map, legend and panels always match.
export const ZONE_COLORS: Record<ZoneType, string> = {
  safe: '#10b981',
  caution: '#f59e0b',
  restricted: '#ef4444',
  emergency: '#7e22ce'
};

export const ZONE_LABELS: Record<ZoneType, string> = {
  safe: 'Safe',
  caution: 'Caution',
  restricted: 'Restricted',
  emergency: 'Emergency'
};

export const ZONE_MEANINGS: Record<ZoneType, string> = {
  safe: 'Lower concern. Stay aware as usual.',
  caution: 'Take extra care in this area.',
  restricted: 'Entry is not advised or not allowed.',
  emergency: 'Danger. Leave the area and follow instructions from local authorities.'
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444'
};