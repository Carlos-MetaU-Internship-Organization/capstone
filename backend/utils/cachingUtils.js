const redis = require('redis')
const redisClient = redis.createClient({ url: process.env.REDIS_URL })
redisClient.connect().catch(console.error)

async function getCachedRecommendations(userId) {
  const cached = await redisClient.get(`recommendations:${userId}`)
  return cached ? JSON.parse(cached) : null;
}

async function setCachedRecommendations(userId, listings) {
  await redisClient.set(`recommendations:${userId}`, JSON.stringify(listings), 'EX', 60 * 60 * 4);
}

module.exports = {
  getCachedRecommendations,
  setCachedRecommendations
};