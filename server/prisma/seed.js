const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { CORRIDOR_ZONES, syncWarningGeometry } = require('../src/utils/geoService');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password@1', 10);

  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin Official',
      email: 'admin@portal.ng',
      passwordHash: hash,
      role: 'REGULATORY_OFFICIAL',
    },
  });

  const pm = await prisma.user.create({
    data: {
      fullName: 'Port Manager Lokoja',
      email: 'pm@portal.ng',
      passwordHash: hash,
      role: 'PORT_MANAGER',
    },
  });

  const captain = await prisma.user.create({
    data: {
      fullName: 'Capt. Yusuf Bello',
      email: 'capt@portal.ng',
      passwordHash: hash,
      role: 'VESSEL_OPERATOR',
    },
  });

  const lokoja = await prisma.port.create({
    data: {
      portName: 'Lokoja River Port',
      locationName: 'Lokoja, Kogi State',
      latitude: 7.8003,
      longitude: 6.7332,
      contactPhone: '+234-801-000-0001',
      operationalHours: '06:00 - 20:00',
      berthCount: 4,
      managerId: pm.id,
    },
  });

  const onitsha = await prisma.port.create({
    data: {
      portName: 'Onitsha River Port',
      locationName: 'Onitsha, Anambra State',
      latitude: 6.1676,
      longitude: 6.7858,
      contactPhone: '+234-801-000-0003',
      operationalHours: '07:00 - 19:00',
      berthCount: 5,
      managerId: pm.id,
    },
  });

  await prisma.port.create({
    data: {
      portName: 'Baro River Port',
      locationName: 'Baro, Niger State',
      latitude: 8.6167,
      longitude: 6.4,
      contactPhone: '+234-801-000-0002',
      operationalHours: '06:00 - 18:00',
      berthCount: 3,
      managerId: pm.id,
    },
  });

  await prisma.port.create({
    data: {
      portName: 'Warri Port',
      locationName: 'Warri, Delta State',
      latitude: 5.5167,
      longitude: 5.75,
      contactPhone: '+234-801-000-0004',
      operationalHours: '06:00 - 22:00',
      berthCount: 6,
      managerId: pm.id,
    },
  });

  await prisma.berthRecord.createMany({
    data: [
      { berthName: 'Berth A1', status: 'AVAILABLE', portId: lokoja.id },
      { berthName: 'Berth A2', status: 'OCCUPIED', portId: lokoja.id },
      { berthName: 'Berth A3', status: 'AVAILABLE', portId: lokoja.id },
      { berthName: 'Berth C1', status: 'AVAILABLE', portId: onitsha.id },
      { berthName: 'Berth C2', status: 'MAINTENANCE', portId: onitsha.id },
    ],
  });

  await prisma.vessel.createMany({
    data: [
      {
        vesselName: 'MV Niger Star',
        registrationNumber: 'NIG-2021-0045',
        vesselType: 'CARGO_FERRY',
        operatorId: captain.id,
        latitude: 7.82,
        longitude: 6.74,
        speed: 8.5,
        heading: 180,
      },
      {
        vesselName: 'MV Benue Pride',
        registrationNumber: 'NIG-2019-0112',
        vesselType: 'PASSENGER_FERRY',
        operatorId: captain.id,
        latitude: 8.59,
        longitude: 6.41,
        speed: 12.0,
        heading: 270,
      },
      {
        vesselName: 'MT River Queen',
        registrationNumber: 'NIG-2020-0087',
        vesselType: 'TANKER',
        operatorId: captain.id,
        latitude: 6.19,
        longitude: 6.79,
        speed: 6.0,
        heading: 90,
      },
      {
        vesselName: 'MV Confluence',
        registrationNumber: 'NIG-2022-0033',
        vesselType: 'PATROL',
        operatorId: captain.id,
        latitude: 7.78,
        longitude: 6.72,
        speed: 0.0,
        heading: 0,
      },
    ],
  });

  const warningSeeds = [
    {
      title: 'Shallow Water — Baro Reach',
      description:
        'River depth at Baro Reach has dropped below 1.5m. Vessels with draught exceeding 1.2m must avoid this section.',
      severity: 'HIGH',
      zoneTemplate: 'baro_reach',
      publishedBy: admin.id,
      status: 'ACTIVE',
    },
    {
      title: 'Submerged Obstruction — Lokoja Junction',
      description:
        'A submerged tree trunk reported at 7.79°N, 6.73°E. Navigate with extreme caution.',
      severity: 'CRITICAL',
      zoneTemplate: 'lokoja_confluence',
      publishedBy: admin.id,
      status: 'ACTIVE',
    },
    {
      title: 'Sand Bar — Onitsha Approach',
      description:
        'New sand bar on eastern approach to Onitsha Port. Use western channel.',
      severity: 'MEDIUM',
      zoneTemplate: 'onitsha_approach',
      publishedBy: admin.id,
      status: 'ACTIVE',
    },
  ];

  for (const seed of warningSeeds) {
    const template = CORRIDOR_ZONES[seed.zoneTemplate];
    const { zoneTemplate, ...data } = seed;
    const warning = await prisma.navWarning.create({
      data: {
        ...data,
        affectedZone: template.label,
        zoneGeoJson: template.geoJson,
      },
    });
    await syncWarningGeometry(warning.id, template.geoJson);
  }

  await prisma.ferrySchedule.createMany({
    data: [
      {
        portId: lokoja.id,
        destination: 'Onitsha River Port',
        departure: '07:00',
        daysOfWeek: 'Mon,Wed,Fri',
        vesselName: 'MV Niger Star',
        fare: 2500,
        publishedBy: pm.id,
      },
      {
        portId: onitsha.id,
        destination: 'Warri Port',
        departure: '08:00',
        daysOfWeek: 'Mon-Fri',
        vesselName: 'MV Benue Pride',
        fare: 3500,
        publishedBy: pm.id,
      },
    ],
  });

  await prisma.emergencyAlert.create({
    data: {
      title: 'STORM ADVISORY — All Vessels',
      message:
        'Heavy rainfall and winds >40 km/h forecast for the Niger corridor from 18:00. All non-essential vessels should seek safe anchorage.',
      severity: 'WARNING',
      issuedBy: admin.id,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
