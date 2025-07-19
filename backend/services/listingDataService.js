const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { logInfo, logError } = require('../../frontend/src/utils/logging.service')

async function getGlobalMessagesCount(listingId, ownerId) {
  try {
    if (!ownerId) {
      logInfo(`Listing with listingId: ${listingId} cannot receive messages`)
      return ({ status: 404, count: 0 })
    }

    const messages = await prisma.message.findMany({
      where: {
        listingId,
        NOT: {
          senderId: ownerId
        }
      }
    });

    if (!messages) {
      logInfo(`No messages were found for listing with listingId: ${listingId}`)
      return ({ status: 404, count: 0 })
    }
    
    logInfo(`Successfully counted ${messages.length} messages for listing with listingId: ${listingId}`);
    return ({ status: 200, count: messages.length })
  } catch (error) {
    logError(`Something bad happened trying to retrieve the global message count on listing with listingId: ${listingId}`, error);
    return ({ status: 500, count: 0 })
  }
}

async function getGlobalViewCount(listingId) {
  try {
    const listingVisits = await prisma.listingVisit.findMany({
      where: { listingId }
    })

    if (!listingVisits) {
      logInfo(`Listing with listingId: ${listingId} has no previous views`)
      return ({ status: 404, viewCount: 0 })
    }

    logInfo(`Listing with listingId: ${listingId} has ${listingVisits.length} views`)
    return ({ status: 200, viewCount: listingVisits.length })
  } catch (error) {
    logError(`Something bad happened trying to retrieve the number of views of listing with listingId: ${listingId}`, error);
    return ({ status: 500, viewCount: 0 })
  }
}

function getGlobalFavorites(listing) {
  return listing.favorites;
}

async function hasUserMessagedSeller(listingId, ownerId, userId) {
  try {
    if (!ownerId) {
      logInfo(`Listing with listingId: ${listingId} cannot receive messages`)
      return ({ status: 404, hasMessaged: false })
    }

    const hasMessaged = await prisma.message.findFirst({
      where: {
        listingId,
        senderId: userId
      }
    });

    if (!hasMessaged) {
      logInfo(`User with userId: ${userId} has not messaged seller on listing with listingId: ${listingId}`)
      return ({ status: 404, hasMessaged: false })
    }
    
    logInfo(`Successfully found that user with userId: ${userId} has messaged seller on listing with listingId: ${listingId}`);
    return ({ status: 200, hasMessaged: true })
  } catch (error) {
    logError(`Something bad happened trying to find out if user with userId: ${userId} has messaged seller on listing with listingId: ${listingId}`, error);
    return ({ status: 500, hasMessaged: false })
  }
}

async function hasUserFavoritedListing(listingId, userId) {
  try {
    const favoriters = await prisma.listing.findFirst({
      where: {
        id: listingId
      },
      select: {
        favoriters: {
          select: {
            id: true
          }
        }
      }
    });

    if (!(favoriters.favoriters.map(item => item.id).includes(userId))) {
      logInfo(`User with userId: ${userId} has not favorited listing with listingId: ${listingId}`)
      return ({ status: 404, hasFavorited: false })
    }
    
    logInfo(`Successfully found that user with userId: ${userId} has favorited listing with listingId: ${listingId}`);
    return ({ status: 200, hasFavorited: true })
  } catch (error) {
    logError(`Something bad happened trying to find out if user with userId: ${userId} has favorited listing with listingId: ${listingId}`, error);
    return ({ status: 500, hasFavorited: false })
  }
}

async function getUserTimeSpentOnListing(listingId, userId) {
  try {
    const timeSpent = await prisma.listingVisit.findFirst({
      where: {
        listingId,
        userId
      },
      select: {
        dwellTime: true
      }
    });

    if (!timeSpent) {
      logInfo(`User with userId: ${userId} has not visited listing with listingId: ${listingId}`)
      return ({ status: 404, timeSpent: 0 })
    }
    
    logInfo(`Successfully found that user with userId: ${userId} has spent ${timeSpent.timeSpent} seconds per day on listing with listingId: ${listingId}`);
    return ({ status: 200, timeSpent: timeSpent.dwellTime })
  } catch (error) {
    logError(`Something bad happened trying to find out how much time user with userId: ${userId} has spent on listing with listingId: ${listingId}`, error);
    return ({ status: 500, timeSpent: 0 })
  }
}

async function getUserEngagementClicks(listingId, userId) {
  try {
    const engagementClicks = await prisma.listingVisit.findFirst({
      where: {
        listingId,
        userId
      },
      select: {
        clickCount: true
      }
    });

    if (!engagementClicks) {
      logInfo(`User with userId: ${userId} has not visited listing with listingId: ${listingId}`)
      return ({ status: 404, engagementClicks: 0 })
    }
    
    logInfo(`Successfully found that user with userId: ${userId} has clicked ${engagementClicks} times per day on listing with listingId: ${listingId}`);
    return ({ status: 200, engagementClicks: engagementClicks.clickCount })
  } catch (error) {
    logError(`Something bad happened trying to find out how many clicks user with userId: ${userId} has done on listing with listingId: ${listingId}`, error);
    return ({ status: 500, engagementClicks: 0 })
  }
}

// Haversine formula
function getProximityToUser(listingLatitude, listingLongitude, userLatitude, userLongitude) {

  const earthRadiusInMiles = 3959;

  const toRad = (angle) => (angle * Math.PI) / 180;

  const changeInLatitude = toRad(listingLatitude - userLatitude);
  const changeInLongitude = toRad(listingLongitude - userLongitude)

  const alg = Math.sin(changeInLatitude / 2) * Math.sin(changeInLatitude / 2) +
              Math.cos(toRad(userLatitude)) * Math.cos(toRad(listingLatitude)) *
              Math.sin(changeInLongitude / 2) * Math.sin(changeInLongitude / 2);

  const angularDistance = 2 * Math.atan2(Math.sqrt(alg), Math.sqrt(1 - alg));

  const distanceInMiles = earthRadiusInMiles * angularDistance;

  return distanceInMiles
}

module.exports = {
  getGlobalMessagesCount,
  getGlobalViewCount,
  getGlobalFavorites,
  hasUserMessagedSeller,
  hasUserFavoritedListing,
  getUserTimeSpentOnListing,
  getUserEngagementClicks,
  getProximityToUser
};