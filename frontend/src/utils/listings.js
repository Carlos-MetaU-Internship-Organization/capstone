import zipcodes from 'zipcodes'
import { getProximity } from "./geo";

export function sortListings(listings, field, order, zip) {

  const sortedListings = [...listings];

  sortedListings.sort((a, b) => {
    let valA = null;
    let valB = null;

    if (field === 'distance') {       
      const { latitude: userLatitude, longitude: userLongitude } = zipcodes.lookup(zip); 
      valA = getProximity(userLatitude, userLongitude, a.latitude, a.longitude);
      valB = getProximity(userLatitude, userLongitude, b.latitude, b.longitude);
    } else if (field === 'createdAt') {
      valA = new Date(a.createdAt);
      valB = new Date(b.createdAt);
    } else {
      valA = a[field];
      valB = b[field];
    }

    if (valA < valB) {
      return order === 'asc' ? -1 : 1;
    } else if (valA > valB) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  })

  return sortedListings;
}