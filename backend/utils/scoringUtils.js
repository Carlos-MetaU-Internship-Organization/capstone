
function calculateRecommendationScore(normalizedSignals) {
  const weights = {
    globalMessageCount: 0.08,
    hasUserMessagedSeller: 0.10,
    globalViewCount: 0.10,
    globalViewCountPerDay: 0.04,
    globalFavorites: 0.08,
    globalFavoritesPerDay: 0.04,
    hasUserFavoritedListing: 0.10,
    userDwellTime: 0.10,
    userDwellTimePerDay: 0.07,
    userClickCount: 0.08,
    userClickCountPerDay: 0.06,
    proximity: 0.10,
    daysOnMarket: 0.05
  }

  let score = 0;
  for (const key in weights) {
    score += normalizedSignals[key] * weights[key];
  }

  return score;
}

module.exports = calculateRecommendationScore;