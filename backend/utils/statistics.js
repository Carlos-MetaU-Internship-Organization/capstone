const { logInfo } = require('../../frontend/src/utils/logging.service');
const {
  MILEAGE_SCALE_FACTOR,
  DEPTH_WEIGHT_BY_LEVEL,
  SOLD_LISTING_WEIGHT,
  UNSOLD_LISTING_WEIGHT,
  PROXIMITY_DISTANCE_FADE,
  DAYS_ON_MARKET_MIN_WEIGHT,
  DAYS_IN_MONTH
} = require('./constants')

const haversineDistanceMiles = require('./geo')

function calculateMarketPrice(listings, userInfo) {
  let sum = 0;
  let weightSum = 0;

  listings.forEach(listing => {
    const yearGap = Math.abs(parseInt(userInfo.year) - parseInt(listing.year))
    const mileageGap = Math.abs((parseInt(userInfo.mileage) - parseInt(listing.mileage)) / MILEAGE_SCALE_FACTOR)

    const depthWeight = DEPTH_WEIGHT_BY_LEVEL[listing.depth];

    const soldWeight = listing.sold ? SOLD_LISTING_WEIGHT : UNSOLD_LISTING_WEIGHT
    
    const proximityInMiles = haversineDistanceMiles(userInfo.latitude, userInfo.longitude, listing.latitude, listing.longitude);
    const proximityWeight = Math.max(0, 1 - (proximityInMiles / PROXIMITY_DISTANCE_FADE));

    const daysOnMarketWeight = Math.max(DAYS_ON_MARKET_MIN_WEIGHT, 1 / ((1 + listing.daysOnMarket) / DAYS_IN_MONTH));
    
    const similarSpecificationWeight = 1 / (1 + yearGap + mileageGap);

    const totalWeight = similarSpecificationWeight * depthWeight * soldWeight * proximityWeight * daysOnMarketWeight;

    sum += parseInt(listing.price) * totalWeight;
    weightSum += totalWeight;
  })

  const marketPrice = weightSum ? (sum / weightSum).toFixed(2) : 0;
  logInfo(`Market price calculated for this lsiting is ${marketPrice}`)
  return marketPrice;
}

module.exports = { calculateMarketPrice }