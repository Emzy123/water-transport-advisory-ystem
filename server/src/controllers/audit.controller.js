const prisma = require('../utils/prisma');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

async function getAll(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 30 });
    const { action, userId, from, to } = req.query;

    const where = {
      ...(action && { action: { contains: action, mode: 'insensitive' } }),
      ...(userId && { userId: parseInt(userId, 10) }),
      ...(from || to
        ? {
            loggedAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { fullName: true, email: true, role: true } },
        },
        orderBy: { loggedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({ ...paginatedResponse(logs, total, page, limit), logs });
  } catch (e) {
    next(e);
  }
}

async function exportCsv(req, res, next) {
  try {
    const { action, userId, from, to } = req.query;
    const where = {
      ...(action && { action: { contains: action, mode: 'insensitive' } }),
      ...(userId && { userId: parseInt(userId, 10) }),
      ...(from || to
        ? {
            loggedAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: { select: { fullName: true, email: true, role: true } } },
      orderBy: { loggedAt: 'desc' },
      take: 1000,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');

    const header = 'ID,Action,Details,IP Address,User,Email,Role,Timestamp\n';
    const rows = logs
      .map(
        (l) =>
          `"${l.id}","${(l.action || '').replace(/"/g, '""')}","${(l.details || '').replace(
            /"/g,
            '""'
          )}","${l.ipAddress || ''}","${(l.user?.fullName || '').replace(/"/g, '""')}","${
            l.user?.email || ''
          }","${l.user?.role || ''}","${l.loggedAt.toISOString()}"`
      )
      .join('\n');

    res.send(header + rows);
  } catch (e) {
    next(e);
  }
}

module.exports = { getAll, exportCsv };
