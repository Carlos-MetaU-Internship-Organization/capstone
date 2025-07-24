import './../css/SellerInbox.css'
import close from './../../assets/close.png'
import { useState, useEffect } from 'react'
import { getBuyersAndInfo, getConversationHistory, sendMessage } from '../../utils/api'

function SellerInbox({ listingId }) {
  
  const [buyersAndInfo, setBuyersAndInfo] = useState([])
  const [selectedBuyer, setSelectedBuyer] = useState(null)
  const [conversationHistory, setConversationHistory] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [inboxDisplay, setInboxDisplay] = useState('flex')
  const [messageToSend, setMessageToSend] = useState('')

  useEffect(() => {  
    const fetchBuyers = async () => {
      const { buyersAndInfo } = await getBuyersAndInfo(listingId)
      if (buyersAndInfo.length === 0) {
        setInboxDisplay('none')
      }
      setBuyersAndInfo(buyersAndInfo);
    }
    fetchBuyers();
  }, [listingId])

  const openModal = async (buyerData) => {
    // get Messages between Buyer and Seller
    const fetchConversation = async () => {
      const { conversationHistory } = await getConversationHistory(listingId, buyerData.id);
      setConversationHistory(conversationHistory);
      setSelectedBuyer(buyerData);
      setShowModal(true);
    }
    fetchConversation()
  }

  // Close modal when click is registered outside of it
  const handleClickOutside = (event) => {
    if (event.target.id === 'modal-overlay') {
      closeModal();
    }
  };

  // Close modal when 'X' icon is clicked
  const handleClickClose = (event) => {
    event.stopPropagation();
    closeModal();
  };

  const closeModal = async () => {
    setShowModal(false)
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate())
    const hours = String(date.getHours())
    const minutes = String(date.getMinutes()).padStart(2, '0')

    const AMorPM = hours < 12 ? 'am' : 'pm'
    return `${month}/${day}, ${hours % 12 || 12}:${minutes}${AMorPM}`
  }

  const handleMessageSend = async () => {
    if (!messageToSend) return;

    const messageInfo = {
      receiverId: selectedBuyer.id,
      content: messageToSend,
      listingId
    }

    try {
      const { msg } = await sendMessage(messageInfo);
      setConversationHistory(prev => [...prev, msg]);
      setMessageToSend('');
    } catch (error) {
      // TODO: message component error
    }
  }

  return (
    <div className='seller-inbox translucent' style={{ display: inboxDisplay }}>
      <h3>Inbox</h3>
      <div id='buyers'>
        {
          buyersAndInfo.map(buyerData => (
            <div className='buyer-data translucent pointer' onClick={() => openModal(buyerData)}>
              <button className='buyer-name-button translucent '>{buyerData.name}</button>
              <div className='preview'>{buyerData.content}</div>
            </div>

          ))
        }
      </div>

      {
        showModal && (
          <div id='modal-overlay' onClick={handleClickOutside}>
            <div id='modal-content'>
              <img src={close} alt="Close Button" height='15px' id='close-button' className='pointer' onClick={handleClickClose}/>
              <h3 id='conversation-label'>Conversation with {selectedBuyer.name}</h3>
              <div className='messages'>
                {
                  conversationHistory.map(message => (
                    <div className='message'>
                        <p><strong>{message.senderId === selectedBuyer.id ? selectedBuyer.name : 'You'}: </strong>{message.content}</p>
                        <p className='message-date'>{formatDate(message.createdAt)}</p>
                    </div>
                  ))
                }
              </div>
              <textarea id='reply-input' className='translucent' placeholder={'Reply:'} rows={3} value={messageToSend} onChange={(e) => setMessageToSend(e.target.value)}></textarea>
              <button id='reply-send-button' className='translucent' onClick={handleMessageSend}>Send</button>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default SellerInbox