const { logInfo } = require('../../frontend/src/utils/logging.service');
const {
  MILEAGE_SCALE_FACTOR,
  DEPTH_WEIGHT_BY_LEVEL,
  SOLD_LISTING_WEIGHT,
  UNSOLD_LISTING_WEIGHT,
  PROXIMITY_DISTANCE_FADE,
  DAYS_ON_MARKET_MIN_WEIGHT,
  DAYS_IN_MONTH,
  PROXIMITY_MIN_WEIGHT,
  ROUNDING_DIGIT_PRICE
} = require('./constants')

const haversineDistanceMiles = require('./geo')

function calculateMarketPrice(listings, userInfo) {
  let sum = 0;
  let weightSum = 0;
  let listingCountPerDepth = {};

  listings.forEach(listing => {
    listingCountPerDepth[listing.depth] = (listingCountPerDepth[listing.depth] || 0) + 1;
  })

  listings.forEach(listing => {
    const yearGap = Math.abs(userInfo.year - listing.year)
    const mileageGap = Math.abs((userInfo.mileage - listing.mileage) / MILEAGE_SCALE_FACTOR)

    const depthWeight = (DEPTH_WEIGHT_BY_LEVEL[listing.depth] / listingCountPerDepth[listing.depth]);

    const soldWeight = listing.sold ? SOLD_LISTING_WEIGHT : UNSOLD_LISTING_WEIGHT
    
    const proximityInMiles = haversineDistanceMiles(userInfo.latitude, userInfo.longitude, listing.latitude, listing.longitude);
    const proximityWeight = Math.max(PROXIMITY_MIN_WEIGHT, 1 - (proximityInMiles / PROXIMITY_DISTANCE_FADE));

    const daysOnMarketWeight = Math.max(DAYS_ON_MARKET_MIN_WEIGHT, 1 / ((1 + listing.daysOnMarket) / DAYS_IN_MONTH));
    
    const similarSpecificationWeight = 1 / (1 + yearGap + mileageGap);

    const totalWeight = similarSpecificationWeight * depthWeight * soldWeight * proximityWeight * daysOnMarketWeight;

    sum += parseInt(listing.price) * totalWeight;
    weightSum += totalWeight;
  })

  const marketPrice = weightSum ? parseFloat((sum / weightSum).toFixed(ROUNDING_DIGIT_PRICE)) : 0;
  logInfo(`Market price calculated for this lsiting is ${marketPrice}`)
  return marketPrice;
}

module.exports = { calculateMarketPrice }