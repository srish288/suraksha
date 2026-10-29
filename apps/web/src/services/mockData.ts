import type { TouristProfile, UiIncident, SafetyZoneInfo } from '../types';

export const DEFAULT_DEMO_TOURIST: TouristProfile = {
  id: 'tourist-demo-84920',
  name: 'Aarav Sharma',
  email: 'tourist.demo@suraksha.gov.in',
  role: 'tourist',
  phone: '+91 98765 43210',
  nationality: 'Indian',
  emergencyContact: {
    name: 'Sunita Sharma (Guardian)',
    phone: '+91 98765 01234'
  },
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
};

export const INITIAL_DEMO_INCIDENTS: UiIncident[] = [
  {
    id: 'inc-demo-101',
    touristId: 'tourist-demo-84920',
    touristName: 'Aarav Sharma',
    type: 'theft',
    description: 'Lost/stolen leather wallet near Gate No. 2 of the heritage complex. Contained government photo ID and travel card.',
    landmark: 'Heritage Complex, Gate No. 2',
    location: {
      lat: 28.6129,
      lng: 77.2295
    },
    status: 'in_progress',
    severity: 'medium',
    isDemo: true,
    risk: {
      level: 'medium',
      score: 52,
      factors: [
        { code: 'THEFT_HOTSPOT', label: 'Crowded tourist hub', points: 30, reason: 'High footfall zone during evening hours' }
      ]
    },
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    notes: ['Acknowledged by Central Tourist Desk', 'Forwarded to local heritage security booth']
  },
  {
    id: 'inc-demo-102',
    touristId: 'tourist-demo-84920',
    touristName: 'Aarav Sharma',
    type: 'harassment',
    description: 'Aggressive unauthorized vendor following tourists near southern promenade parking.',
    landmark: 'South Promenade Tourist Parking',
    location: {
      lat: 28.6145,
      lng: 77.209
    },
    status: 'resolved',
    severity: 'low',
    isDemo: true,
    risk: {
      level: 'low',
      score: 25,
      factors: [
        { code: 'VENDOR_HARASSMENT', label: 'Solicitation advisory', points: 20, reason: 'Touting reported in perimeter area' }
      ]
    },
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    notes: ['Tourist Police mobile patrol dispatched', 'Vendor advised and escorted out of restricted perimeter']
  }
];

export const SAMPLE_ZONES: SafetyZoneInfo[] = [
  {
    id: 'zone-01',
    name: 'India Gate & Central Vista Heritage Corridor',
    type: 'safe',
    description: 'High security pedestrian corridor with continuous CCTV surveillance and tourist police presence.',
    advisory: 'Well-lit area. Safe for solo travellers until 11:00 PM.',
    helpline: '1363 (Tourist Police)',
    policeStation: 'Kartavya Path Tourist Police Post (200m)'
  },
  {
    id: 'zone-02',
    name: 'Old City Transit & Market Corridor',
    type: 'caution',
    description: 'Dense commercial market area with heavy foot traffic. Prone to pickpocketing and congested lanes.',
    advisory: 'Keep valuables secured. Avoid isolated alleys after 8:30 PM.',
    helpline: '112 / 011-23261234',
    policeStation: 'Kotwali Police Station (450m)'
  },
  {
    id: 'zone-03',
    name: 'Ridge Forest Buffer Zone',
    type: 'restricted',
    description: 'Ecologically sensitive unlit forest fringe with nil tourist security infrastructure after dusk.',
    advisory: 'Entry strictly prohibited after sunset without forest ranger permit.',
    helpline: '112 (National Emergency)',
    policeStation: 'Civil Lines Station (1.8km)'
  }
];

export const OFFICIAL_EMERGENCY_NUMBERS = [
  {
    service: 'National Emergency Support (Police, Fire, Medical)',
    number: '112',
    description: 'Single emergency pan-India helpline for all distress situations.',
    iconName: 'ShieldAlert',
    tollFree: true
  },
  {
    service: 'Incredible India Tourist Infoline & Police',
    number: '1363',
    description: '24x7 multi-lingual tourist assistance & safety guidance in 12 languages.',
    iconName: 'Compass',
    tollFree: true
  },
  {
    service: 'Women in Distress Safety Helpline',
    number: '1091',
    description: 'Dedicated police response team for female travellers and citizens.',
    iconName: 'HeartHandshake',
    tollFree: true
  },
  {
    service: 'Ambulance & Trauma Medical Care',
    number: '102',
    description: 'Government medical dispatch and hospital emergency intake coordination.',
    iconName: 'Activity',
    tollFree: true
  },
  {
    service: 'Cyber Crime & Online Fraud Helpline',
    number: '1930',
    description: 'Reporting digital travel scams, hotel booking fraud, and credit card theft.',
    iconName: 'Lock',
    tollFree: true
  }
];
