const crypto = require('crypto');
const authConfig = require('../config/auth');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

const getKey = () => crypto
  .createHash('sha256')
  .update(String(authConfig.authCookieSecret))
  .digest();

exports.encryptAuthCookie = async (payload = {}) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify({
      role: payload.role,
      userId: Number(payload.userId)
    }), 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex')
  ].join('.');
};

exports.encryptAuthToken = exports.encryptAuthCookie;

exports.decryptAuthCookie = async (token) => {
  if (!token) {
    return null;
  }

  const [ivHex, authTagHex, encryptedHex] = String(token).split('.');
  if (!ivHex || !authTagHex || !encryptedHex) {
    return null;
  }

  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      getKey(),
      Buffer.from(ivHex, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final()
    ]);
    const parsed = JSON.parse(decrypted.toString('utf8'));

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
