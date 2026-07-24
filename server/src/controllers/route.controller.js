const prisma = require('../utils/prisma');
const { fetchWeather } = require('../utils/weatherService');
const { generateAdvisory } = require('../utils/advisoryEngine');
const { logAction } = require('../utils/audit');
const geoService = require('../utils/geoService');

async function create(req, res, next) {
  try {
    const { departure, destination, vesselId, estTransitHours } = req.body;
    if (!departure || !destination) {
      return res.status(400).json({ error: 'Departure and destination are required' });
    }

    const weather = await fetchWeather();
    let warnings = await prisma.navWarning.findMany({ where: { status: 'ACTIVE' } });

    let vesselDraught = null;
    let vesselPosition = null;
    if (vesselId) {
      const vessel = await prisma.vessel.findUnique({
        where: { id: parseInt(vesselId, 10) },
      });
      if (!vessel) {
        return res.status(404).json({ error: 'Vessel not found' });
      }

      const isOwner = vessel.operatorId === req.user.id;
      const isRegulatory = req.user.role === 'REGULATORY_OFFICIAL';
      if (!isOwner && !isRegulatory) {
        return res.status(403).json({ error: 'Access denied: You do not operate this vessel' });
      }

      vesselDraught = vessel.maxDraught;
      vesselPosition = { lat: vessel.latitude, lng: vessel.longitude };
    }

    if (vesselPosition) {
      const geoWarnings = await geoService.findWarningsAtPoint(
        vesselPosition.lat,
        vesselPosition.lng
      );
      if (geoWarnings.length) {
        warnings = geoWarnings;
      }
    }

    const advisory = generateAdvisory(weather.type, warnings, vesselDraught, vesselPosition);

    const route = await prisma.routeAdvisory.create({
      data: {
        departure,
        destination,
        recommendedRoute: advisory.recommendedRoute,
        riskLevel: advisory.riskLevel,
        estTransitHours: estTransitHours ? parseFloat(estTransitHours) : null,
        advisoryText: advisory.advisoryText,
        vesselId: vesselId ? parseInt(vesselId, 10) : null,
        requestedBy: req.user.id,
      },
      include: {
        vessel: { select: { vesselName: true } },
        requester: { select: { fullName: true } },
      },
    });

    await logAction(
      req.user.id,
      'ROUTE_ADVISORY',
      `${departure} → ${destination} (${advisory.riskLevel})`,
      req.ip
    );

    res.status(201).json({ ...route, weather: { type: weather.type, text: weather.text } });
  } catch (e) {
    next(e);
  }
}

async function getAll(req, res, next) {
  try {
    const where =
      req.user.role === 'REGULATORY_OFFICIAL'
        ? {}
        : { requestedBy: req.user.id };

    const routes = await prisma.routeAdvisory.findMany({
      where,
      include: {
        vessel: { select: { vesselName: true } },
        requester: { select: { fullName: true } },
      },
      orderBy: { generatedAt: 'desc' },
      take: 50,
    });
    res.json(routes);
  } catch (e) {
    next(e);
  }
}

module.exports = { create, getAll };
