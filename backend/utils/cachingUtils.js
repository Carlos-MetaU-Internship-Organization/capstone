const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL)

async function getCachedRecommendations(userId) {
  const cached = await redis.get(`recommendations:${userId}`)
  return cached ? JSON.parse(cached) : null;
}

async function setCachedRecommendations(userId, listings) {
  await redis.set(`recommendations:${userId}`, JSON.stringify(listings), 'EX', 60 * 60 * 4);
}

module.exports = {
  getCachedRecommendations,
  setCachedRecommendations
};