const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authCtrl = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', authLimiter, authCtrl.validateRegister, authCtrl.register);
router.post('/login', authLimiter, authCtrl.validateLogin, authCtrl.login);
router.post('/refresh', authLimiter, authCtrl.validateRefresh, authCtrl.refresh);
router.post('/logout', auth, authCtrl.logout);
router.get('/me', auth, authCtrl.me);

module.exports = router;
