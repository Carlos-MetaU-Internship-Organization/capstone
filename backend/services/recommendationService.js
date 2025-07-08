
function getRecommendations(userId) {
  // check cache

  // if not cached, fetchListingsFromSearchHistory() & fetchRecentlyClickedListings

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