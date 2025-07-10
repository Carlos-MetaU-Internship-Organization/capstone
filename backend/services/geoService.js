const axios = require('axios')

async function getLatitudeLongitude(zip) {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${zip}&format=json&limit=1`, { headers: { 'User-Agent': 'CarPortal' } });
    const data = response.data;
    latitude = parseFloat(data[0].lat);
    longitude = parseFloat(data[0].lon);
    return { status: 200, latitude, longitude }
  } catch (error) {
    return { status: 500, message: 'Failed to turn ZIP into latitude & longitude' }
  }
}

module.exports = getLatitudeLongitude;