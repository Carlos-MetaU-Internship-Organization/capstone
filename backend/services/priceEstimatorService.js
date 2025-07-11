const { fetchSimilarListings } = require('./fetchRelevantListingsService')
const { logInfo } = require('../../frontend/src/utils/logging.service')

async function getEstimatedPrice(info) {

  const listingFeaturesToLookFor = {
    condition: info.condition,
    make: info.make,
    model: info.model,
    year: info.year,
    mileage: info.mileage
  }
  const similarListingsResponse = await fetchSimilarListings(listingFeaturesToLookFor);

  if (similarListingsResponse.status !== 200) {
    return { estimatedPrice: 0, message: 'Could not find similar listings' }
  }

  // calculate price here

  // PLACEHOLDER
  return { estimatedPrice: 1000 }
}

module.exports = getEstimatedPrice;