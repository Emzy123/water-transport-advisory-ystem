const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const portCtrl = require('../controllers/port.controller');

router.get('/', portCtrl.getAll);
router.get('/:id', portCtrl.getOne);
router.put(
  '/:id/berths/:berthId',
  auth,
  role('PORT_MANAGER', 'REGULATORY_OFFICIAL'),
  portCtrl.updateBerth
);

module.exports = router;
