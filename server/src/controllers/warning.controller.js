const prisma = require('../utils/prisma');
const { logAction } = require('../utils/audit');
const geoService = require('../utils/geoService');

async function getAll(req, res, next) {
  try {
    const status = req.query.status || 'ACTIVE';
    const warnings = await prisma.navWarning.findMany({
      where: status === 'ALL' ? {} : { status },
      include: {
        publisher: { select: { id: true, fullName: true } },
      },
      orderBy: [{ severity: 'desc' }, { publishedAt: 'desc' }],
    });
    res.json(warnings);
  } catch (e) {
    next(e);
  }
}

async function getZones(req, res, next) {
  try {
    const zones = await geoService.findActiveZones();
    res.json(zones);
  } catch (e) {
    next(e);
  }
}

async function getAtPoint(req, res, next) {
  try {
    const { lat, lng, status = 'ACTIVE' } = req.query;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'lat and lng query parameters are required' });
    }

    const warnings = await geoService.findWarningsAtPoint(lat, lng, status);
    res.json({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      count: warnings.length,
      warnings,
    });
  } catch (e) {
    if (e.message?.includes('Invalid latitude')) {
      return res.status(400).json({ error: e.message });
    }
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const { title, description, severity, affectedZone, expectedClearance, zoneGeoJson, zoneTemplate } =
      req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    let resolvedGeoJson = zoneGeoJson;
    let resolvedZone = affectedZone;

    if (zoneTemplate && geoService.CORRIDOR_ZONES[zoneTemplate]) {
      const template = geoService.CORRIDOR_ZONES[zoneTemplate];
      resolvedGeoJson = template.geoJson;
      resolvedZone = resolvedZone || template.label;
    }

    if (resolvedGeoJson) {
      geoService.validateGeoJson(resolvedGeoJson);
    }

    const warning = await prisma.navWarning.create({
      data: {
        title,
        description,
        severity: severity || 'MEDIUM',
        affectedZone: resolvedZone,
        zoneGeoJson: resolvedGeoJson || null,
        expectedClearance: expectedClearance ? new Date(expectedClearance) : null,
        publishedBy: req.user.id,
      },
      include: { publisher: { select: { fullName: true } } },
    });

    await geoService.syncWarningGeometry(warning.id, resolvedGeoJson || null);
    await logAction(req.user.id, 'WARNING_CREATE', title, req.ip);
    res.status(201).json(warning);
  } catch (e) {
    if (e.message?.startsWith('zoneGeoJson')) {
      return res.status(400).json({ error: e.message });
    }
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, severity, affectedZone, expectedClearance, status, zoneGeoJson } =
      req.body;

    if (zoneGeoJson !== undefined && zoneGeoJson !== null) {
      geoService.validateGeoJson(zoneGeoJson);
    }

    const warning = await prisma.navWarning.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(severity && { severity }),
        ...(affectedZone !== undefined && { affectedZone }),
        ...(zoneGeoJson !== undefined && { zoneGeoJson }),
        ...(expectedClearance !== undefined && {
          expectedClearance: expectedClearance ? new Date(expectedClearance) : null,
        }),
        ...(status && { status }),
      },
    });

    if (zoneGeoJson !== undefined) {
      await geoService.syncWarningGeometry(id, zoneGeoJson);
    }

    await logAction(req.user.id, 'WARNING_UPDATE', `Updated warning #${id}`, req.ip);
    res.json(warning);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Warning not found' });
    if (e.message?.startsWith('zoneGeoJson')) {
      return res.status(400).json({ error: e.message });
    }
    next(e);
  }
}

async function clear(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const warning = await prisma.navWarning.update({
      where: { id },
      data: { status: 'CLEARED' },
    });
    await logAction(req.user.id, 'WARNING_CLEAR', `Cleared warning #${id}`, req.ip);
    res.json(warning);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Warning not found' });
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.navWarning.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
    await logAction(req.user.id, 'WARNING_ARCHIVE', `Archived warning #${id}`, req.ip);
    res.json({ message: 'Warning archived' });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Warning not found' });
    next(e);
  }
}

async function getTemplates(req, res) {
  res.json(
    Object.entries(geoService.CORRIDOR_ZONES).map(([key, value]) => ({
      id: key,
      label: value.label,
      geoJson: value.geoJson,
    }))
  );
}

module.exports = { getAll, getZones, getAtPoint, getTemplates, create, update, clear, remove };
