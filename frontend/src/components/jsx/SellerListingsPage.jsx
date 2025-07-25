import "./../css/SellerListingsPage.css";
import Header from "./ui/Header";
import SellerListing from "./ui/SellerListing";
import { useState, useEffect } from "react";
import { PAGE_SIZE } from "../../utils/constants";
import { getOwnedListings } from "../../utils/api";

function SellerListingsPage() {
  const [ownedListings, setOwnedListings] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ownedListingsResponse = await getOwnedListings();
        setOwnedListings(ownedListingsResponse.ownedListings);
      } catch (error) {}
    };
    fetchData();
  }, []);

  const handlePageChange = () => {
    setPage((prev) => prev + 1);
  };

  const handleListingDeletion = (listingId) => {
    setOwnedListings(
      ownedListings.filter((listing) => listing.id !== listingId),
    );
  };

  return (
    <div id="seller-listings-page">
      <Header />
      <div id="seller-listings-page-content">
        <h2 id="seller-listings-title">Your Listings</h2>
        {ownedListings?.length > 0 && (
          <>
            <div id="seller-listings">
              {ownedListings.slice(0, PAGE_SIZE * page).map((listing) => {
                return (
                  <SellerListing
                    key={listing.id}
                    listingData={listing}
                    onDelete={handleListingDeletion}
                  />
                );
              })}
            </div>
            {page * PAGE_SIZE < ownedListings?.length && (
              <button
                id="load-more-seller-listings-button"
                className="translucent pointer"
                onClick={handlePageChange}
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SellerListingsPage;
