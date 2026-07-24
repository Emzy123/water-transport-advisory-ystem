const logger = require('../utils/logger');
const prisma = require('../utils/prisma');

/**
 * Dispatch emergency alert via Email and/or SMS channels to relevant target users.
 * @param {Object} params
 * @param {string} params.title - Title of emergency alert
 * @param {string} params.message - Content of emergency alert
 * @param {string} params.severity - Alert severity (CRITICAL, WARNING, INFO)
 * @param {boolean} [params.sendEmail=true] - Send email notifications
 * @param {boolean} [params.sendSms=false] - Send SMS notifications
 */
async function dispatchEmergencyNotification({ title, message, severity, sendEmail = true, sendSms = false }) {
  try {
    // Target active vessel operators and port managers
    const recipients = await prisma.user.findMany({
      where: {
        status: 'active',
        role: { in: ['VESSEL_OPERATOR', 'PORT_MANAGER', 'REGULATORY_OFFICIAL'] },
      },
      select: { id: true, fullName: true, email: true, role: true },
    });

    logger.info(
      { alertTitle: title, recipientCount: recipients.length, sendEmail, sendSms },
      'Dispatching multi-channel emergency notification'
    );

    const results = {
      totalRecipients: recipients.length,
      emailDispatched: 0,
      smsDispatched: 0,
    };

    if (sendEmail) {
      for (const recipient of recipients) {
        // Fallback structured log simulation for development/testing
        logger.info(
          { recipientEmail: recipient.email, recipientRole: recipient.role, severity },
          `[EMAIL DISPATCH] Urgent Alert: ${title}`
        );
        results.emailDispatched++;
      }
    }

    if (sendSms) {
      for (const recipient of recipients) {
        logger.info(
          { recipientEmail: recipient.email, recipientRole: recipient.role, severity },
          `[SMS DISPATCH] Urgent Alert: ${title} - ${message}`
        );
        results.smsDispatched++;
      }
    }

    return results;
  } catch (error) {
    logger.error({ error: error.message, title }, 'Failed to dispatch emergency notification');
    return { totalRecipients: 0, emailDispatched: 0, smsDispatched: 0, error: error.message };
  }
}

module.exports = {
  dispatchEmergencyNotification,
};
