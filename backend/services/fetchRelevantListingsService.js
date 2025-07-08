const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function fetchRecentlyClickedListings(userId) {

}

function fetchListingsFromSearchHistory(userId) {
  // get 5 recent search preferences using prisma

  // use auto dev api to search
  
  // truncate obj to return whats needed
}

module.exports = {
  fetchRecentlyClickedListings,
  fetchListingsFromSearchHistory
};