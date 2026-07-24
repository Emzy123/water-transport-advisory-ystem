const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const vesselCtrl = require('../controllers/vessel.controller');

router.get('/', vesselCtrl.getAll);
router.get('/:id', vesselCtrl.getOne);
router.put('/:id/position', auth, vesselCtrl.updatePosition);

module.exports = router;
