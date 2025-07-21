const { EARTH_RADIUS_MILES, RADIANS_PER_DEGREE } = require('./constants')

// Haversine formula - EXTERNAL CODE
function getProximity(latA, lonA, latB, lonB) {

  const deltaLatitudeRadians = degreesToRadians(latB - latA);
  const deletaLongitudeRadians = degreesToRadians(lonB - lonA);

  const latARadians = degreesToRadians(latA);
  const latBRadians = degreesToRadians(latB);

  // calculates the square of half the chord length between the two points
  const halfChordSq = Math.sin(deltaLatitudeRadians / 2) ** 2 +
                      Math.cos(latARadians) * 
                      Math.cos(latBRadians) *
                      Math.sin(deletaLongitudeRadians / 2) ** 2;

  // calculates the angular distance in radians between the two points
  const centralAngle = 2 * Math.atan2(Math.sqrt(halfChordSq), Math.sqrt(1 - halfChordSq));

  const distanceInMiles = EARTH_RADIUS_MILES * centralAngle;

  return distanceInMiles
}

function calculateBounds(latitude, longitude, radius) {
  const milesPerDegreeLatitude = 69;

  const changeInLatitude = radius / milesPerDegreeLatitude;

  const milesPerDegreeLongitude = milesPerDegreeLatitude * Math.cos(latitude * (Math.PI / 180))
  const changeInLongitude = radius / milesPerDegreeLongitude;

  const minLatitude = latitude - changeInLatitude;
  const maxLatitude = latitude + changeInLatitude;
  const minLongitude = longitude - changeInLongitude;
  const maxLongitude = longitude + changeInLongitude;

  return {
    minLatitude,
    maxLatitude,
    minLongitude,
    maxLongitude
  }
}

function degreesToRadians(degrees) {
  return degrees * RADIANS_PER_DEGREE;
}

module.exports = { getProximity, calculateBounds };