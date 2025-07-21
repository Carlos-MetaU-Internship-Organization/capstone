import axios from 'axios';
import { baseURL } from '../globals';
import { logInfo, logWarning, logError } from '../services/loggingService';

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
    // TODO: check if 404 or 500, send message 
    return null;
  }
}

export async function getModels(make) {
  try {
    const response = await axios.get(`${baseURL}/api/search/${make}/models`, { withCredentials: true });
    logInfo('Models successfully retrieved');

    const models = response.data;
    return models;
  } catch (error) {
    logError('HTTP request failed when trying to fetch models', error);
    return null;
  }
}

export async function fetchRecommendations(userId) {

}

export async function getUserZIP() {
  try {
    const response = await axios.get(`${baseURL}/api/user/location`, { withCredentials: true });
    const { zip } = response.data;
    return { success: true, zip }
  } catch (error) {
    return { success: false, message: error?.response?.data?.message || 'An error occured while retrieving user location' }
  }
}

export async function getListingViewCount(listingId) {
  try {
    const response = await axios.get(`${baseURL}/api/listings/${listingId}/viewCount`)
    return { success: true, viewCount: response.data.viewCount }
  } catch (error) {
    return { success: false }
  }
}

export async function checkAuth() {
  try {
    const response = await axios.get(`${baseURL}/api/auth/check-auth`, { withCredentials: true })
    const { id, authenticated } = response.data
    return { id, authenticated }
  } catch (error) {
    return { authenticated: false }
  }
}