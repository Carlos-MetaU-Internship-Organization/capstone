const { getCachedRecommendations, setCachedRecommendations } = require('../utils/cachingUtils')
const { fetchRecentlyClickedListings, fetchListingsFromSearchHistory } = require('./fetchRelevantListingsService')
const listingDataService = require('./listingDataService')
const normalizeValue = require('../utils/normalizationUtils')
const calculateRecommendationScore = require('../utils/scoringUtils')
const getProximity = require('../utils/geo')

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

    uniqueListingInfo.globalMessageCount = (await listingDataService.getGlobalMessagesCount(listing.id, listing.ownerId)).count;
    uniqueListingInfo.hasUserMessagedSeller = (await listingDataService.hasUserMessagedSeller(listing.id, userId)).hasMessaged;

    uniqueListingInfo.globalViewCount = (await listingDataService.getGlobalViewCount(listing.id)).viewCount;
    uniqueListingInfo.globalViewCountPerDay = calculateValuePerDay(uniqueListingInfo.globalViewCount, daysOnMarket);

    uniqueListingInfo.globalFavorites = listingDataService.getGlobalFavorites(listing);
    uniqueListingInfo.globalFavoritesPerDay = calculateValuePerDay(uniqueListingInfo.globalFavorites, daysOnMarket)

    uniqueListingInfo.hasUserFavoritedListing = (await listingDataService.hasUserFavoritedListing(listing.id, userId)).hasFavorited;

    uniqueListingInfo.userDwellTime = (await listingDataService.getUserDwellTime(listing.id, userId)).dwellTime;
    uniqueListingInfo.userDwellTimePerDay = calculateValuePerDay(uniqueListingInfo.userTimeSpentOnListing, daysOnMarket);

    uniqueListingInfo.userClickCount = (await listingDataService.getUserClickCount(listing.id, userId)).clickCount;
    uniqueListingInfo.userClickCountPerDay = calculateValuePerDay(uniqueListingInfo.clickCount, daysOnMarket);

    uniqueListingInfo.proximity = getProximity(listing.latitude, listing.longitude, userLatitude, userLongitude);

    uniqueListingInfo.daysOnMarket = daysOnMarket

    uniqueListingsInfo.push(uniqueListingInfo);
  }

  const maxValues = {
    globalMessageCount: Math.max(...uniqueListingsInfo.map(info => info.globalMessageCount)),
    globalViewCount: Math.max(...uniqueListingsInfo.map(info => info.globalViewCount)),
    globalViewCountPerDay: Math.max(...uniqueListingsInfo.map(info => info.globalViewCountPerDay)),
    globalFavorites: Math.max(...uniqueListingsInfo.map(info => info.globalFavorites)),
    globalFavoritesPerDay: Math.max(...uniqueListingsInfo.map(info => info.globalFavoritesPerDay)),
    userDwellTime: Math.max(...uniqueListingsInfo.map(info => info.userDwellTime)),
    userDwellTimePerDay: Math.max(...uniqueListingsInfo.map(info => info.userDwellTimePerDay)),
    userClickCount: Math.max(...uniqueListingsInfo.map(info => info.userClickCount)),
    userClickCountPerDay: Math.max(...uniqueListingsInfo.map(info => info.userClickCountPerDay)),
    proximity: Math.max(...uniqueListingsInfo.map(info => info.proximity)),
    daysOnMarket: Math.max(...uniqueListingsInfo.map(info => info.daysOnMarket))
  }

  const normalizedListingsInfo = uniqueListingsInfo.map(info => {
    return {
      listingId: info.listingId,
      ownerId: info.ownerId,
      globalMessageCount: normalizeValue(info.globalMessageCount, maxValues.globalMessageCount),
      hasUserMessagedSeller: info.hasUserMessagedSeller === true ? 1 : 0,
      globalViewCount: normalizeValue(info.globalViewCount, maxValues.globalViewCount),
      globalViewCountPerDay: normalizeValue(info.globalViewCountPerDay, maxValues.globalViewCountPerDay),
      globalFavorites: normalizeValue(info.globalFavorites, maxValues.globalFavorites),
      globalFavoritesPerDay: normalizeValue(info.globalFavoritesPerDay, maxValues.globalFavoritesPerDay),
      hasUserFavoritedListing: info.hasUserFavoritedListing === true ? 1 : 0,
      userDwellTime: normalizeValue(info.userDwellTime, maxValues.userDwellTime),
      userDwellTimePerDay: normalizeValue(info.userDwellTimePerDay, maxValues.userDwellTimePerDay),
      userClickCount: normalizeValue(info.userClickCount, maxValues.userClickCount),
      userClickCountPerDay: normalizeValue(info.userClickCountPerDay, maxValues.userClickCountPerDay),
      proximity: normalizeValue(info.proximity, maxValues.proximity, 'inverse'),
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