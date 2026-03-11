const crypto = require('crypto');

const HASH_PREFIX = 'pbkdf2';
const ITERATIONS = 310000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';
const SALT_LENGTH = 16;

const pbkdf2Async = (password, salt, iterations, keyLength, digest) => new Promise((resolve, reject) => {
  crypto.pbkdf2(password, salt, iterations, keyLength, digest, (error, derivedKey) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(derivedKey);
  });
});

const timingSafeEqual = (left, right) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const isPasswordHash = (value = '') => String(value).startsWith(`${HASH_PREFIX}$`);

const hashPassword = async (password) => {
  const normalizedPassword = String(password);
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = await pbkdf2Async(normalizedPassword, salt, ITERATIONS, KEY_LENGTH, DIGEST);

  return [
    HASH_PREFIX,
    ITERATIONS,
    salt,
    derivedKey.toString('hex')
  ].join('$');
};

const verifyPassword = async (password, storedValue) => {
  const normalizedPassword = String(password);
  const normalizedStoredValue = String(storedValue || '');

  if (!isPasswordHash(normalizedStoredValue)) {
    return normalizedStoredValue === normalizedPassword;
  }

  const [, iterationValue, salt, expectedHash] = normalizedStoredValue.split('$');
  const iterations = Number(iterationValue);

  if (!iterations || !salt || !expectedHash) {
    return false;
  }

  const derivedKey = await pbkdf2Async(normalizedPassword, salt, iterations, KEY_LENGTH, DIGEST);
  return timingSafeEqual(derivedKey.toString('hex'), expectedHash);
};

module.exports = {
  hashPassword,
  isPasswordHash,
  verifyPassword
};
