const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY_LENGTH = 32;
const IV_LENGTH = 12;
const ENCODING = 'hex';

const hashSha256 = (value = '') => crypto
  .createHash('sha256')
  .update(String(value))
  .digest(ENCODING);

const isSha256Hash = (value = '') => /^[a-f0-9]{64}$/i.test(String(value));

const deriveEncryptionKey = (secret = '') => crypto
  .createHash('sha256')
  .update(String(secret))
  .digest()
  .subarray(0, ENCRYPTION_KEY_LENGTH);

const encodeBuffer = (value) => value.toString(ENCODING);
const decodeBuffer = (value = '') => Buffer.from(String(value), ENCODING);

const encryptPayload = async (payload, secret) => {
  const key = deriveEncryptionKey(secret);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return [
    encodeBuffer(iv),
    encodeBuffer(authTag),
    encodeBuffer(ciphertext)
  ].join('.');
};

const decryptPayload = async (token, secret) => {
  if (!token) {
    return null;
  }

  const [ivHex, authTagHex, encryptedHex] = String(token).split('.');
  if (!ivHex || !authTagHex || !encryptedHex) {
    return null;
  }

  try {
    const key = deriveEncryptionKey(secret);
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      decodeBuffer(ivHex)
    );

    decipher.setAuthTag(decodeBuffer(authTagHex));

    const decrypted = Buffer.concat([
      decipher.update(decodeBuffer(encryptedHex)),
      decipher.final()
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    return null;
  }
};

module.exports = {
  decryptPayload,
  deriveEncryptionKey,
  encryptPayload,
  hashSha256,
  isSha256Hash
};
