const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const warningCtrl = require('../controllers/warning.controller');

router.get('/zones', warningCtrl.getZones);
router.get('/at', warningCtrl.getAtPoint);
router.get('/templates', warningCtrl.getTemplates);
router.get('/', warningCtrl.getAll);
router.post('/', auth, role('REGULATORY_OFFICIAL'), warningCtrl.create);
router.put('/:id', auth, role('REGULATORY_OFFICIAL'), warningCtrl.update);
router.patch('/:id/clear', auth, role('REGULATORY_OFFICIAL'), warningCtrl.clear);
router.delete('/:id', auth, role('REGULATORY_OFFICIAL'), warningCtrl.remove);

module.exports = router;
