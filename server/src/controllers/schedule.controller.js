const prisma = require('../utils/prisma');
const { logAction } = require('../utils/audit');

async function getAll(req, res, next) {
  try {
    const portId = req.query.portId ? parseInt(req.query.portId, 10) : undefined;
    const schedules = await prisma.ferrySchedule.findMany({
      where: {
        isActive: true,
        ...(portId && { portId }),
      },
      include: {
        port: { select: { portName: true, locationName: true } },
        publisher: { select: { fullName: true } },
      },
      orderBy: { departure: 'asc' },
    });
    res.json(schedules);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const { portId, destination, departure, daysOfWeek, vesselName, fare } = req.body;
    if (!portId || !destination || !departure || !daysOfWeek) {
      return res.status(400).json({ error: 'portId, destination, departure, and daysOfWeek are required' });
    }

    const port = await prisma.port.findUnique({ where: { id: parseInt(portId, 10) } });
    if (!port) return res.status(404).json({ error: 'Port not found' });

    if (req.user.role === 'PORT_MANAGER' && port.managerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only manage schedules for your assigned ports' });
    }

    const schedule = await prisma.ferrySchedule.create({
      data: {
        portId: parseInt(portId, 10),
        destination,
        departure,
        daysOfWeek,
        vesselName,
        fare: fare ? parseFloat(fare) : null,
        publishedBy: req.user.id,
      },
      include: { port: { select: { portName: true } } },
    });

    await logAction(req.user.id, 'SCHEDULE_CREATE', `${destination} from ${port.portName}`, req.ip);
    res.status(201).json(schedule);
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.ferrySchedule.findUnique({
      where: { id },
      include: { port: true },
    });
    if (!existing) return res.status(404).json({ error: 'Schedule not found' });

    if (req.user.role === 'PORT_MANAGER' && existing.port.managerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { destination, departure, daysOfWeek, vesselName, fare, isActive } = req.body;
    const schedule = await prisma.ferrySchedule.update({
      where: { id },
      data: {
        ...(destination && { destination }),
        ...(departure && { departure }),
        ...(daysOfWeek && { daysOfWeek }),
        ...(vesselName !== undefined && { vesselName }),
        ...(fare !== undefined && { fare: fare ? parseFloat(fare) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json(schedule);
  } catch (e) {
    next(e);
  }
}

module.exports = { getAll, create, update };
