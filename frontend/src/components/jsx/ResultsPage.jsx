import "./../css/ResultsPage.css";
import heart from "./../../assets/heart.png";
import pinkHeart from "./../../assets/pinkHeart.png";
import Header from "./ui/Header";
import Listing from "./ui/Listing";
import SortMenu from "./ui/SortMenu";
import { useState, useEffect } from "react";
import { logWarning, logError } from "../../services/loggingService";
import {
  getFavoritedListings,
  getModels,
  getSavedSearchFilters,
  saveSearchFilter,
  viewSearchFilter,
  getListings,
} from "../../utils/api";
import { sortListings } from "./../../utils/listings";
import { PAGE_SIZE } from "../../utils/constants";
import SavedSearchFilters from "./ui/SavedSearchFilters";
import AdditionalFilter from "./ui/AdditionalFilter";
import RequiredFilters from "./ui/RequiredFilters";
import ColorSelector from "./ui/ColorSelector";

function ResultsPage() {
  const cachedRecentSearch = JSON.parse(localStorage.getItem("recentSearch"));
  const {
    filters: cachedFilters,
    sortOption: cachedSortOption,
    listings: cachedListings,
    makes,
    models: cachedModels,
  } = cachedRecentSearch;

  const [onScreenFilters, setOnScreenFilters] = useState(cachedFilters);
  const [activeFilters, setActiveFilters] = useState(cachedFilters);

  const [models, setModels] = useState(cachedModels);
  const [listingsInfo, setListingsInfo] = useState(
    cachedListings
      ? { listings: cachedListings, totalListingsCount: cachedListings.length }
      : {},
  );
  const [listingsUpdated, setListingsUpdated] = useState(false);
  const [displayedListings, setDisplayedListings] = useState(
    cachedListings?.slice(0, 20) || [],
  );
  const [favoritedVins, setFavoritedVins] = useState([]);
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState(cachedSortOption || "");
  const [searchChange, setSearchChange] = useState(false);

  const [savedSearchFilters, setSavedSearchFilters] = useState([]);
  const [isSearchFavorited, setIsSearchFavorited] = useState(false);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [favoritedListingsResponse, savedSearchFiltersResponse] =
          await Promise.all([getFavoritedListings(), getSavedSearchFilters()]);

        const vins = favoritedListingsResponse.favoritedListings.map(
          (listing) => listing.vin,
        );
        setFavoritedVins(vins);

        setSavedSearchFilters(savedSearchFiltersResponse.savedSearchFilters);
      } catch (error) {
        logError("One or more parallel requests went wrong", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const equivalent = (a, b) => (a ?? "") == (b ?? "");
    if (savedSearchFilters.length > 0) {
      const isSaved = savedSearchFilters.some((savedFilter) => {
        return (
          equivalent(savedFilter.condition, onScreenFilters.condition) &&
          equivalent(savedFilter.make, onScreenFilters.make) &&
          equivalent(savedFilter.model, onScreenFilters.model) &&
          equivalent(savedFilter.distance, onScreenFilters.distance) &&
          equivalent(savedFilter.zip, onScreenFilters.zip) &&
          equivalent(savedFilter.color, onScreenFilters.color) &&
          equivalent(savedFilter.minYear, onScreenFilters.minYear) &&
          equivalent(savedFilter.maxYear, onScreenFilters.maxYear) &&
          equivalent(savedFilter.maxMileage, onScreenFilters.maxMileage) &&
          equivalent(savedFilter.minPrice, onScreenFilters.minPrice) &&
          equivalent(savedFilter.maxPrice, onScreenFilters.maxPrice)
        );
      });
      setIsSearchFavorited(isSaved);
    }
  }, [onScreenFilters, savedSearchFilters]);

  const handleSearchFavoriteClick = async () => {
    const searchFilterResponse = await saveSearchFilter(onScreenFilters);
    const { inDB, searchFilter } = searchFilterResponse;
    if (inDB) {
      setSavedSearchFilters((prev) => [...prev, searchFilter]);
    } else {
      setSavedSearchFilters((prev) =>
        prev.filter((filter) => filter.id !== searchFilter.id),
      );
      document.getElementsByClassName("saved-search-select-elem").value = "";
    }
    setIsSearchFavorited((prev) => !prev);
  };

  const handlePageChange = () => {
    const addedListings = listingsInfo.listings.slice(
      page * PAGE_SIZE,
      (page + 1) * PAGE_SIZE,
    );
    setDisplayedListings((prev) => [...prev, ...addedListings]);
    setPage((prev) => prev + 1);
  };

  const updateModels = async (make) => {
    try {
      const { models, success } = await getModels(make);
      if (success) {
        setModels(models);
        setOnScreenFilters((prev) => ({ ...prev, model: models[0].name }));
      }
    } catch (error) {
      logError("Something went wrong", error);
    }
  };

  const updateForm = async (event) => {
    setSearchChange(true);
    const elem = event.target.name;
    const value = event.target.value;
    setOnScreenFilters((prev) => ({ ...prev, [elem]: value }));

    if (elem === "make") {
      updateModels(value);
    }
  };

  useEffect(() => {
    const fetchListings = async () => {
      await updateListings(activeFilters);
      setLoaded(true);
    };
    fetchListings();
  }, [activeFilters]);

  useEffect(() => {
    if (sortOption) {
      handleSort(sortOption);
    }
    setListingsUpdated(false);
  }, [sortOption, listingsUpdated]);

  const updateListings = async (activeFilters) => {
    if (listingsInfo.listings && activeFilters === cachedFilters) {
      return;
    }

    const { make, model } = activeFilters;
    if (!make || !model) {
      logWarning("Search failed: Missing fields.");
      return;
    }

    try {
      const [{ listings }, _] = await Promise.all([
        getListings(activeFilters),
        viewSearchFilter(onScreenFilters),
      ]);

      if (listings) {
        localStorage.setItem(
          "recentSearch",
          JSON.stringify({
            filters: activeFilters,
            sortOption,
            listings,
            makes,
            models,
          }),
        );
        const listingCount = listings.length;

        setListingsInfo({ listings, totalListingsCount: listingCount });
        setListingsUpdated(true);
        if (!sortOption) {
          setDisplayedListings(listings.slice(0, PAGE_SIZE));
        }
        setSearchChange(false);
      } else {
        setListingsInfo({ listings: [], totalListingsCount: 0 });
      }
    } catch (error) {
      logError("Something went wrong", error);
    }
  };

  const handleSavedSearchFilterLoad = async (event) => {
    const savedSearchFilterId = event.target.value;
    const savedSearchFilter = savedSearchFilters.find(
      (searchFilter) => searchFilter.id == savedSearchFilterId,
    );

    const updatedFilters = {
      make: savedSearchFilter.make,
      model: savedSearchFilter.model,
      condition: savedSearchFilter.condition,
      zip: savedSearchFilter.zip,
      distance: savedSearchFilter.distance,
      color: savedSearchFilter.color || "",
      minYear: savedSearchFilter.minYear || "",
      maxYear: savedSearchFilter.maxYear || "",
      maxMileage: savedSearchFilter.maxMileage || "",
      minPrice: savedSearchFilter.minPrice || "",
      maxPrice: savedSearchFilter.maxPrice || "",
    };

    const { models } = await getModels(updatedFilters.make);

    localStorage.setItem(
      "recentSearch",
      JSON.stringify({ filters: updatedFilters, makes, models }),
    );

    setModels(models);
    setOnScreenFilters(updatedFilters);
    setActiveFilters(updatedFilters);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setActiveFilters(onScreenFilters);
    setSearchChange(false);
  };

  const handleSort = async (newSortOption) => {
    localStorage.setItem(
      "recentSearch",
      JSON.stringify({
        filters: activeFilters,
        sortOption: newSortOption,
        listings: listingsInfo.listings,
        makes,
        models,
      }),
    );

    if (!listingsInfo?.listings?.length) return;

    const [field, order] = newSortOption.split(":");

    const sortedListings = sortListings(
      listingsInfo.listings,
      field,
      order,
      activeFilters.zip,
    );

    setListingsInfo({
      listings: sortedListings,
      totalListingsCount: sortedListings.length,
    });
    setDisplayedListings(sortedListings.slice(0, page * PAGE_SIZE));
  };

  const colors = [
    "beige",
    "black",
    "blue",
    "brown",
    "gold",
    "gray",
    "green",
    "orange",
    "purple",
    "red",
    "silver",
    "white",
    "yellow",
  ];

  return (
    <div id="results-page">
      <Header />
      {loaded ? (
        <div id="result-page-content" className="fade">
          <div id="result-page-form-content" className="translucent">
            <form id="advanced-filters" onSubmit={handleSearch}>
              <img
                loading="lazy"
                id="favorite-search-button"
                className="pointer"
                height={25}
                src={isSearchFavorited ? pinkHeart : heart}
                onClick={handleSearchFavoriteClick}
              />
              <RequiredFilters
                makes={makes}
                models={models}
                filters={onScreenFilters}
                setForm={updateForm}
              />
              <div className="filter">
                <ColorSelector
                  className="filter-input"
                  activeColor={onScreenFilters.color}
                  updateColor={updateForm}
                  disableDefaultOption={false}
                />
              </div>
              <AdditionalFilter
                label="Min Year"
                name="minYear"
                activeValue={onScreenFilters.minYear}
                updateValue={updateForm}
              />
              <AdditionalFilter
                label="Max Year"
                name="maxYear"
                activeValue={onScreenFilters.maxYear}
                updateValue={updateForm}
              />
              <AdditionalFilter
                label="Max Mileage"
                name="maxMileage"
                activeValue={onScreenFilters.maxMileage}
                updateValue={updateForm}
              />
              <AdditionalFilter
                label="Min Price"
                name="minPrice"
                activeValue={onScreenFilters.minPrice}
                updateValue={updateForm}
              />
              <AdditionalFilter
                label="Max Price"
                name="maxPrice"
                activeValue={onScreenFilters.maxPrice}
                updateValue={updateForm}
              />
              {searchChange && (
                <button id="result-page-search-button" type="submit">
                  Search
                </button>
              )}
            </form>
            <SavedSearchFilters
              searchFilters={savedSearchFilters}
              onLoad={handleSavedSearchFilterLoad}
            />
          </div>
          <div id="result-page-listings-content">
            <SortMenu sortOption={sortOption} onChange={setSortOption} />
            <div id="car-listing-list">
              {displayedListings.length > 0 ? (
                displayedListings.map((listing) => {
                  return (
                    <Listing
                      key={listing.vin}
                      listingData={listing}
                      favoritedOnLoad={favoritedVins.includes(listing.vin)}
                    />
                  );
                })
              ) : (
                <div id="no-results-label">
                  <h2>No Results Found</h2>
                </div>
              )}
              {listingsInfo &&
                page * PAGE_SIZE < listingsInfo.totalListingsCount && (
                  <button
                    id="load-more-button"
                    className="translucent pointer"
                    onClick={handlePageChange}
                  >
                    Load More
                  </button>
                )}
            </div>
          </div>
        </div>
      ) : (
        <div className="loader-container">
          <div className="loading-text">
            Loading<span className="dots"></span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsPage;
