const { fetchRecentlyClickedListings, fetchListingsFromSearchHistory } = require('./fetchRelevantListingsService')
const { logInfo } = require('../../frontend/src/utils/logging.service')

async function getRecommendations(userId) {
  // check cache

  // if not cached, fetchListingsFromSearchHistory() & fetchRecentlyClickedListings
  
  const allListings = []
  const recentlyClickedListings = await fetchRecentlyClickedListings(userId);
  if (recentlyClickedListings.status === 200) {
    for (const listing of recentlyClickedListings.listings) {
      allListings.push(listing.listing)
    }
  }

  const recentlySearchedListings = await fetchListingsFromSearchHistory(userId);
  for (const listing of recentlySearchedListings) {
    allListings.push(listing)
  }

  const uniqueListings = Array.from(new Map(allListings.map(listing => [listing.vin, listing])).values());

  // for each listing, 
    // listingDataService
    // store in some obj
    // track highest counts of things to use for normalization later
    // append to array

  // normalize if needed 

  // iterate through listings,
    // calculateRecommendationScore()
    // add to array of tuple (listing, score)

  // sort listings based on score

  // cache results

  // return results

}

module.exports = getRecommendations;