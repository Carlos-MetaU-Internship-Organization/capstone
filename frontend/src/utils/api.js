import axios from 'axios';
import { baseURL } from '../globals';
import { logInfo, logWarning, logError } from './logging.service';

export async function loginUser({ login, password }) {
  if (!login || !password) {
    logWarning('Login failed: Missing fields.');
    return { success: false, message: 'Login and password are required.'};
  }

  try {
    const response = await axios.post(`${baseURL}/api/auth/login/`, { login, password }, { withCredentials: true });

    if (response.data.status === 200) {
      logInfo('Login successful', { login });
      return { success: true, message: response.data.message };
    } else {
      logWarning('Login failed', response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    logError('HTTP request failed when trying to log in', error);
    return { success: false, message: 'HTTP Request failed when trying to log in'};
  }
}

export async function fetchListings(params) {
  try {
    const response = await axios.get(`${baseURL}/api/search/`, {
      params,
      withCredentials: true
    });
    logInfo('Successfully retrieved listings!');

    const matching_listings = response.data;
    return matching_listings;
  } catch (error) {
    logError('Listings HTTP request failed', error);
  }
}

export async function fetchRecommendations(userId) {

}