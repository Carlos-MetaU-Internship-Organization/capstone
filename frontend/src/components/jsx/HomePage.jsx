import "./../css/HomePage.css";
import Header from "./ui/Header";
import { useState, useEffect } from "react";
import { logError } from "../../services/loggingService";
import {
  getRecommendedListings,
  getFavoritedListings,
  getPopularListings,
  getRecentlyVisitedListings,
} from "../../utils/api";
import { PAGE_SIZE, MAX_LISTING_COUNT_TO_DISPLAY } from "../../utils/constants";
import ListingCarousel from "./ui/ListingCarousel";
import RecommendedListingCarousel from "./ui/RecommendedListingCarousel";

function HomePage() {
  const [recommendedListings, setRecommendedListings] = useState([]);

  const [favoritedListings, setFavoritedListings] = useState([]);
  const [favoritesPage, setFavoritesPage] = useState(1);

  const [popularListings, setPopularListings] = useState([]);
  const [popularPage, setPopularPage] = useState(1);

  const [recentlyVisitedListings, setRecentlyVisitedListings] = useState([]);
  const [recentlyVisitedPage, setRecentlyVisitedPage] = useState(1);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchAllListings = async () => {
      try {
        const [
          { favoritedListings },
          { recentlyVisitedListings },
          { popularListings },
        ] = await Promise.all([
          getFavoritedListings(),
          getRecentlyVisitedListings(PAGE_SIZE),
          getPopularListings(),
        ]);

        setFavoritedListings(favoritedListings);
        setRecentlyVisitedListings(recentlyVisitedListings)
        setPopularListings(popularListings);

        setLoaded(true);

        const { recommendedListings } = await getRecommendedListings();
        const fallbackCount = Math.max(0, MAX_LISTING_COUNT_TO_DISPLAY - recommendedListings.length)
        const recommendedListingsWithFallback = recommendedListings.concat(popularListings.slice(0, fallbackCount))
        setRecommendedListings(recommendedListingsWithFallback);

        // New User (hasn't clicked on or searched for any listings)
        if (fallbackCount === MAX_LISTING_COUNT_TO_DISPLAY) {
          setPopularListings([])
        }
      } catch (error) {
        logError(
          "Something bad happened when trying to fetch your listings",
          error,
        );
      }
    };
    fetchAllListings();
  }, []);

  return (
    <div id="home-page">
      <Header />
      {loaded ? (
        <div id="home-content" className="fade">
          {
            recommendedListings.length > 0 && (
              <RecommendedListingCarousel listings={recommendedListings} />
            )
          }
          <ListingCarousel
            listings={favoritedListings}
            currentPage={favoritesPage}
            title="Your Favorites"
            pageSetter={setFavoritesPage}
          />
          <ListingCarousel
            listings={popularListings}
            currentPage={popularPage}
            title="What's popular"
            pageSetter={setPopularPage}
          />
          <ListingCarousel
            listings={recentlyVisitedListings}
            currentPage={recentlyVisitedPage}
            title="Recently Visited"
            pageSetter={setRecentlyVisitedPage}
          />
        </div>
      ) : (
        <div id="home-loading-screen">
          <h1 id="welcome-text">
            Welcome to CarPortal! Things are getting ready...
          </h1>
        </div>
      )}
    </div>
  );
}

export default HomePage;
