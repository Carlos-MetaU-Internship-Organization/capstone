import "./../css/SellPage.css";
import arrow from "./../../assets/arrow.png";
import soldOverlay from "./../../assets/soldOverlay.png";
import loadingGif from "./../../assets/loading.gif";
import Header from "./ui/Header";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logInfo, logError } from "../../services/loggingService";
import {
  ELASTICITY_KEYS,
  CAPITALIZE,
  LISTINGS_PER_CYCLE,
} from "./../../utils/constants";
import {
  getOwnedListings,
  getMakes,
  getModels,
  createListing,
  editListing,
  estimatePrice,
} from "../../utils/api";
import ColorSelector from "./ui/ColorSelector";

function SellPage() {
  let initialListingInfo = {
    condition: "",
    make: "",
    model: "",
    year: "",
    color: "",
    mileage: "",
    vin: "",
    description: "",
    images: [],
    price: "",
  };

  const info = useLocation();

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [listingInfo, setListingInfo] = useState(initialListingInfo);
  const [ownedListings, setOwnedListings] = useState([]);
  const [page, setPage] = useState(1);
  const [priceEstimation, setPriceEstimation] = useState();
  const [showPriceEstimation, setShowPriceEstimation] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(
    Math.floor(ELASTICITY_KEYS.length / 2),
  );
  const [loaded, setLoaded] = useState(false);
  const [loadPriceEstimation, setLoadPriceEstimation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('')
  const [isEdit, setIsEdit] = useState(false)

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [makesResponse, ownedListingsResponse] = await Promise.all([
          getMakes(),
          getOwnedListings(),
        ]);

        setMakes(makesResponse.makes);
        setOwnedListings(ownedListingsResponse.ownedListings);

        if (info.state) {
          setListingInfo(info.state.data);
          updateModels(info.state.data.make);
          setIsEdit(true);
        }

        setLoaded(true);
      } catch (error) {
        logError("One or more parallel requests went wrong", error);
      }
    };

    fetchData();
  }, []);

  const updateModels = async (make) => {
    try {
      const { models, success } = await getModels(make);
      if (success) {
        setModels(models);
        setListingInfo((prev) => ({ ...prev, model: models[0].name }));
      }
    } catch (error) {
      logError("Something went wrong", error);
    }
  };

  const updateForm = async (event) => {
    const elem = event.target.name;

    const value = event.target.value;
    setListingInfo((prev) => ({ ...prev, [elem]: value }));

    if (elem === "make") {
      updateModels(value);
    }
  };

  const handleListingCreation = async (event) => {
    event.preventDefault();

    try {
      const { listing } = await createListing(listingInfo);
      logInfo("New listing created successfully");
      setListingInfo(initialListingInfo);
      setOwnedListings((prev) => [listing, ...prev]);
    } catch (error) {
      logError(
        "Something went wrong when trying to create a new listing",
        error,
      );
    }
  };

  const handleListingEdit = async (event) => {
    event.preventDefault();

    try {
      const { listing } = await editListing(listingInfo.id, listingInfo);
      logInfo("Listing edited successfully");
      setOwnedListings((prev) => [listing, ...(prev.filter(listing => listing.id !== listingInfo.id))]);
      setListingInfo(initialListingInfo);
      info.state = null;
    } catch (error) {
      logError(
        "Something went wrong when trying to create a new listing",
        error,
      );
    }
  }

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    let images = [];
    for (const file of files) {
      const reader = new FileReader();
      const result = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      images.push(result);
    }
    setListingInfo((prev) => ({ ...prev, images }));
  };

  const handlePageChange = (event) => {
    if (event.target.id === "flipped-arrow") {
      setPage((prev) => prev - 1);
    } else {
      setPage((prev) => prev + 1);
    }
  };

  const redirectToListingsPage = () => {
    navigate("/my-listings");
  };

  const handlePriceEstimation = async () => {
    const requiredFields = ["condition", "make", "model", "year", "mileage"]
    const missingFields = requiredFields.filter((field) => listingInfo[field] === '')
    if (missingFields.length > 0) {
      setErrorMessage(`Please fill out the following fields: ${missingFields.join(', ')}`)
      return;
    }

    setErrorMessage('')

    try {
      setLoadPriceEstimation(true);
      const { priceEstimationInfo } = await estimatePrice(listingInfo);
      if (priceEstimationInfo) {
        setPriceEstimation(priceEstimationInfo);
        setLoadPriceEstimation(false);
        setShowPriceEstimation(true);
      }
    } catch (error) {
      logError(
        "Something went wrong when trying to generate a price for your listing",
        error,
      );
    }
  };

  const handleSliderInput = async (event) => {
    setSliderIndex(Number(event.target.value));
  };

  const currentSliderKey = ELASTICITY_KEYS[sliderIndex];

  return (
    <div id="sell-page">
      <Header />
      <div id="sell-page-container">
        {loaded ? (
          <>
            <div id="sell-content" className="fade">
              <div id="sell-search">
                <form
                  className="translucent"
                  id="new-listing-form"
                  onSubmit={!isEdit ? handleListingCreation : handleListingEdit}
                  autoComplete="off"
                >
                  <div id="listing-options">
                    <div id="listing-option">
                      <label>Condition</label>
                      <select
                        className="translucent new-listing-input pointer"
                        value={listingInfo.condition}
                        name="condition"
                        onChange={updateForm}
                        required
                      >
                        <option value="" disabled selected></option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                      </select>
                    </div>
                    <div id="listing-option">
                      <label>Make</label>
                      <select
                        className="translucent new-listing-input pointer"
                        id="make-selector"
                        value={listingInfo.make}
                        name="make"
                        onChange={updateForm}
                        required
                      >
                        <option value="" disabled selected></option>
                        {makes.map((make) => {
                          return <option value={make.name}>{make.name}</option>;
                        })}
                      </select>
                    </div>
                    <div id="listing-option">
                      <label>Model</label>
                      <select
                        className="translucent new-listing-input pointer"
                        id="model-selector"
                        value={listingInfo.model}
                        name="model"
                        onChange={updateForm}
                        required
                      >
                        <option value="" disabled selected></option>
                        {models.length > 0 &&
                          models.map((model) => {
                            return (
                              <option value={model.name}>{model.name}</option>
                            );
                          })}
                      </select>
                    </div>
                    <div id="listing-option">
                      <label>Year</label>
                      <input
                        type="number"
                        className="new-listing-input translucent"
                        value={listingInfo.year}
                        name="year"
                        onChange={updateForm}
                        required
                      />
                    </div>
                    <div id="listing-option">
                      <ColorSelector
                        className="new-listing-input"
                        value={listingInfo.color}
                        updateColor={updateForm}
                        disableDefaultOption={true}
                      />
                    </div>
                    <div id="listing-option">
                      <label>Mileage</label>
                      <input
                        type="number"
                        inputmode="numeric"
                        className="new-listing-input translucent"
                        value={listingInfo.mileage}
                        name="mileage"
                        onChange={updateForm}
                        required
                      />
                    </div>
                    <div id="listing-option">
                      <label>VIN</label>
                      <input
                        type="text"
                        className="new-listing-input translucent"
                        value={listingInfo.vin}
                        name="vin"
                        onChange={updateForm}
                        required
                      />
                    </div>
                  </div>
                  <div id="finalize-listing">
                    <div id="listing-option">
                      <label>Description</label>
                      <textarea
                        id="description-input"
                        className="new-listing-input translucent"
                        value={listingInfo.description}
                        name="description"
                        onChange={updateForm}
                        required
                      />
                    </div>
                    <div id="listing-option">
                      <label>Upload Images</label>
                      <input
                        type="file"
                        id="image-upload-input"
                        className="new-listing-input translucent pointer"
                        onChange={handleFileUpload}
                        multiple
                        required
                      />
                    </div>
                    <div id="listing-option">
                      <label>Asking Price</label>
                      <input
                        type="number"
                        id="asking-price-input"
                        className="new-listing-input translucent"
                        value={listingInfo.price}
                        name="price"
                        onChange={updateForm}
                        required
                      />
                    </div>
                    <button
                      className="translucent"
                      id="create-listing-button"
                      type="submit"
                    >
                      {!isEdit ? 'Create Listing' : 'Edit Listing'}
                    </button>
                  </div>
                </form>
                <div id="price-helper-container" className="translucent">
                  <p>Don't know what to price your car?</p>
                  {!loadPriceEstimation ? (
                    <>
                      {
                        errorMessage && (
                          <div className="error-message"><strong>{errorMessage}</strong></div>
                        )
                      }
                      <button
                        id="price-helper-button"
                        className="translucent"
                        onClick={handlePriceEstimation}
                      >
                        Click Me
                      </button>
                    </>
                  ) : (
                    <img
                      loading="lazy"
                      src={loadingGif}
                      id="price-loading-gif"
                    />
                  )}
                  {showPriceEstimation && (
                    <div id="price-estimation">
                      <p>
                        Recommended Price:{" "}
                        <strong>{priceEstimation.recommendedPrice}</strong>
                      </p>
                      <p>
                        Confidence Level:{" "}
                        <strong>
                          {CAPITALIZE(priceEstimation.confidenceLevel)}
                        </strong>
                      </p>
                      {priceEstimation.recommendedPrice !==
                        priceEstimation.marketPrice && (
                        <p>
                          Market Price:{" "}
                          <strong>{priceEstimation.marketPrice}</strong>
                        </p>
                      )}
                      {Object.keys(priceEstimation.elasticity).length !== 0 && (
                        <>
                          <p>
                            Expected Time to Sell:{" "}
                            <strong>
                              {priceEstimation.elasticity[currentSliderKey]}{" "}
                              days{" "}
                              {currentSliderKey != "0"
                                ? `at ${currentSliderKey}% price change`
                                : ""}
                            </strong>
                          </p>
                          <input
                            type="range"
                            min="0"
                            max={ELASTICITY_KEYS.length - 1}
                            value={sliderIndex}
                            id="slider"
                            onInput={handleSliderInput}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {ownedListings?.length > 0 && (
              <div className="listings-container fade">
                <label
                  id="listings-label"
                  className="pointer"
                  onClick={redirectToListingsPage}
                >
                  Your Listings
                </label>
                <div className="listings-cars">
                  {page > 1 && (
                    <img
                      loading="lazy"
                      src={arrow}
                      height="50px"
                      className="flipped-arrow pointer"
                      onClick={handlePageChange}
                    />
                  )}
                  {ownedListings
                    .slice(
                      LISTINGS_PER_CYCLE * (page - 1),
                      LISTINGS_PER_CYCLE * page,
                    )
                    .map((listing) => (
                      <div
                        key={listing.id}
                        className="listing-wrapper"
                        onClick={() => navigate(`/listing/${listing.vin}`)}
                      >
                        <img
                          loading="lazy"
                          src={listing.images[0]}
                          className="listing-image pointer grow"
                        />
                        {listing.sold && (
                          <img
                            loading="lazy"
                            src={soldOverlay}
                            className="sold-overlay-img"
                          />
                        )}
                      </div>
                    ))}
                  {ownedListings.length > page * LISTINGS_PER_CYCLE && (
                    <img
                      loading="lazy"
                      src={arrow}
                      height="50px"
                      className="pointer"
                      onClick={handlePageChange}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="loader-container">
            <div className="loading-text">
              Loading<span className="dots"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellPage;
