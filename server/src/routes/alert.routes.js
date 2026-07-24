const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const alertCtrl = require('../controllers/alert.controller');

router.get('/active', alertCtrl.getActive);
router.post('/', auth, role('REGULATORY_OFFICIAL'), alertCtrl.create);
router.patch('/:id/deactivate', auth, role('REGULATORY_OFFICIAL'), alertCtrl.deactivate);

module.exports = router;
