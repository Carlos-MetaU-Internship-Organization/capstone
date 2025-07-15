const { fetchSimilarListings } = require('./fetchRelevantListingsService')
const { logInfo } = require('../../frontend/src/utils/logging.service')
const computeSellerDelta = require('../utils/sellerHistory')
const { calculateMarketPrice } = require('../utils/statistics')
const buildElasticityCurve = require('../utils/elasticity')
const { ROUNDING_DIGIT_PRICE } = require('../utils/constants')

async function getPriceRecommendationInfo(allUserInfo) {

  allUserInfo.year = parseInt(allUserInfo.year);
  allUserInfo.mileage = parseInt(allUserInfo.mileage);

  const similarListingsResponse = await fetchSimilarListings(allUserInfo);
  const listings = similarListingsResponse.listings;
  const depth = similarListingsResponse.depth;

  if (similarListingsResponse.status !== 200) {
    return { estimatedPrice: 0, message: 'Could not find similar listings' }
  }

  const sellerDelta = await computeSellerDelta(allUserInfo.sellerId);

  const { marketPrice, enrichedListings } = calculateMarketPrice(listings, allUserInfo)

  const recommendedPrice = parseFloat((marketPrice * (1 + (sellerDelta / depth))).toFixed(ROUNDING_DIGIT_PRICE));

  const confidenceLevel = getConfidenceLevel(depth);

  const elasticity = buildElasticityCurve(enrichedListings, recommendedPrice);

  return { marketPrice, recommendedPrice, confidenceLevel, elasticity }
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