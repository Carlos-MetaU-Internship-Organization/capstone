const { fetchSimilarListings } = require('./fetchRelevantListingsService')
const { logInfo } = require('../../frontend/src/utils/logging.service');
const computeSellerMultiplier = require('../utils/sellerHistory');
const { calculateMarketPrice } = require('../utils/statistics');

async function getPriceRecommendationInfo(userInfo) {

  const usefulListingFeatures = {
    condition: userInfo.condition,
    make: userInfo.make,
    model: userInfo.model,
    year: parseInt(userInfo.year),
    mileage: parseInt(userInfo.mileage),
    latitude: userInfo.latitude,
    longitude: userInfo.longitude
  }
  const similarListingsResponse = await fetchSimilarListings(usefulListingFeatures);
  const listings = similarListingsResponse.listings;
  const depth = similarListingsResponse.depth;

  if (similarListingsResponse.status !== 200) {
    return { estimatedPrice: 0, message: 'Could not find similar listings' }
  }

  const sellerMultiplier = await computeSellerMultiplier(userInfo.sellerId);

  const marketPrice = calculateMarketPrice(listings, userInfo)

  let recommendedPrice = marketPrice;

  const confidenceLevel = getConfidenceLevel(depth);
  if (confidenceLevel === 'high') {
    recommendedPrice = (recommendedPrice * sellerMultiplier).toFixed(2);
    logInfo(`Recommended price adjusted to ${recommendedPrice} based on previous seller history`)
  }

  return { marketPrice, recommendedPrice, confidenceLevel }
}

function getConfidenceLevel(depth) {
  const confidenceLevel = depth === 1 ? "high"
                          : depth === 2 ? "medium"
                          : depth === 3 ? "low"
                          : "very low"
  logInfo(`Confidence Level for the recommended price is ${confidenceLevel.toUpperCase()}`)
  return confidenceLevel;
}

module.exports = getPriceRecommendationInfo;