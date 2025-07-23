const { fetchSimilarListings } = require('./fetchRelevantListingsService')
const { logInfo } = require('../../frontend/src/services/loggingService')
const computeSellerDelta = require('../utils/sellerHistory')
const { calculateMarketPrice } = require('../utils/statistics')
const buildElasticityCurve = require('../utils/elasticity')
const { ROUND_TO_NEAREST_HUNDRED, FORMAT_TO_PRICE, MINIMUM_COMPS_REQUIRED } = require('../utils/constants')

async function getPriceRecommendationInfo(userAndListingInfo) {

  userAndListingInfo.year = parseInt(userAndListingInfo.year);
  userAndListingInfo.mileage = parseInt(userAndListingInfo.mileage);

  const { listings, status } = await fetchSimilarListings(userAndListingInfo);

  if (status !== 200) {
    return { estimatedPrice: 0, message: 'Could not find similar listings' }
  }

  const { confidenceLevel, confidenceScore } = getConfidence(listings);

  const sellerDelta = await computeSellerDelta(userAndListingInfo.sellerId);

  const { marketPrice, enrichedListings } = calculateMarketPrice(listings, userAndListingInfo)

  // round to nearest 100
  const recommendedPrice = ROUND_TO_NEAREST_HUNDRED(marketPrice * (1 + (sellerDelta * confidenceScore)));

  const elasticity = buildElasticityCurve(enrichedListings, recommendedPrice);

  return { marketPrice: FORMAT_TO_PRICE(marketPrice), recommendedPrice: FORMAT_TO_PRICE(recommendedPrice), confidenceLevel, elasticity }
}

function getConfidence(comps) {
  const quantityWeight = Math.min(1, comps.length / MINIMUM_COMPS_REQUIRED)

  const prices = comps.map(comp => comp.price)
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length

  const variance = prices.reduce((sum, price) => sum + (price - averagePrice) ** 2, 0) / prices.length
  const stdDeviation = Math.sqrt(variance)

  const scatteredWeight = 1 / (1 + (stdDeviation / averagePrice))

  const averageDepthWeight = comps.reduce((sum, comp) => sum + comp.depth, 0) / comps.length

  const depthQualityWeight = 1 / averageDepthWeight

  const confidenceScore = 3 / ((1 / quantityWeight) + (1 / scatteredWeight) + (1 / depthQualityWeight))

  const confidenceLevel = confidenceScore > 0.85 ? "very high"
                          : confidenceScore > 0.65 ? "high"
                          : confidenceScore > 0.45 ? "medium"
                          : confidenceScore > 0.25 ? "low"
                          : "very low"
  logInfo(`Confidence Level for the recommended price is ${confidenceLevel.toUpperCase()} with a score of ${confidenceScore}`)
  return { confidenceLevel, confidenceScore };
}

module.exports = getPriceRecommendationInfo;