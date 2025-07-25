import "./../css/BuyPage.css";
import Header from "./ui/Header";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logWarning, logError } from "../../services/loggingService";
import {
  getFavoritedListings,
  getMostDwelledListings,
  getModels,
  getUserZIP,
  getSavedSearchFilters,
  getMakes,
} from "../../utils/api";
import { PAGE_SIZE } from "../../utils/constants";
import SavedSearchFilters from "./ui/SavedSearchFilters";
import ListingCarousel from "./ui/ListingCarousel";
import RequiredFilters from "./ui/RequiredFilters";

function BuyPage() {
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [filters, setFilters] = useState({
    condition: "new&used",
    make: "",
    model: "",
    distance: "50",
    zip: "",
    color: "",
    minYear: "",
    maxYear: "",
    maxMileage: "",
    minPrice: "",
    maxPrice: "",
  });
  const [mostDwelledListing, setMostDwelledListing] = useState(null);
  const [favoritedListings, setFavoritedListings] = useState([]);
  const [savedSearchFilters, setSavedSearchFilters] = useState([]);
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          makesResponse,
          favoritedListingsResponse,
          mostDwelledListingsResponse,
          savedSearchFiltersResponse,
          zipResponse,
        ] = await Promise.all([
          getMakes(),
          getFavoritedListings(),
          getMostDwelledListings(PAGE_SIZE),
          getSavedSearchFilters(),
          getUserZIP(),
        ]);

        setMakes(makesResponse.makes);
        setFavoritedListings(favoritedListingsResponse.favoritedListings);
        setMostDwelledListing(
          mostDwelledListingsResponse.mostDwelledListings[0],
        );
        setSavedSearchFilters(savedSearchFiltersResponse.savedSearchFilters);
        setFilters((prev) => ({ ...prev, zip: zipResponse.zip }));
        setLoaded(true);
      } catch (error) {
        logError("One or more parallel requests went wrong", error);
      }
    };

    fetchData();
  }, []);

  const updateFilters = async (event) => {
    const elem = event.target.name;
    const value = event.target.value;
    setFilters((prev) => ({ ...prev, [elem]: value }));

    if (elem === "make") {
      updateModels(value);
    }
  };

  const updateModels = async (make) => {
    try {
      const { models, success } = await getModels(make);
      if (success) {
        setModels(models);
        setFilters((prev) => ({ ...prev, model: models[0].name }));
      }
    } catch (error) {
      logError("Something went wrong", error);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    const { make, model, condition, zip, distance } = filters;
    if (!make || !model || !condition || !zip || !distance) {
      logWarning("Search failed: Missing fields.");
      return;
    }

    localStorage.setItem(
      "recentSearch",
      JSON.stringify({ filters, makes, models }),
    );

    navigate("/results");
  };

  const handleSavedSearchFilterLoad = async (event) => {
    const savedSearchFilterId = event.target.value;
    const savedSearchFilter = savedSearchFilters.find(
      (searchFilter) => searchFilter.id == savedSearchFilterId,
    );

    const updatedForm = {
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

    const { models } = await getModels(updatedForm.make);

    localStorage.setItem(
      "recentSearch",
      JSON.stringify({ filters: updatedForm, makes, models }),
    );

    navigate("/results");
  };

  return (
    <div id="buy-page">
      <Header />
      {loaded ? (
        <>
          <div id="buy-content" className="fade">
            <div id="buy-search" className="translucent">
              <form id="filter-search" onSubmit={handleSearch}>
                <RequiredFilters
                  makes={makes}
                  models={models}
                  filters={filters}
                  setForm={updateFilters}
                />
                <button
                  className="translucent"
                  id="search-button"
                  type="submit"
                >
                  Search
                </button>
              </form>
              <SavedSearchFilters
                searchFilters={savedSearchFilters}
                onLoad={handleSavedSearchFilterLoad}
              />
            </div>
            {mostDwelledListing && (
              <div id="most-viewed-container" className="translucent grow">
                <h2>Still Interested?</h2>
                <div className="most-viewed-listing pointer">
                  <img
                    loading="lazy"
                    src={mostDwelledListing.images[0]}
                    id="most-viewed-car-img"
                    className="car-image"
                    onClick={() =>
                      navigate(`/listing/${mostDwelledListing.vin}`)
                    }
                  />
                  <div id="most-viewed-car-info">
                    <p>Make: {mostDwelledListing.make}</p>
                    <p>Model: {mostDwelledListing.model}</p>
                    <p>Year: {mostDwelledListing.year}</p>
                    <p>
                      Location: {mostDwelledListing.city},{" "}
                      {mostDwelledListing.state}
                    </p>
                    <p>
                      Price: $
                      {parseInt(mostDwelledListing.price).toLocaleString(
                        "en-US",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <ListingCarousel
            listings={favoritedListings}
            currentPage={page}
            title="Your Favorites"
            pageSetter={setPage}
          />
        </>
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

export default BuyPage;
