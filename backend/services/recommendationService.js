const { getCachedRecommendations, setCachedRecommendations } = require('../utils/cachingUtils')
const { fetchRecentlyClickedListings, fetchListingsFromSearchHistory } = require('./fetchRelevantListingsService')
const listingDataService = require('./listingDataService')
const normalizeValue = require('../utils/normalizationUtils')
const calculateRecommendationScore = require('../utils/scoringUtils')
const { getProximity } = require('../utils/geo')

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

  const uniqueListingsInfo = await Promise.all(uniqueListings.map(async (listing) => {
    const daysOnMarket = Math.round((new Date() - listing.createdAt) / 1000 / 60 / 60 / 24);

    const [
      globalMessageCount,
      hasUserMessagedSeller,
      globalViewCount,
      globalFavoriteCount,
      hasUserFavoritedListing,
      userDwellTime,
      userClickCount
    ] = await Promise.all([
      listingDataService.getGlobalMessagesCount(listing.id, listing.ownerId),
      listingDataService.hasUserMessagedSeller(listing.id, userId),
      listingDataService.getGlobalViewCount(listing.id),
      listingDataService.getGlobalFavoriteCount(listing),
      listingDataService.hasUserFavoritedListing(listing.id, userId),
      listingDataService.getUserDwellTime(listing.id, userId),
      listingDataService.getUserClickCount(listing.id, userId)
    ])

    const info = {
      listingId: listing.id,
      ownerId: listing.ownerId,
      globalMessageCount: globalMessageCount.messageCount,
      hasUserMessagedSeller: hasUserMessagedSeller.hasMessaged,
      globalViewCount: globalViewCount.viewCount,
      globalViewCountPerDay: calculateValuePerDay(globalViewCount.viewCount, daysOnMarket),
      globalFavoriteCount: globalFavoriteCount,
      globalFavoriteCountPerDay: calculateValuePerDay(globalFavoriteCount, daysOnMarket),
      hasUserFavoritedListing: hasUserFavoritedListing.hasFavorited,
      userDwellTime: userDwellTime.dwellTime,
      userDwellTimePerDay: calculateValuePerDay(userDwellTime.dwellTime, daysOnMarket),
      userClickCount: userClickCount.clickCount,
      userClickCountPerDay: calculateValuePerDay(userClickCount.clickCount, daysOnMarket),
      proximity: getProximity(listing.latitude, listing.longitude, userLatitude, userLongitude),
      daysOnMarket: daysOnMarket
    }

    return info;
  }));

  const maxValues = uniqueListingsInfo.reduce((acc, info) => {
    acc.globalMessageCount = Math.max(acc.globalMessageCount ?? 0, info.globalMessageCount),
    acc.globalViewCount = Math.max(acc.globalViewCount ?? 0, info.globalViewCount),
    acc.globalViewCountPerDay = Math.max(acc.globalViewCountPerDay ?? 0, info.globalViewCountPerDay),
    acc.globalFavoriteCount = Math.max(acc.globalFavoriteCount ?? 0, info.globalFavoriteCount),
    acc.globalFavoriteCountPerDay = Math.max(acc.globalFavoriteCountPerDay ?? 0, info.globalFavoriteCountPerDay),
    acc.userDwellTime = Math.max(acc.userDwellTime ?? 0, info.userDwellTime),
    acc.userDwellTimePerDay = Math.max(acc.userDwellTimePerDay ?? 0, info.userDwellTimePerDay),
    acc.userClickCount = Math.max(acc.userClickCount ?? 0, info.userClickCount),
    acc.userClickCountPerDay = Math.max(acc.userClickCountPerDay ?? 0, info.userClickCountPerDay),
    acc.proximity = Math.max(acc.proximity ?? 0, info.proximity),
    acc.daysOnMarket = Math.max(acc.daysOnMarket ?? 0, info.daysOnMarket)
    return acc;
  }, {});


  const normalizedListingsInfo = uniqueListingsInfo.map(info => {
    return {
      listingId: info.listingId,
      ownerId: info.ownerId,
      globalMessageCount: normalizeValue(info.globalMessageCount, maxValues.globalMessageCount),
      hasUserMessagedSeller: Number(info.hasUserMessagedSeller),
      globalViewCount: normalizeValue(info.globalViewCount, maxValues.globalViewCount),
      globalViewCountPerDay: normalizeValue(info.globalViewCountPerDay, maxValues.globalViewCountPerDay),
      globalFavoriteCount: normalizeValue(info.globalFavoriteCount, maxValues.globalFavoriteCount),
      globalFavoriteCountPerDay: normalizeValue(info.globalFavoriteCountPerDay, maxValues.globalFavoriteCountPerDay),
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
  }).sort((a, b) => b.score - a.score);

  const listingsById = uniqueListings.reduce((map, listing) => {
    map.set(listing.id, listing)
    return map;
  }, new Map())

  const finalListings = scoredListingsInfo.map(({ listingId }) => listingsById.get(listingId)).slice(0, 20);

  setCachedRecommendations(userId, finalListings);
  
  return finalListings;
}

function calculateValuePerDay(value, daysOnMarket) {
  return (daysOnMarket ? value / daysOnMarket : value)
}

module.exports = getRecommendations;