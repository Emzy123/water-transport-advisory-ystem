const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const weatherCtrl = require('../controllers/weather.controller');
const { weatherLimiter } = require('../middleware/rateLimit.middleware');

router.get('/', weatherLimiter, weatherCtrl.getCurrent);
router.get('/history', auth, role('REGULATORY_OFFICIAL'), weatherCtrl.getHistory);

module.exports = router;
