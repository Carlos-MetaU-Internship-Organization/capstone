const { EARTH_RADIUS_MILES, RADIANS_PER_DEGREE } = require('./constants')

// Haversine formula - EXTERNAL CODE
function haversineDistanceMiles(latA, lonA, latB, lonB) {

  const deltaLatitudeRadians = degreesToRadians(latB - latA);
  const deletaLongitudeRadians = degreesToRadians(lonB - lonA);

  const latARadians = degreesToRadians(latA);
  const latBRadians = degreesToRadians(latB);

  const halfChordSq = Math.sin(deltaLatitudeRadians / 2) ** 2 +
                      Math.cos(latARadians) * 
                      Math.cos(latBRadians) *
                      Math.sin(deletaLongitudeRadians / 2) ** 2;

  const centralAngle = 2 * Math.atan2(Math.sqrt(halfChordSq), Math.sqrt(1 - halfChordSq));

  const distanceInMiles = EARTH_RADIUS_MILES * centralAngle;

  return distanceInMiles
}

function degreesToRadians(degrees) {
  return degrees * RADIANS_PER_DEGREE;
}

module.exports = haversineDistanceMiles;