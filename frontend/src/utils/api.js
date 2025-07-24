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
    const response = await axios.get(`${baseURL}/api/listings/search`, {
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
    const response = await axios.get(`${baseURL}/api/listings/id/${listingId}/viewCount`, { withCredentials: true })
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

export async function getSavedSearchFilters() {
  try {
    const { data } = await axios.get(`${baseURL}/api/searchFilters/saved`, { withCredentials: true })
    return {
      success: true,
      savedSearchFilters: data
    };
  } catch (error) {
    return {
      success: false,
      savedSearchFilters: [],
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function saveSearchFilter(searchFilter) {
  try {
    const { data } = await axios.post(`${baseURL}/api/searchFilters/save`, searchFilter, { withCredentials: true})
    return {
      success: true,
      inDB: data.inDB,
      searchFilter: data.searchFilter
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function viewSearchFilter(searchFilter) {
  try {
    await axios.post(`${baseURL}/api/searchFilters/view`, searchFilter, { withCredentials: true})
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function getMakes() {
  try {
    const { data } = await axios.get(`${baseURL}/api/makeModels/makes`, { withCredentials: true });
    return {
      success: true,
      makes: data
    };
  } catch (error) {
    return {
      success: false,
      makes: [],
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function getModels(make) {
  try {
    const { data } = await axios.get(`${baseURL}/api/makeModels/${make}/models`, { withCredentials: true });
    return {
      success: true,
      models: data
    };
  } catch (error) {
    return {
      success: false,
      models: [],
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function sendMessage(messageInfo) {
  try {
    const { data } = await axios.post(`${baseURL}/api/messages/`, messageInfo, { withCredentials: true });
    return {
      success: true,
      msg: data
    };
  } catch (error) {
    return {
      success: false,
      msg: '',
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function getConversationHistory(listingId, otherUserId) {
  try {
    const { data } = await axios.get(`${baseURL}/api/messages/listing/${listingId}/otherUser/${otherUserId}`, { withCredentials: true });
    return {
      success: true,
      conversationHistory: data
    };
  } catch (error) {
    return {
      success: false,
      conversationHistory: [],
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function getBuyersAndInfo(listingId) {
  try {
    const { data } = await axios.get(`${baseURL}/api/messages/listing/${listingId}/buyers`, { withCredentials: true });
    return {
      success: true,
      buyersAndInfo: data
    };
  } catch (error) {
    return {
      success: false,
      buyersAndInfo: [],
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function getListingFromVIN(vin) {
  try {
    const { data } = await axios.get(`${baseURL}/api/listings/vin/${vin}`, { withCredentials: true });
    return {
      success: true,
      listing: data
    };
  } catch (error) {
    return {
      success: false,
      listing: null,
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function favoriteListing(vin, newStatus) {
  try {
    await axios.patch(`${baseURL}/api/listings/vin/${vin}/favorite`, { newStatus }, { withCredentials: true });
    return {
      favoritedStatus: newStatus
    };
  } catch (error) {
    return {
      favoritedStatus: !newStatus,
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function deleteListing(listingId) {
  try {
    await axios.delete(`${baseURL}/api/listings/id/${listingId}`, { withCredentials: true });
    return {
      deletionStatus: true
    };
  } catch (error) {
    return {
      deletionStatus: false,
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function sellListing(listingId, newStatus) {
  try {
    await axios.patch(`${baseURL}/api/listings/id/${listingId}/sell`, { newStatus }, { withCredentials: true });
    return {
      soldStatus: newStatus
    };
  } catch (error) {
    return {
      soldStatus: !newStatus,
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function createListing(listingInfo) {
  try {
    const { data } = await axios.post(`${baseURL}/api/listings/`, listingInfo, { withCredentials: true });
    return {
      success: true,
      listing: data
    };
  } catch (error) {
    return {
      success: false,
      listing: null,
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function checkListingFavoriteStatus(vin) {
  try {
    const { data } = await axios.get(`${baseURL}/api/listings/vin/${vin}/isFavorited`, { withCredentials: true });
    return {
      success: true,
      favoriteStatus: data
    }
  } catch (error) {
    return {
      success: false,
      favoriteStatus: null,
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function getListings(searchFilter) {
  try {
    const { data } = await axios.get(`${baseURL}/api/listings/search`, {
      params: searchFilter,
      withCredentials: true
    });
    return {
      success: true,
      listings: data
    }
  } catch (error) {
    return {
      success: false,
      listings: [],
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}

export async function estimatePrice(listingInfo) {
  try {
    const { data } = await axios.post(`${baseURL}/api/listings/estimate-price`, listingInfo, { withCredentials: true })
    return {
      priceEstimationInfo: data
    }
  } catch (error) {
    return {
      priceEstimationInfo: null,
      message: error.response?.data?.message || error.message || 'An error occured'
    }
  }
}