/**
 * Centralised UI copy — single source for labels, empty states, and hints.
 * Keeps tone consistent: clear, professional, Nigeria waterway context.
 */
export const copy = {
  app: {
    name: 'Water Transport Advisory Portal',
    shortName: 'WTAP',
    tagline: 'Safe passage on the Niger–Benue inland waterways',
  },

  auth: {
    loginTitle: 'Welcome back',
    loginSubtitle: 'Sign in to access your dashboard and role-specific tools.',
    registerTitle: 'Create your account',
    registerSubtitle:
      'Start as a public user. Operator and manager roles are assigned by port authorities.',
    demoHint: 'Demo accounts for evaluation (password: Password@1)',
  },

  empty: {
    warnings: {
      title: 'No active warnings',
      description:
        'There are no navigational hazards reported for the corridor right now. Check back before departure.',
    },
    vessels: {
      title: 'No vessels tracked',
      description: 'Vessel positions will appear here once operators register their fleet.',
    },
    ports: {
      title: 'No ports found',
      description: 'Try a different search term — e.g. Lokoja, Onitsha, or Warri.',
    },
    schedules: {
      title: 'No schedules published',
      description: 'Ferry timetables will appear when port managers publish departures.',
    },
    incidents: {
      title: 'No incidents on record',
      description: 'Submitted field reports from vessel operators will appear here.',
    },
    audit: {
      title: 'No audit entries yet',
      description: 'System activity will be logged as users perform authenticated actions.',
    },
  },

  loading: {
    weather: 'Fetching live conditions from Open-Meteo…',
    vessels: 'Loading vessel positions…',
    warnings: 'Retrieving active warnings…',
    ports: 'Searching port directory…',
    map: 'Initialising map…',
  },

  map: {
    legendTitle: 'Vessel types',
    fullscreenEnter: 'Enter fullscreen',
    fullscreenExit: 'Exit fullscreen',
    lastUpdated: 'Last updated',
    liveNote: 'Positions stream live via WebSocket — updates every few seconds.',
    liveFallback: 'Connecting to live position stream…',
    zoneLegendHint: 'Shaded polygons show active navigational hazard zones (PostGIS).',
    simulatedNote: 'Positions are simulated for demonstration purposes.',
  },

  forms: {
    routeAdvisoryHint:
      'The engine combines live weather, active warnings, and vessel draught to assess voyage risk.',
    incidentHint:
      'Include location coordinates if known — this helps regulatory officials respond faster.',
    emergencyHint:
      'Broadcasts appear in the site-wide alert banner. Reserve CRITICAL for genuine emergencies.',
    berthHint: 'Status changes are logged and visible to all portal users.',
  },
};

export const vesselTypeLabels = {
  CARGO_FERRY: 'Cargo ferry',
  PASSENGER_FERRY: 'Passenger ferry',
  TANKER: 'Tanker',
  PATROL: 'Patrol',
  TUG: 'Tug',
  OTHER: 'Other',
};
