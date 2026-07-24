const prisma = require('../utils/prisma');
const { logAction } = require('../utils/audit');

async function getAll(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where =
      req.user.role === 'REGULATORY_OFFICIAL'
        ? {}
        : { reportedBy: req.user.id };

    const [incidents, total] = await Promise.all([
      prisma.incidentReport.findMany({
        where,
        include: {
          vessel: { select: { vesselName: true } },
          reporter: { select: { fullName: true, email: true } },
        },
        orderBy: { reportedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.incidentReport.count({ where }),
    ]);

    res.json({ incidents, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const { incidentType, description, latitude, longitude, severity, vesselId } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

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
    }

    const incident = await prisma.incidentReport.create({
      data: {
        incidentType,
        description,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        severity: severity || 'MODERATE',
        vesselId: vesselId ? parseInt(vesselId, 10) : null,
        reportedBy: req.user.id,
      },
      include: {
        vessel: { select: { vesselName: true } },
        reporter: { select: { fullName: true } },
      },
    });

    await logAction(req.user.id, 'INCIDENT_REPORT', incidentType || 'General', req.ip);
    res.status(201).json(incident);
  } catch (e) {
    next(e);
  }
}

async function updateStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!['SUBMITTED', 'UNDER_REVIEW', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const incident = await prisma.incidentReport.update({
      where: { id },
      data: { status },
    });

    await logAction(req.user.id, 'INCIDENT_STATUS', `#${id} → ${status}`, req.ip);
    res.json(incident);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Incident not found' });
    next(e);
  }
}

async function exportCsv(req, res, next) {
  try {
    const where = req.user.role === 'REGULATORY_OFFICIAL' ? {} : { reportedBy: req.user.id };

    const incidents = await prisma.incidentReport.findMany({
      where,
      include: {
        vessel: { select: { vesselName: true } },
        reporter: { select: { fullName: true, email: true } },
      },
      orderBy: { reportedAt: 'desc' },
      take: 1000,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="incidents-report.csv"');

    const header = 'ID,Type,Severity,Status,Vessel,Latitude,Longitude,Reporter,ReportedAt,Description\n';
    const rows = incidents
      .map(
        (i) =>
          `"${i.id}","${(i.incidentType || '').replace(/"/g, '""')}","${i.severity}","${i.status}","${(
            i.vessel?.vesselName || ''
          ).replace(/"/g, '""')}","${i.latitude || ''}","${i.longitude || ''}","${(
            i.reporter?.fullName || ''
          ).replace(/"/g, '""')}","${i.reportedAt.toISOString()}","${(i.description || '').replace(
            /"/g,
            '""'
          )}"`
      )
      .join('\n');

    res.send(header + rows);
  } catch (e) {
    next(e);
  }
}

module.exports = { getAll, create, updateStatus, exportCsv };
