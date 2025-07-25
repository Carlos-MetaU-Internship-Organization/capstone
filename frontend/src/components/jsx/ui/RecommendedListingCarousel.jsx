import "./../../css/ui/RecommendedListingCarousel.css";
import { useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import loadingGIF from "./../../../assets/loading.gif";
import { ALLOWED_PAUSE_DELAY } from "../../../utils/constants";

function RecommendedListingCarousel({ listings }) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelector(".slider").classList.add("hover-pause");
    }, ALLOWED_PAUSE_DELAY);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="recommended-container">
      <h2 className="recommended-label">Recommended For You</h2>
      {listings.length > 0 ? (
        <div className="slider" style={{ "--count": listings.length }}>
          <div className="recommended-listings">
            {listings.map((listing, index) => {
              return (
                <div
                  className="recommended-listing"
                  key={index}
                  style={{ "--index": index }}
                >
                  <img
                    loading="lazy"
                    src={listing.images[0]}
                    className="recommended-car-image pointer grow"
                    onClick={() => navigate(`/listing/${listings[index].vin}`)}
                  />
                  <h3 className="recommended-info">
                    {listing.year} {listing.make} {listing.model}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <img loading="lazy" src={loadingGIF} />
      )}
    </div>
  );
}

export default memo(RecommendedListingCarousel);
