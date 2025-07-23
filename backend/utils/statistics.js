const { logInfo } = require('../../frontend/src/services/loggingService');
const {
  MILEAGE_SCALE_FACTOR,
  DEPTH_WEIGHT_BY_LEVEL,
  SOLD_LISTING_WEIGHT,
  UNSOLD_LISTING_WEIGHT,
  PROXIMITY_DISTANCE_FADE,
  DAYS_ON_MARKET_MIN_WEIGHT,
  DAYS_IN_MONTH,
  PROXIMITY_MIN_WEIGHT,
  ROUND_TO_NEAREST_HUNDRED
} = require('./constants')

function calculateMarketPrice(listings, userInfo) {

  const { listingCountPerDepth, listingsSoldStatus } = listings.reduce((obj, listing) => {
    obj.listingCountPerDepth[listing.depth] = (obj.listingCountPerDepth[listing.depth] ?? 0) + 1;
    obj.listingsSoldStatus[listing.sold ? 'numSold' : 'numUnsold']++;
    return obj
  },
  {
    listingCountPerDepth: {},
    listingsSoldStatus: { numSold: 0, numUnsold: 0 }
  }
  )

  const { sum, weightSum } = listings.reduce((acc, listing) => {
    const yearGap = Math.abs(userInfo.year - listing.year)
    const mileageGap = Math.abs((userInfo.mileage - listing.mileage) / MILEAGE_SCALE_FACTOR)
  
    const depthWeight = (DEPTH_WEIGHT_BY_LEVEL[listing.depth] / listingCountPerDepth[listing.depth]);
    listing.depthWeight = depthWeight;
  
    const soldWeight = listing.sold ? SOLD_LISTING_WEIGHT / listingsSoldStatus.numSold : UNSOLD_LISTING_WEIGHT / listingsSoldStatus.numUnsold;
    
    const proximityWeight = Math.max(PROXIMITY_MIN_WEIGHT, 1 - (listing.proximity / PROXIMITY_DISTANCE_FADE));
  
    const daysOnMarketWeight = Math.max(DAYS_ON_MARKET_MIN_WEIGHT, 1 / ((1 + listing.daysOnMarket) / DAYS_IN_MONTH));

    const similarSpecificationWeight = 1 / (1 + yearGap + mileageGap);
  
    const totalWeight = similarSpecificationWeight * depthWeight * soldWeight * proximityWeight * daysOnMarketWeight;

    acc.sum += parseInt(listing.price) * totalWeight;
    acc.weightSum += totalWeight;

    return acc;
  }, { sum: 0, weightSum: 0 })

  const marketPrice = weightSum ? ROUND_TO_NEAREST_HUNDRED(sum / weightSum) : 0;
  logInfo(`Market price calculated for this lsiting is ${marketPrice}`)
  return { marketPrice, enrichedListings: listings };
}

function harmonicMean(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return 0;
  }

  const sumOfReciprocals = { sum: 0 }

  for (const num of arr) {
    sumOfReciprocals.sum += 1 / num;
  }

  return arr.length / sumOfReciprocals.sum;
}

module.exports = { calculateMarketPrice, harmonicMean }