const { fetchSimilarListings } = require('./fetchRelevantListingsService')
const { logInfo } = require('../../frontend/src/utils/logging.service')

async function getEstimatedPrice(info) {

  const usefulListingFeatures = {
    condition: info.condition,
    make: info.make,
    model: info.model,
    year: info.year,
    mileage: info.mileage,
    latitude: info.latitude,
    longitude: info.longitude
  }
  const similarListingsResponse = await fetchSimilarListings(usefulListingFeatures);

  if (similarListingsResponse.status !== 200) {
    return { estimatedPrice: 0, message: 'Could not find similar listings' }
  }

  // calculate price here

  // PLACEHOLDER
  return { estimatedPrice: 1000 }
}

module.exports = getEstimatedPrice;