const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const { logAction } = require('../utils/audit');
const { issueTokenPair, rotateRefreshToken, revokeRefreshToken } = require('../utils/tokenService');
const validate = require('../middleware/validate.middleware');

const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/[A-Z]/)
    .withMessage('Password must be at least 8 characters with one uppercase letter'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const refreshValidation = [body('refreshToken').optional()];

async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { fullName, email, passwordHash: hash, role: 'PUBLIC' },
      select: { id: true, fullName: true, email: true, role: true },
    });

    await logAction(user.id, 'REGISTER', `${email} registered`, req.ip);
    res.status(201).json({ message: 'Registered successfully', user });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    let valid = false;
    if (user && user.status === 'active') {
      valid = await bcrypt.compare(password, user.passwordHash);
    } else {
      // Dummy comparison to prevent user enumeration via timing attacks
      await bcrypt.compare(password, '$2a$10$UnFnMm2Fha2VEYXNoSW52YWxpZEhhc2g=');
    }

    if (!user || user.status !== 'active' || !valid) {
      throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const tokens = await issueTokenPair(user);
    await logAction(user.id, 'LOGIN', `${user.email} logged in`, req.ip);

    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json(tokens);
  } catch (e) {
    next(e);
  }
}

async function refresh(req, res, next) {
  try {
    let token = req.body?.refreshToken;
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.split('; ').find((row) => row.startsWith('refreshToken='));
      if (match) token = match.split('=')[1];
    }

    if (!token) {
      throw ApiError.badRequest('Refresh token is required', 'MISSING_REFRESH_TOKEN');
    }

    const result = await rotateRefreshToken(token);

    if (!result) {
      throw ApiError.unauthorized('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    res.cookie('accessToken', result.accessToken, { httpOnly: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', result.refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({
      token: result.accessToken,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      role: result.user.role,
      fullName: result.user.fullName,
      userId: result.user.id,
    });
  } catch (e) {
    next(e);
  }
}

async function logout(req, res, next) {
  try {
    let token = req.body?.refreshToken;
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.split('; ').find((row) => row.startsWith('refreshToken='));
      if (match) token = match.split('=')[1];
    }

    if (token) {
      await revokeRefreshToken(token);
    }
    if (req.user?.id) {
      await logAction(req.user.id, 'LOGOUT', 'User logged out', req.ip);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (e) {
    next(e);
  }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, fullName: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw ApiError.notFound('User not found');
    res.json(user);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  registerValidation,
  loginValidation,
  refreshValidation,
  validateRegister: validate(registerValidation),
  validateLogin: validate(loginValidation),
  validateRefresh: validate(refreshValidation),
};
