const redisClient = require('./../cache/redisClient')
const { CACHE_RECOMMENDED_LISTINGS_EXP_TIME } = require('./constants')

async function getCachedRecommendations(userId) {
  const cached = await redisClient.get(`recommendations:${userId}`)
  return cached ? JSON.parse(cached) : null;
}

async function setCachedRecommendations(userId, listings) {
  await redisClient.set(`recommendations:${userId}`, JSON.stringify(listings), { EX: CACHE_RECOMMENDED_LISTINGS_EXP_TIME });
}

module.exports = {
  getCachedRecommendations,
  setCachedRecommendations
};