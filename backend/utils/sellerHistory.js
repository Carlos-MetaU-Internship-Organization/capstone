const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { logInfo } = require('../../frontend/src/utils/logging.service');
const getDaysOnMarket = require('./time')
const { MIN_LISTINGS_TO_FACTOR_IN_SELLER_LISTINGS, SMOOTHING_K, SELLER_FACTOR_MIN, SELLER_FACTOR_MAX, ROUNDING_DIGIT } = require('./constants')

async function computeSellerMultiplier(sellerId) {
  const soldSellerListings = await prisma.listing.findMany({
    where: {
      ownerId: sellerId,
      sold: true
    },
    select: {
      condition: true,
      make: true,
      model: true,
      createdAt: true,
      soldAt: true
    }
  });

  if ((Array.isArray(soldSellerListings) && soldSellerListings.length < MIN_LISTINGS_TO_FACTOR_IN_SELLER_LISTINGS) || !(Array.isArray(soldSellerListings))) {
    logInfo('Not enough seller history')
    return 1.0;
  }

  const soldSellerListingStats = new Map();
  soldSellerListings.forEach(listing => {
    const key = `${listing.condition}|${listing.make}|${listing.model}`
    const daysOnMarket = getDaysOnMarket(listing);
    if (!soldSellerListingStats.has(key)) {
      soldSellerListingStats.set(key, { count: 0, daysOnMarketSum: 0, condition: listing.condition, make: listing.make, model: listing.model })
    }
    const entry = soldSellerListingStats.get(key);
    entry.count += 1;
    entry.daysOnMarketSum += daysOnMarket;
  })

  // For each unique condition/make/model listing, fetch market stats
  let weightedRatioSum = 0;
  let totalWeights = 0;
  
  for (const [key, { count, daysOnMarketSum, condition, make, model }] of soldSellerListingStats) {
    const soldMarketListings = await prisma.listing.findMany({
      where: {
        ownerId: {
          not: sellerId
        },
        condition,
        make,
        model,
        sold: true
      },
      select: {
        createdAt: true,
        soldAt: true
      }
    })

    if ((Array.isArray(soldMarketListings) && soldMarketListings.length === 0) || !(Array.isArray(soldSellerListings))) {
      continue;
    }

    const marketAvgDaysOnMarket = soldMarketListings.reduce((daysOnMarket, listing) => daysOnMarket + getDaysOnMarket(listing), 0) / soldMarketListings.length;

    const sellerAvgDaysOnMarket = daysOnMarketSum / count;

    // combat outliers
    const balancedSellerAvgDaysOnMarket = (sellerAvgDaysOnMarket * count + marketAvgDaysOnMarket * SMOOTHING_K) / (count + SMOOTHING_K)

    const timeSoldRatio = marketAvgDaysOnMarket / balancedSellerAvgDaysOnMarket;

    weightedRatioSum += timeSoldRatio * count;
    totalWeights += count;
  }

  if (totalWeights === 0) {
    return 1.0;
  }

  const finalWeightedRatio = weightedRatioSum / totalWeights;
  const sellerMultiplier = Math.min(SELLER_FACTOR_MAX, Math.max(SELLER_FACTOR_MIN, finalWeightedRatio));

  const messageFragment = sellerMultiplier < 1 ? `${(1 - sellerMultiplier).toFixed(ROUNDING_DIGIT) * 100 }% lower` :
                                                 `${(sellerMultiplier - 1).toFixed(ROUNDING_DIGIT) * 100 }% higher`

  logInfo(`Based on past seller history, listings should be marked ${messageFragment}`)
  return sellerMultiplier
}

module.exports = computeSellerMultiplier