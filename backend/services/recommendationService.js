const { fetchRecentlyClickedListings, fetchListingsFromSearchHistory } = require('./fetchRelevantListingsService')
const listingDataService = require('./listingDataService')
const { logInfo } = require('../../frontend/src/utils/logging.service')

async function getRecommendations(userId, userLatitude, userLongitude) {
  // check cache

  // if not cached, fetchListingsFromSearchHistory() & fetchRecentlyClickedListings
  
  const allListings = []
  const recentlyClickedListings = await fetchRecentlyClickedListings(userId, 50);
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

  const uniqueListingsInfo = [];

  for (const listing of uniqueListings) {
    const uniqueListingInfo = {};
    uniqueListingInfo.globalMessageCount = (await listingDataService.getGlobalMessagesCount(listing.id, listing.ownerId)).count;
    uniqueListingInfo.globalTotalClicksPerDay = listingDataService.getGlobalTotalClicksPerDay(listing);
    uniqueListingInfo.globalFavoritesPerDay = listingDataService.getGlobalFavoritesPerDay(listing);
    uniqueListingInfo.hasUserMessagedSeller = (await listingDataService.hasUserMessagedSeller(listing.id, listing.ownerId, userId));
    uniqueListingInfo.hasUserFavoritedListing = (await listingDataService.hasUserFavoritedListing(listing.id, userId)).hasFavorited;
    uniqueListingInfo.userTimeSpentOnListing = (await listingDataService.getUserTimeSpentOnListingPerDay(listing.id, userId, listing.createdAt)).timeSpentPerDay;
    uniqueListingInfo.userEngagementClicksPerDay = (await listingDataService.getUserEngagementClicksPerDay(listing.id, userId, listing.createdAt)).engagementClicksPerDay;
    uniqueListingInfo.proximityToUser = listingDataService.getProximityToUser(listing.latitude, listing.longitude, userLatitude, userLongitude);
    uniqueListingsInfo.push(uniqueListingInfo);
  }

  // normalize if needed 

  // iterate through listings,
    // calculateRecommendationScore()
    // add to array of tuple (listing, score)

  // sort listings based on score

  // cache results

  // return results

}

module.exports = getRecommendations;