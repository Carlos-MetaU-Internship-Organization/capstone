const argon2 = require('argon2');

async function hashPassword(plainPassword) {
  try {
    const hash = await argon2.hash(plainPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1
    })
    return hash
  } catch (error) {
    
    console.error('Hashing failed:', err);
    throw error;
  }
}

async function verifyPassword(plainPassword, hash) {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch (error) {
    console.error('Verification failed:', error);
    return false;
  }
}

module.exports = { hashPassword, verifyPassword }