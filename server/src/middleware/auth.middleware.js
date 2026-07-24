const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../utils/prisma');

module.exports = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.split('; ').find((row) => row.startsWith('accessToken='));
    if (match) token = match.split('=')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Account inactive or not found' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
