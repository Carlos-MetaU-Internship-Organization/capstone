const { fetchSimilarListings } = require('./fetchRelevantListingsService')
const { logInfo } = require('../../frontend/src/services/loggingService')
const computeSellerDelta = require('../utils/sellerHistory')
const { calculateMarketPrice, harmonicMean } = require('../utils/statistics')
const buildElasticityCurve = require('../utils/elasticity')
const { ROUND_TO_NEAREST_HUNDRED, FORMAT_TO_PRICE, MINIMUM_COMPS_REQUIRED, DEPTH_CONFIDENCE_PENALTIES } = require('../utils/constants')

async function getPriceRecommendationInfo(userAndListingInfo) {

  userAndListingInfo.year = parseInt(userAndListingInfo.year);
  userAndListingInfo.mileage = parseInt(userAndListingInfo.mileage);

  const similarListings = await fetchSimilarListings(userAndListingInfo);

  if (similarListings.length === 0) {
    return { estimatedPrice: 0, message: 'Could not find similar listings' }
  }

  const { confidenceLevel, confidenceScore } = getConfidence(similarListings);

  const sellerDelta = await computeSellerDelta(userAndListingInfo.sellerId);

  const { marketPrice, enrichedListings } = calculateMarketPrice(similarListings, userAndListingInfo)

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

  const priceSpread = stdDeviation / averagePrice;
  const scatteredWeight = 1 / (10 ** priceSpread)

  const depthQualityWeight = harmonicMean(comps.map(comp => DEPTH_CONFIDENCE_PENALTIES[comp.depth])) ** 2

  const confidenceScore = harmonicMean([quantityWeight, scatteredWeight, depthQualityWeight])

  const confidenceLevel = confidenceScore > 0.85 ? "very high"
                          : confidenceScore > 0.65 ? "high"
                          : confidenceScore > 0.45 ? "medium"
                          : confidenceScore > 0.25 ? "low"
                          : "very low"
  logInfo(`Confidence Level for the recommended price is ${confidenceLevel.toUpperCase()} with a score of ${confidenceScore}`)
  return { confidenceLevel, confidenceScore };
}

module.exports = getPriceRecommendationInfo;