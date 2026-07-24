const prisma = require('../utils/prisma');
const { fetchWeather } = require('../utils/weatherService');

async function getCurrent(req, res, next) {
  try {
    const parsedLat = parseFloat(req.query.lat);
    const parsedLon = parseFloat(req.query.lon);
    const lat = Number.isNaN(parsedLat) ? 7.8 : parsedLat;
    const lon = Number.isNaN(parsedLon) ? 6.73 : parsedLon;
    const location = req.query.location || 'Niger-Benue Corridor';
    const data = await fetchWeather(lat, lon, location);
    res.json(data);
  } catch (e) {
    next(e);
  }
}

async function getHistory(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      prisma.weatherAdvisory.findMany({
        orderBy: { generatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.weatherAdvisory.count(),
    ]);

    res.json({ records, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    next(e);
  }
}

module.exports = { getCurrent, getHistory };
