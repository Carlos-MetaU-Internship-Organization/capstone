const { fetchSimilarListings } = require('./fetchRelevantListingsService')
const { logInfo } = require('../../frontend/src/services/loggingService')
const computeSellerDelta = require('../utils/sellerHistory')
const { calculateMarketPrice } = require('../utils/statistics')
const buildElasticityCurve = require('../utils/elasticity')
const { ROUND_TO_NEAREST_HUNDRED, FORMAT_TO_PRICE } = require('../utils/constants')

async function getPriceRecommendationInfo(userAndListingInfo) {

  userAndListingInfo.year = parseInt(userAndListingInfo.year);
  userAndListingInfo.mileage = parseInt(userAndListingInfo.mileage);

  const similarListingsResponse = await fetchSimilarListings(userAndListingInfo);
  const listings = similarListingsResponse.listings;
  const depth = similarListingsResponse.depth;

  if (similarListingsResponse.status !== 200) {
    return { estimatedPrice: 0, message: 'Could not find similar listings' }
  }

  const sellerDelta = await computeSellerDelta(userAndListingInfo.sellerId);

  const { marketPrice, enrichedListings } = calculateMarketPrice(listings, userAndListingInfo)

  // round to nearest 100
  const recommendedPrice = ROUND_TO_NEAREST_HUNDRED(marketPrice * (1 + (sellerDelta / depth)));

  const confidenceLevel = getConfidenceLevel(depth);

  const elasticity = buildElasticityCurve(enrichedListings, recommendedPrice);

  return { marketPrice: FORMAT_TO_PRICE(marketPrice), recommendedPrice: FORMAT_TO_PRICE(recommendedPrice), confidenceLevel, elasticity }
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