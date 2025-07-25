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
import { PAGE_SIZE } from "../../utils/constants";
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
          favoritedListingsResponse,
          recentlyVisitedListingsResponse,
          popularListingsResponse,
        ] = await Promise.all([
          getFavoritedListings(),
          getRecentlyVisitedListings(PAGE_SIZE),
          getPopularListings(),
        ]);

        setFavoritedListings(favoritedListingsResponse.favoritedListings);
        setRecentlyVisitedListings(
          recentlyVisitedListingsResponse.recentlyVisitedListings,
        );
        setPopularListings(popularListingsResponse.popularListings);

        setLoaded(true);

        const recommendedListingsResponse = await getRecommendedListings();
        setRecommendedListings(recommendedListingsResponse.recommendedListings);
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
          <RecommendedListingCarousel listings={recommendedListings} />
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
