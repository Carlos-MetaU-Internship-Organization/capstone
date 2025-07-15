const { fetchSimilarListings } = require('./fetchRelevantListingsService')
const { logInfo } = require('../../frontend/src/utils/logging.service');
const computeSellerDelta = require('../utils/sellerHistory');
const { calculateMarketPrice } = require('../utils/statistics');
const { ROUNDING_DIGIT_PRICE } = require('../utils/constants')

async function getPriceRecommendationInfo(userInfo) {

  userInfo.year = parseInt(userInfo.year);
  userInfo.mileage = parseInt(userInfo.mileage);

  const usefulListingFeatures = {
    condition: userInfo.condition,
    make: userInfo.make,
    model: userInfo.model,
    year: userInfo.year,
    mileage: userInfo.mileage,
    latitude: userInfo.latitude,
    longitude: userInfo.longitude
  }
  const similarListingsResponse = await fetchSimilarListings(usefulListingFeatures);
  const listings = similarListingsResponse.listings;
  const depth = similarListingsResponse.depth;

  if (similarListingsResponse.status !== 200) {
    return { estimatedPrice: 0, message: 'Could not find similar listings' }
  }

  const sellerDelta = await computeSellerDelta(userInfo.sellerId);

  const marketPrice = calculateMarketPrice(listings, userInfo)

  const recommendedPrice = parseFloat((marketPrice * (1 + (sellerDelta / depth))).toFixed(ROUNDING_DIGIT_PRICE));

  const confidenceLevel = getConfidenceLevel(depth);

  return { marketPrice, recommendedPrice, confidenceLevel }
}

function getConfidenceLevel(depth) {
  const confidenceLevel = depth === 1 ? "very high"
                          : depth === 2 ? "high"
                          : depth === 3 ? "medium"
                          : depth === 4 ? "low"
                          : "very low"
  logInfo(`Confidence Level for the recommended price is ${confidenceLevel.toUpperCase()}`)
  return confidenceLevel;
}

module.exports = getPriceRecommendationInfo;