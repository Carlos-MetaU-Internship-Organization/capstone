
function calculateRecommendationScore(normalizedSignals) {
  const weightsForUserCreatedListings = {
    globalMessageCount: 0.08,
    hasUserMessagedSeller: 0.10,
    globalTotalClicks: 0.10,
    globalTotalClicksPerDay: 0.04,
    globalFavorites: 0.08,
    globalFavoritesPerDay: 0.04,
    hasUserFavoritedListing: 0.10,
    userTimeSpentOnListing: 0.10,
    userTimeSpentOnListingPerDay: 0.07,
    userEngagementClicks: 0.08,
    userEngagementClicksPerDay: 0.06,
    proximityToUser: 0.10,
    daysOnMarket: 0.05
  }  

  const weightsForNonUserCreatedListings = {};
  for (const key in weightsForUserCreatedListings) {
    weightsForNonUserCreatedListings[key] = weightsForUserCreatedListings[key] / .82; // 18% is lost because users cannot send messages on non-user-created listings
  }

  const weights = normalizedSignals.ownerId ? weightsForUserCreatedListings : weightsForNonUserCreatedListings;

  let score = 0;
  for (const key in weights) {
    score += normalizedSignals[key] * weights[key];
  }

  return score;
}

module.exports = calculateRecommendationScore;