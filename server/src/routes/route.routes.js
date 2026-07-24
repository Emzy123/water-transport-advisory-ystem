const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const routeCtrl = require('../controllers/route.controller');

router.get('/', auth, routeCtrl.getAll);
router.post('/', auth, role('VESSEL_OPERATOR', 'REGULATORY_OFFICIAL', 'PORT_MANAGER'), routeCtrl.create);

module.exports = router;
