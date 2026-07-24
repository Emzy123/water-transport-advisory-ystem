const express = require('express');

const router = express.Router();

router.use('/auth', require('../auth.routes'));
router.use('/vessels', require('../vessel.routes'));
router.use('/weather', require('../weather.routes'));
router.use('/warnings', require('../warning.routes'));
router.use('/ports', require('../port.routes'));
router.use('/schedules', require('../schedule.routes'));
router.use('/routes', require('../route.routes'));
router.use('/alerts', require('../alert.routes'));
router.use('/incidents', require('../incident.routes'));
router.use('/audit', require('../audit.routes'));
router.use('/dashboard', require('../dashboard.routes'));
router.use('/metrics', require('../metrics.routes'));

module.exports = router;
