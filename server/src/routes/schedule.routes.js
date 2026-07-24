const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const scheduleCtrl = require('../controllers/schedule.controller');

router.get('/', scheduleCtrl.getAll);
router.post('/', auth, role('PORT_MANAGER', 'REGULATORY_OFFICIAL'), scheduleCtrl.create);
router.put('/:id', auth, role('PORT_MANAGER', 'REGULATORY_OFFICIAL'), scheduleCtrl.update);

module.exports = router;
