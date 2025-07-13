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

module.exports = {
  getGlobalMessagesCount,
  getGlobalTotalClicksPerDay,
  getGlobalFavoritesPerDay,
  hasUserMessagedSeller,
  hasUserFavoritedListing,
  getUserTimeSpentOnListingPerDay,
  getUserEngagementClicksPerDay
};