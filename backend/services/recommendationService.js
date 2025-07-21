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

  const maxValues = {
    globalMessageCount: Math.max(...uniqueListingsInfo.map(info => info.globalMessageCount)),
    globalViewCount: Math.max(...uniqueListingsInfo.map(info => info.globalViewCount)),
    globalViewCountPerDay: Math.max(...uniqueListingsInfo.map(info => info.globalViewCountPerDay)),
    globalFavoriteCount: Math.max(...uniqueListingsInfo.map(info => info.globalFavoriteCount)),
    globalFavoriteCountPerDay: Math.max(...uniqueListingsInfo.map(info => info.globalFavoriteCountPerDay)),
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