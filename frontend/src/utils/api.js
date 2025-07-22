import axios from 'axios';
import { baseURL } from '../globals';
import { logInfo, logWarning, logError } from '../services/loggingService';

export async function signupUser(userInfo) {
  try {
    const { data } = await axios.post(`${baseURL}/api/auth/signup`, userInfo, { withCredentials: true })
    return {
      success: true,
      message: data.message
    }
  } catch (error) {
    return {
      success: false,
      status: error.status,
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function loginUser(credentials) {
  try {
    const { data } = await axios.post(`${baseURL}/api/auth/login`, credentials, { withCredentials: true })
    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function logoutUser() {
  try {
    const { data } = await axios.post(`${baseURL}/api/auth/logout`, {}, { withCredentials: true })
    return {
      success: true,
      message: data.message
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function getRecommendedListings() {
  try {
    const { data } = await axios.get(`${baseURL}/api/listings/recommended`, { withCredentials: true })
    return {
      success: true,
      recommendedListings: data
    }
  } catch (error) {
    return {
      success: false,
      recommendedListings: [],
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function getFavoritedListings() {
  try {
    const { data } = await axios.get(`${baseURL}/api/listings/favorited`, { withCredentials: true })
    return {
      success: true,
      favoritedListings: data
    }
  } catch (error) {
    return {
      success: false,
      favoritedListings: [],
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function getPopularListings() {
  try {
    const { data } = await axios.get(`${baseURL}/api/listings/popular`, { withCredentials: true })
    return {
      success: true,
      popularListings: data
    }
  } catch (error) {
    return {
      success: false,
      popularListings: [],
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function getRecentlyVisitedListings(count) {
  try {
    const { data } = await axios.get(`${baseURL}/api/listings/recently-visited/${count}`, { withCredentials: true })
    return {
      success: true,
      recentlyVisitedListings: data
    }
  } catch (error) {
    return {
      success: false,
      recentlyVisitedListings: [],
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function getMostDwelledListings(count) {
  try {
    const { data } = await axios.get(`${baseURL}/api/listings/most-dwelled/${count}`, { withCredentials: true })
    return {
      success: true,
      mostDwelledListings: data
    }
  } catch (error) {
    return {
      success: false,
      mostDwelledListings: [],
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function getOwnedListings() {
  try {
    const { data } = await axios.get(`${baseURL}/api/listings/owned`, { withCredentials: true })
    return {
      success: true,
      ownedListings: data
    }
  } catch (error) {
    return {
      success: false,
      ownedListings: [],
      message: error.response?.data?.message || error.message || 'An error occured'
    }
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

export async function getUserZIP() {
  try {
    const response = await axios.get(`${baseURL}/api/user/location`, { withCredentials: true });
    const { zip } = response.data;
    return { success: true, zip }
  } catch (error) {
    return { success: false, zip: '', message: error?.response?.data?.message || 'An error occured while retrieving user location' }
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
    const { data } = await axios.get(`${baseURL}/api/auth/check-auth`, { withCredentials: true })
    return {
      authenticated: true,
      id: data.id
    };
  } catch (error) {
    return {
      authenticated: false,
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}