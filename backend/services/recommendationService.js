const { getCachedRecommendations, setCachedRecommendations } = require('../utils/cachingUtils')
const { fetchRecentlyClickedListings, fetchListingsFromSearchHistory } = require('./fetchRelevantListingsService')
const listingDataService = require('./listingDataService')
const normalizeValue = require('../utils/normalizationUtils')
const calculateRecommendationScore = require('../utils/scoringUtils')

async function getRecommendations(userId, userLatitude, userLongitude) {

  const cached = await getCachedRecommendations(userId);
  if (Array.isArray(cached) && cached.length > 0) return cached;
  
  const allListings = []
  const recentlyClickedListings = await fetchRecentlyClickedListings(userId, 50);
  if (recentlyClickedListings.status === 200) {
    allListings.push(...recentlyClickedListings.listings)
  }

  const recentlySearchedListings = await fetchListingsFromSearchHistory(userId);
  if (Array.isArray(recentlySearchedListings)) {
    allListings.push(...recentlySearchedListings)
  }

  const uniqueListings = Array.from(new Map(allListings.map(listing => [listing.vin, listing])).values());

  const uniqueListingsInfo = [];

  for (const listing of uniqueListings) {
    const daysOnMarket = Math.round((new Date() - listing.createdAt) / 1000 / 60 / 60 / 24);

    const uniqueListingInfo = { listingId: listing.id, ownerId: listing.ownerId };

    uniqueListingInfo.globalMessageCount = listing.ownerId ? (await listingDataService.getGlobalMessagesCount(listing.id, listing.ownerId)).count : 0;
    uniqueListingInfo.hasUserMessagedSeller = listing.ownerId ? (await listingDataService.hasUserMessagedSeller(listing.id, listing.ownerId, userId)).hasMessaged : 0;

    uniqueListingInfo.globalTotalClicks = listingDataService.getGlobalTotalClicks(listing);
    uniqueListingInfo.globalTotalClicksPerDay = calculateValuePerDay(uniqueListingInfo.globalTotalClicks, daysOnMarket);

    uniqueListingInfo.globalFavorites = listingDataService.getGlobalFavorites(listing);
    uniqueListingInfo.globalFavoritesPerDay = calculateValuePerDay(uniqueListingInfo.globalFavorites, daysOnMarket)

    uniqueListingInfo.hasUserFavoritedListing = (await listingDataService.hasUserFavoritedListing(listing.id, userId)).hasFavorited;

    uniqueListingInfo.userTimeSpentOnListing = (await listingDataService.getUserTimeSpentOnListing(listing.id, userId)).timeSpent;
    uniqueListingInfo.userTimeSpentOnListingPerDay = calculateValuePerDay(uniqueListingInfo.userTimeSpentOnListing, daysOnMarket);

    uniqueListingInfo.userEngagementClicks = (await listingDataService.getUserEngagementClicks(listing.id, userId)).engagementClicks;
    uniqueListingInfo.userEngagementClicksPerDay = calculateValuePerDay(uniqueListingInfo.userEngagementClicks, daysOnMarket);

    uniqueListingInfo.proximityToUser = listingDataService.getProximityToUser(listing.latitude, listing.longitude, userLatitude, userLongitude);

    uniqueListingInfo.daysOnMarket = daysOnMarket

    uniqueListingsInfo.push(uniqueListingInfo);
  }

  const maxValues = {
    globalMessageCount: Math.max(...uniqueListingsInfo.map(info => info.globalMessageCount)),
    globalTotalClicks: Math.max(...uniqueListingsInfo.map(info => info.globalTotalClicks)),
    globalTotalClicksPerDay: Math.max(...uniqueListingsInfo.map(info => info.globalTotalClicksPerDay)),
    globalFavorites: Math.max(...uniqueListingsInfo.map(info => info.globalFavorites)),
    globalFavoritesPerDay: Math.max(...uniqueListingsInfo.map(info => info.globalFavoritesPerDay)),
    userTimeSpentOnListing: Math.max(...uniqueListingsInfo.map(info => info.userTimeSpentOnListing)),
    userTimeSpentOnListingPerDay: Math.max(...uniqueListingsInfo.map(info => info.userTimeSpentOnListingPerDay)),
    userEngagementClicks: Math.max(...uniqueListingsInfo.map(info => info.userEngagementClicks)),
    userEngagementClicksPerDay: Math.max(...uniqueListingsInfo.map(info => info.userEngagementClicksPerDay)),
    proximityToUser: Math.max(...uniqueListingsInfo.map(info => info.proximityToUser)),
    daysOnMarket: Math.max(...uniqueListingsInfo.map(info => info.daysOnMarket))
  }

  const normalizedListingsInfo = uniqueListingsInfo.map(info => {
    return {
      listingId: info.listingId,
      ownerId: info.ownerId,
      globalMessageCount: normalizeValue(info.globalMessageCount, maxValues.globalMessageCount),
      hasUserMessagedSeller: info.hasUserMessagedSeller === true ? 1 : 0,
      globalTotalClicks: normalizeValue(info.globalTotalClicks, maxValues.globalTotalClicks),
      globalTotalClicksPerDay: normalizeValue(info.globalTotalClicksPerDay, maxValues.globalTotalClicksPerDay),
      globalFavorites: normalizeValue(info.globalFavorites, maxValues.globalFavorites),
      globalFavoritesPerDay: normalizeValue(info.globalFavoritesPerDay, maxValues.globalFavoritesPerDay),
      hasUserFavoritedListing: info.hasUserFavoritedListing === true ? 1 : 0,
      userTimeSpentOnListing: normalizeValue(info.userTimeSpentOnListing, maxValues.userTimeSpentOnListing),
      userTimeSpentOnListingPerDay: normalizeValue(info.userTimeSpentOnListingPerDay, maxValues.userTimeSpentOnListingPerDay),
      userEngagementClicks: normalizeValue(info.userEngagementClicks, maxValues.userEngagementClicks),
      userEngagementClicksPerDay: normalizeValue(info.userEngagementClicksPerDay, maxValues.userEngagementClicksPerDay),
      proximityToUser: normalizeValue(info.proximityToUser, maxValues.proximityToUser, 'inverse'),
      daysOnMarket: normalizeValue(info.daysOnMarket, maxValues.daysOnMarket, 'inverse'),
    }
  })
  
  const scoredListingsInfo = normalizedListingsInfo.map(listingInfo => {
    const score = calculateRecommendationScore(listingInfo);
    return { listingId: listingInfo.listingId, score }
  })

  scoredListingsInfo.sort((a, b) => b.score - a.score);

  const listingsById = new Map();
  uniqueListings.forEach(listing => listingsById.set(listing.id, listing));

  const finalListings = scoredListingsInfo.map(({ listingId }) => listingsById.get(listingId)).slice(0, 20);

  await setCachedRecommendations(userId, finalListings);
  
  return finalListings;
}

function calculateValuePerDay(value, daysOnMarket) {
  return (daysOnMarket ? value / daysOnMarket : value)
}

module.exports = getRecommendations;