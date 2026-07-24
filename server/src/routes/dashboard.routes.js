const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const dashboardCtrl = require('../controllers/dashboard.controller');

router.get('/stats', auth, dashboardCtrl.getStats);

module.exports = router;
