const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function getGlobalMessagesCount(listingId) {
  
}

function getGlobalTotalClicksPerDay(listingId) {
  
}

function getGlobalFavoritesPerDay(listingId) {
  
}

function hasUserMessagedSeller(userId, listingId) {
  
}

function hasUserFavoritedListing(userId, listingId) {
  
}

function getUserTimeSpentOnListingPerDay(userId, listingId) {
  
}

function getUserEngagementClicksPerDay(userId, listingId) {

}

function getProximityToUser(userId, listingId) {
  // get user zip
  // get listing zip

  // use some library or API
}

module.exports = {
  getGlobalMessagesCount,
  getGlobalTotalClicksPerDay,
  getGlobalFavoritesPerDay,
  hasUserMessagedSeller,
  hasUserFavoritedListing,
  getUserTimeSpentOnListingPerDay,
  getUserEngagementClicksPerDay,
  getProximityToUser
};