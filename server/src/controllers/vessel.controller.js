const prisma = require('../utils/prisma');
const vesselHub = require('../ws/vesselHub');

async function getAll(req, res, next) {
  try {
    const vessels = await prisma.vessel.findMany({
      include: {
        operator: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { vesselName: 'asc' },
    });
    res.json(vessels);
  } catch (e) {
    next(e);
  }
}

async function getOne(req, res, next) {
  try {
    const vessel = await prisma.vessel.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: {
        operator: { select: { id: true, fullName: true, email: true } },
      },
    });
    if (!vessel) return res.status(404).json({ error: 'Vessel not found' });
    res.json(vessel);
  } catch (e) {
    next(e);
  }
}

async function updatePosition(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const vessel = await prisma.vessel.findUnique({ where: { id } });
    if (!vessel) return res.status(404).json({ error: 'Vessel not found' });

    const isOwner = vessel.operatorId === req.user.id;
    const isRegulatory = req.user.role === 'REGULATORY_OFFICIAL';
    if (!isOwner && !isRegulatory) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { latitude, longitude, speed, heading } = req.body;
    const updated = await prisma.vessel.update({
      where: { id },
      data: {
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(speed !== undefined && { speed: parseFloat(speed) }),
        ...(heading !== undefined && { heading: parseInt(heading, 10) }),
      },
      include: {
        operator: { select: { id: true, fullName: true, email: true } },
      },
    });

    vesselHub.broadcastPositionUpdates([
      {
        id: updated.id,
        latitude: updated.latitude,
        longitude: updated.longitude,
        speed: updated.speed,
        heading: updated.heading,
        lastUpdated: updated.lastUpdated,
      },
    ]);
    res.json(updated);
  } catch (e) {
    next(e);
  }
}

module.exports = { getAll, getOne, updatePosition };
