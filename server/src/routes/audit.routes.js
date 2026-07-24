const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const auditCtrl = require('../controllers/audit.controller');

router.get('/export', auth, role('REGULATORY_OFFICIAL'), auditCtrl.exportCsv);
router.get('/', auth, role('REGULATORY_OFFICIAL'), auditCtrl.getAll);

module.exports = router;
