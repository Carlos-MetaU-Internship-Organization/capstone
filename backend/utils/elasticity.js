const { MS_PER_DAY, RECENCY_DECAY_DAYS, PERCENT_BUCKETS, PERCENTAGE_CONVERTER } = require('./constants')

function buildElasticityCurve(enrichedListings, recommendedPrice) {
  const soldListings = enrichedListings.filter(listing => listing.sold)
  if (soldListings.length === 0) return {}

  const { slope, intercept } = getWeightedLinearRegression(soldListings)
  const elasticity = {};

  PERCENT_BUCKETS.forEach(pct => {
    const predictedDaysOnMarket = Math.max(0, predictDaysOnMarket(slope, intercept, recommendedPrice + (recommendedPrice * pct / PERCENTAGE_CONVERTER)));
    elasticity[pct] = predictedDaysOnMarket;
  })

  return elasticity
}

function getWeightedLinearRegression(soldListings) {
  let weightSum = 0;
  let priceWeightSum = 0;
  let daysOnMarketWeightSum = 0;

  soldListings.forEach(listing => {
    const weight = listing.depthWeight * getRecencyOfSaleWeight(listing.soldAt)
    listing.similarityAndRecencyWeight = weight;
    weightSum += weight;
    priceWeightSum += listing.price * weight;
    daysOnMarketWeightSum += listing.daysOnMarket * weight;
  })

  const weightedPriceAvg = priceWeightSum / weightSum;
  const weightedDaysOnMarketAvg = daysOnMarketWeightSum / weightSum;

  let weightedCovariance = 0;
  let weightedVariance = 0;

  soldListings.forEach(listing => {
    const priceDelta = listing.price - weightedPriceAvg;
    const daysOnMarketDelta = listing.daysOnMarket - weightedDaysOnMarketAvg;
    weightedCovariance += listing.similarityAndRecencyWeight * priceDelta * daysOnMarketDelta;
    weightedVariance += listing.similarityAndRecencyWeight * (priceDelta ** 2)
  })

  const slope = weightedCovariance / weightedVariance;
  const intercept = weightedDaysOnMarketAvg - slope * weightedPriceAvg;
  
  return { slope, intercept }
}

function predictDaysOnMarket(slope, intercept, price) {
  return Math.round(slope * price + intercept);
}


function getRecencyOfSaleWeight(soldAt) {
  const daysAgo = (Date.now() - new Date(soldAt).getTime()) / MS_PER_DAY;
  return 1 / (1 + daysAgo / RECENCY_DECAY_DAYS);
}

module.exports = buildElasticityCurve