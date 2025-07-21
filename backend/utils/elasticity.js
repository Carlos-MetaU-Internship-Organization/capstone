const { MS_PER_DAY, RECENCY_DECAY_DAYS, MINIMUM_DATA_POINTS_REQUIRED, PERCENT_BUCKETS, PERCENTAGE_CONVERTER } = require('./constants')

function buildElasticityCurve(enrichedListings, recommendedPrice) {
  const soldListings = enrichedListings.filter(listing => listing.sold)
  if (soldListings.length < MINIMUM_DATA_POINTS_REQUIRED) return {}

  const { slope, intercept } = getWeightedLinearRegression(soldListings)
  const elasticity = {};

  PERCENT_BUCKETS.forEach(pct => {
    const predictedDaysOnMarket = Math.max(0, predictDaysOnMarket(slope, intercept, recommendedPrice + (recommendedPrice * pct / PERCENTAGE_CONVERTER)));
    elasticity[pct] = predictedDaysOnMarket;
  })

  return elasticity
}

function getWeightedLinearRegression(soldListings) {

  const { weightSum, priceWeightSum, daysOnMarketWeightSum } = soldListings.reduce((acc, listing) => {
    const weight = listing.depthWeight * getRecencyOfSaleWeight(listing.soldAt)
    listing.similarityAndRecencyWeight = weight;
    acc.weightSum += weight;
    acc.priceWeightSum += listing.price * weight;
    acc.daysOnMarketWeightSum += listing.daysOnMarket * weight;
    return acc;
  }, { weightSum: 0, priceWeightSum: 0, daysOnMarketWeightSum: 0 })

  const weightedPriceAvg = priceWeightSum / weightSum;
  const weightedDaysOnMarketAvg = daysOnMarketWeightSum / weightSum;

  const { weightedCovariance, weightedVariance } = soldListings.reduce((acc, listing) => {
    const priceDelta = listing.price - weightedPriceAvg;
    const daysOnMarketDelta = listing.daysOnMarket - weightedDaysOnMarketAvg;
    acc.weightedCovariance += listing.similarityAndRecencyWeight * priceDelta * daysOnMarketDelta;
    acc.weightedVariance += listing.similarityAndRecencyWeight * (priceDelta ** 2);
    return acc;
  }, { weightedCovariance: 0, weightedVariance: 0 })

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