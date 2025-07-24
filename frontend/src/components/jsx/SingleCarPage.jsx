import './../css/SingleCarPage.css'
import arrow from './../../assets/arrow.png'
import heart from './../../assets/heart.png'
import pinkHeart from './../../assets/pinkHeart.png'
import Header from './Header'
import SellerInbox from './SellerInbox'
import { baseURL } from '../../globals'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { logError } from '../../services/loggingService';
import { checkAuth, checkListingFavoriteStatus, favoriteListing, getConversationHistory, getListingFromVIN, sendMessage } from '../../utils/api'

function SingleCarPage() {

  let { vin } = useParams();
  const path = useRef(window.location.href);
  const enterTime = useRef();
  const inactivityTimeout = useRef(null);

  const listingIdRef = useRef();
  const listingOwnerIdRef = useRef();
  const activeUserIdRef = useRef();

  const [listing, setListing] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  const [imageIndex, setImageIndex] = useState(0);

  const [conversationHistory, setConversationHistory] = useState([]);
  const [messageToSend, setMessageToSend] = useState('');

  const numClicks = useRef(0);

  // TODO: implement Seller POV
  // const [allMessages, setAllMessages] = useState({}); // for seller use only
  // const [selectedBuyerId, setSelectedBuyerId] = useState(null); // for seller use only

  // ON BOOT
  useEffect(() => {
    const boot = async () => {

      const { id } = await checkAuth();
      activeUserIdRef.current = id;
  
      const fetchData = async () => {
        try {
          const { listing } = await getListingFromVIN(vin);
          const { favoriteStatus } = await checkListingFavoriteStatus(vin)
          
          if (!listing) {
            // No listing was found
            // TODO: display error message component
          } else {
            setListing(listing)
            listingIdRef.current = listing.id;
            listingOwnerIdRef.current = listing.owner.id;
          }

          if (favoriteStatus === null) {
            // Something went wrong checking favorite status, likely Prisma error
            // TODO: display error message component
          } else {
            setIsFavorited(favoriteStatus);
          }

        } catch (error) {
          logError(`Something went wrong when trying to fetch listing with VIN: ${vin}`, error)
        }
      }
      await fetchData();

      const fetchMessages = async () => {
        try {
          const { conversationHistory } = await getConversationHistory(listingIdRef.current, listingOwnerIdRef.current);
          setConversationHistory(conversationHistory);
        } catch (error) {
          logError(`Something went wrong when trying to fetch conversation history between you and seller with id: ${listingOwnerIdRef.current}`, error)
        }
      }
      
      if (listingOwnerIdRef.current && listingOwnerIdRef.current !== activeUserIdRef.current) {
        await fetchMessages();
      }

      enterTime.current = Date.now();
    }

    boot();

    
    const resetEnterTime = () => {
      enterTime.current = Date.now();
      resetTimeout();
    }
    
    const resetTimeout = () => {
      clearTimeout(inactivityTimeout.current);
      inactivityTimeout.current = setTimeout(resetEnterTime, 300000);
    }
    
    inactivityTimeout.current = setTimeout(resetEnterTime, 300000)

    document.addEventListener('mousemove', () => {
      resetTimeout();
    })

    document.addEventListener('keydown', () => {
      resetTimeout();
    })
    
    const sendClickCountAndDwellTime = async () => {
      const leaveTime = Date.now();
      const dwellTime = Math.round((leaveTime - enterTime.current) / 1000);
      enterTime.current = leaveTime;

      fetch(`${baseURL}/api/track/dwell-and-click`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listingId: listingIdRef.current,
          clickCount: numClicks.current,
          dwellTime: dwellTime,
        }),
        keepalive: true
      })
    }

    const handlePageClick = () => {
      numClicks.current = numClicks.current + 1;
    }

    const onVisibilityChange = () => {
      if (document.visibilityState == 'hidden') {
        sendClickCountAndDwellTime();
      } else if (document.visibilityState == 'visible') {
        enterTime.current = Date.now();
      }
    }

    document.addEventListener('click', handlePageClick);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      if (window.location.href != path.current) {
        sendClickCountAndDwellTime();
      }
      document.removeEventListener('click', handlePageClick);
      document.removeEventListener('visibilitychange', onVisibilityChange);

      clearTimeout(inactivityTimeout.current);
      document.removeEventListener('mousemove', resetTimeout);
      document.removeEventListener('keydown', resetTimeout);
    }
  }, []);

  const handleFavoriteClick = async () => {
    try {
      const { favoritedStatus } = await favoriteListing(vin, !isFavorited)
      if (favoritedStatus === isFavorited) {
        // FavoriteStatus did not update... Something went wrong
        // TODO: display error message component
      } else {
        setIsFavorited(favoritedStatus);
      }
    } catch (error) {
      logError(`Something went wrong when trying to favorite listing with VIN: ${vin}`, error)
    }
  }

  const handleNextImage = () => {
    setImageIndex(prev => (prev + 1) % listing.images.length);
  }

  const handlePreviousImage = () => {
    setImageIndex(prev => (prev - 1 + listing.images.length) % listing.images.length);
  }

  const handleMessageSend = async () => {
    if (!messageToSend) return;

    const messageInfo = {
      receiverId: listing.owner.id,
      content: messageToSend,
      listingId: listing.id
    }

    try {
      const { msg } = await sendMessage(messageInfo);
      setConversationHistory(prev => [...prev, msg]);
      setMessageToSend('');
    } catch (error) {
      logError(`Something went wrong when trying to send a message to seller with id: ${listing.owner.id}`, error);
    }
  }
  
  if (!listing) {
    return <div>Loading...</div>
  }
  const formattedCondition = listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1);
  const formattedMiles = parseInt(listing.mileage).toLocaleString('en-US');
  const formattedPrice = `$${parseInt(listing.price).toLocaleString('en-US')}`;
  const formattedColor = listing.color.charAt(0).toUpperCase() + listing.color.slice(1);
  const formattedDate = new Date(listing.createdAt).toLocaleDateString();
  const formattedPhoneNumber = `(${listing.ownerNumber.slice(0, 3)}) ${listing.ownerNumber.slice(3, 6)}-${listing.ownerNumber.slice(6, 10)}`;
  return (
    <div id='single-car-page'>
      <Header />
      <div id='single-car-page-content'>
        <div id='main-content'>
          <div id='listing-container'>
            <div id='listing-info'>
              {listing.sold && <p id='sold-warning'>THIS LISTING HAS BEEN SOLD</p>}
              <img src={listing.images[imageIndex]} id='single-car-image'/>
              <div id='image-cycler'>
                <img src={arrow} id='previous-image' className='pointer' onClick={handlePreviousImage}/>
                <img src={arrow} id='next-image' className='pointer' onClick={handleNextImage}/>
              </div>
              <p id='single-car-title'><strong>{listing.year} {listing.make} {listing.model}</strong></p>
              <p className='single-car-info'><strong>Condition: </strong>{formattedCondition}</p>
              <p className='single-car-info'><strong>Miles: </strong>{formattedMiles}</p>
              <p className='single-car-info'><strong>Location: </strong>{listing.city}, {listing.state}</p>
              <p className='single-car-info'><strong>Price: </strong>{formattedPrice}</p>
              <p className='single-car-info'><strong>Description: </strong>{listing.description}</p>
              <p className='single-car-info'><strong>Color: </strong>{formattedColor}</p>
              <p className='single-car-info'><strong>VIN: </strong>{vin}</p>
              <p className='single-car-info'><strong>Date Listed: </strong>{formattedDate}</p>
              <p className='single-car-info'><strong>Owner Name: </strong>{listing.ownerName}</p>
              <p className='single-car-info'><strong>Owner Phone Number: </strong>{formattedPhoneNumber}</p>
            </div>
            <img src={isFavorited ? pinkHeart : heart} id='favorite-listing-img' onClick={handleFavoriteClick}/>
          </div>
          {
            listing.owner && listing.owner.id !== activeUserIdRef.current && (
              <div id='contact-seller-container' className='translucent'>
                <h3>Contact Seller</h3>
                <div id='messages'>
                  {
                    conversationHistory.map(message => {
                      return <p key={message.id}><strong>{message.senderId === listing.owner.id ? listing.ownerName : 'You'}:</strong> {message.content}</p>
                    })
                  }
                </div>
                <div id='reply-box'>
                  <textarea id='reply-input' className='translucent' placeholder={'Reply:'} rows={3} value={messageToSend} onChange={(e) => setMessageToSend(e.target.value)}></textarea>
                  <button id='reply-send-button' className='translucent' onClick={handleMessageSend}>Send</button>
                </div>
              </div>
            )
          }
          {
            listing.owner.id === activeUserIdRef.current && (
              <SellerInbox listingId={listing.id} />
            )
          }
        </div>
      </div>
    </div>
  )
}

export default SingleCarPage