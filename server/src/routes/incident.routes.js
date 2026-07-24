const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const incidentCtrl = require('../controllers/incident.controller');

router.get('/export', auth, incidentCtrl.exportCsv);
router.get('/', auth, incidentCtrl.getAll);
router.post('/', auth, role('VESSEL_OPERATOR', 'REGULATORY_OFFICIAL', 'PORT_MANAGER'), incidentCtrl.create);
router.patch('/:id/status', auth, role('REGULATORY_OFFICIAL'), incidentCtrl.updateStatus);

module.exports = router;
