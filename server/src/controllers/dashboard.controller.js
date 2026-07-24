const prisma = require('../utils/prisma');

async function getStats(req, res, next) {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    let stats = {};

    if (role === 'REGULATORY_OFFICIAL') {
      const [activeWarnings, pendingIncidents, totalVessels, activeAlerts] = await Promise.all([
        prisma.navWarning.count({ where: { status: 'ACTIVE' } }),
        prisma.incidentReport.count({
          where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
        }),
        prisma.vessel.count(),
        prisma.emergencyAlert.count({ where: { isActive: true } }),
      ]);

      stats = {
        activeWarnings,
        pendingIncidents,
        totalVessels,
        activeAlerts,
      };
    } else if (role === 'PORT_MANAGER') {
      const ports = await prisma.port.findMany({
        where: { managerId: userId },
        include: {
          berths: true,
          schedules: true,
        },
      });

      let totalBerths = 0;
      let availableBerths = 0;
      let occupiedBerths = 0;
      let maintenanceBerths = 0;
      let activeSchedules = 0;

      for (const p of ports) {
        totalBerths += p.berths.length;
        availableBerths += p.berths.filter((b) => b.status === 'AVAILABLE').length;
        occupiedBerths += p.berths.filter((b) => b.status === 'OCCUPIED').length;
        maintenanceBerths += p.berths.filter((b) => b.status === 'MAINTENANCE').length;
        activeSchedules += p.schedules.filter((s) => s.isActive).length;
      }

      stats = {
        managedPortsCount: ports.length,
        totalBerths,
        availableBerths,
        occupiedBerths,
        maintenanceBerths,
        activeSchedules,
      };
    } else if (role === 'VESSEL_OPERATOR') {
      const [operatedVessels, submittedIncidents, activeWarnings, activeAlerts] = await Promise.all([
        prisma.vessel.count({ where: { operatorId: userId } }),
        prisma.incidentReport.count({ where: { reportedBy: userId } }),
        prisma.navWarning.count({ where: { status: 'ACTIVE' } }),
        prisma.emergencyAlert.count({ where: { isActive: true } }),
      ]);

      stats = {
        operatedVessels,
        submittedIncidents,
        activeWarnings,
        activeAlerts,
      };
    } else {
      // Default / Public
      const [activeWarnings, totalPorts, activeSchedules] = await Promise.all([
        prisma.navWarning.count({ where: { status: 'ACTIVE' } }),
        prisma.port.count(),
        prisma.ferrySchedule.count({ where: { isActive: true } }),
      ]);

      stats = {
        activeWarnings,
        totalPorts,
        activeSchedules,
      };
    }

    res.json({ role, stats });
  } catch (e) {
    next(e);
  }
}

module.exports = { getStats };
