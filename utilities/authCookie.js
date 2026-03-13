const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

exports.encryptAuthCookie = async (payload = {}) => {
  return jwt.sign({
    role: payload.role,
    userId: Number(payload.userId)
  }, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn
  });
};

exports.encryptAuthToken = exports.encryptAuthCookie;

exports.decryptAuthCookie = async (token) => {
  if (!token) {
    return null;
  }

  try {
    const parsed = jwt.verify(token, authConfig.jwtSecret);

    if (!parsed?.role || !Number.isFinite(Number(parsed.userId))) {
      return null;
    }

    return {
      role: parsed.role,
      userId: Number(parsed.userId)
    };
  } catch (error) {
    return null;
  }
};

exports.decryptAuthToken = exports.decryptAuthCookie;
