const prisma = require('./prisma');

async function logAction(userId, action, details, ipAddress) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, details, ipAddress },
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}

module.exports = { logAction };
