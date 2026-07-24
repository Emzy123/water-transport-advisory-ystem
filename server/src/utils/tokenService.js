const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('./prisma');
const config = require('../config');

const ACCESS_EXPIRY = '15m';
const REFRESH_DAYS = 7;

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, fullName: user.fullName },
    config.jwtSecret,
    { expiresIn: ACCESS_EXPIRY }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

async function createRefreshToken(userId) {
  const token = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return { token, expiresAt };
}

async function revokeRefreshToken(token) {
  await prisma.refreshToken.updateMany({
    where: { token, revoked: false },
    data: { revoked: true },
  });
}

async function revokeAllUserTokens(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}

async function rotateRefreshToken(oldToken) {
  const existing = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
    include: { user: true },
  });

  if (existing && existing.revoked) {
    // Replay attack / token reuse detected. Revoke all tokens for this user for security.
    await revokeAllUserTokens(existing.userId);
  }

  if (!existing || existing.revoked || existing.expiresAt < new Date()) {
    return null;
  }

  if (existing.user.status !== 'active') {
    return null;
  }

  await revokeRefreshToken(oldToken);
  const refresh = await createRefreshToken(existing.userId);
  const accessToken = signAccessToken(existing.user);

  return {
    accessToken,
    refreshToken: refresh.token,
    user: existing.user,
  };
}

async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refresh = await createRefreshToken(user.id);
  return {
    token: accessToken,
    accessToken,
    refreshToken: refresh.token,
    expiresIn: ACCESS_EXPIRY,
    role: user.role,
    fullName: user.fullName,
    userId: user.id,
  };
}

module.exports = {
  signAccessToken,
  issueTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  ACCESS_EXPIRY,
};
