const prisma = require('../utils/prisma');
const { logAction } = require('../utils/audit');
const { dispatchEmergencyNotification } = require('../services/notification.service');

async function getActive(req, res, next) {
  try {
    const now = new Date();
    const alerts = await prisma.emergencyAlert.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ severity: 'desc' }, { issuedAt: 'desc' }],
    });
    res.json(alerts);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const { title, message, severity, expiresAt, sendEmail = true, sendSms = false } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const alert = await prisma.emergencyAlert.create({
      data: {
        title,
        message,
        severity: severity || 'WARNING',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        issuedBy: req.user.id,
      },
    });

    const dispatchResult = await dispatchEmergencyNotification({
      title,
      message,
      severity: alert.severity,
      sendEmail,
      sendSms,
    });

    await logAction(
      req.user.id,
      'ALERT_BROADCAST',
      `${title} (Recipients: ${dispatchResult.totalRecipients}, Email: ${dispatchResult.emailDispatched}, SMS: ${dispatchResult.smsDispatched})`,
      req.ip
    );
    res.status(201).json({ ...alert, notificationSummary: dispatchResult });
  } catch (e) {
    next(e);
  }
}

async function deactivate(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const alert = await prisma.emergencyAlert.update({
      where: { id },
      data: { isActive: false },
    });
    await logAction(req.user.id, 'ALERT_DEACTIVATE', `Alert #${id} deactivated`, req.ip);
    res.json(alert);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Alert not found' });
    next(e);
  }
}

module.exports = { getActive, create, deactivate };
