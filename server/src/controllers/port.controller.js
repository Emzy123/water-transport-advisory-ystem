const prisma = require('../utils/prisma');
const { logAction } = require('../utils/audit');

async function getAll(req, res, next) {
  try {
    const q = req.query.q?.trim();
    const ports = await prisma.port.findMany({
      where: q
        ? {
            OR: [
              { portName: { contains: q, mode: 'insensitive' } },
              { locationName: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {},
      include: {
        manager: { select: { fullName: true } },
        berths: true,
        _count: { select: { schedules: true } },
      },
      orderBy: { portName: 'asc' },
    });
    res.json(ports);
  } catch (e) {
    next(e);
  }
}

async function getOne(req, res, next) {
  try {
    const port = await prisma.port.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: {
        manager: { select: { fullName: true, email: true } },
        berths: { orderBy: { berthName: 'asc' } },
        schedules: { where: { isActive: true } },
      },
    });
    if (!port) return res.status(404).json({ error: 'Port not found' });
    res.json(port);
  } catch (e) {
    next(e);
  }
}

async function updateBerth(req, res, next) {
  try {
    const portId = parseInt(req.params.id, 10);
    const berthId = parseInt(req.params.berthId, 10);
    const { status } = req.body;

    const port = await prisma.port.findUnique({ where: { id: portId } });
    if (!port) return res.status(404).json({ error: 'Port not found' });

    if (req.user.role === 'PORT_MANAGER' && port.managerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only manage your assigned ports' });
    }

    const berth = await prisma.berthRecord.findFirst({
      where: { id: berthId, portId },
    });
    if (!berth) return res.status(404).json({ error: 'Berth not found' });

    const updated = await prisma.berthRecord.update({
      where: { id: berthId },
      data: {
        status: status || berth.status,
        updatedById: req.user.id,
      },
    });

    await logAction(
      req.user.id,
      'BERTH_UPDATE',
      `${berth.berthName} → ${updated.status}`,
      req.ip
    );
    res.json(updated);
  } catch (e) {
    next(e);
  }
}

module.exports = { getAll, getOne, updateBerth };
