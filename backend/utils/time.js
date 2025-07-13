const { MS_PER_DAY } = require('./constants')

function getDaysOnMarket(listing) {
  const start = new Date(listing.createdAt);
  const end = listing.soldAt ? new Date(listing.soldAt) : new Date();
  return Math.max(1, Math.round(end - start) / MS_PER_DAY);
}

module.exports = getDaysOnMarket;