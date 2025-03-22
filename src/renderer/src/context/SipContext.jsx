import { createContext, useState, useEffect, useContext } from 'react'
import sipService from '../services/sipService'

// Tạo context
const SipContext = createContext()

// Hook tùy chỉnh để sử dụng context
export const useSip = () => useContext(SipContext)

// Provider Component
export const SipProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [callStatus, setCallStatus] = useState('idle') // idle, ringing, ongoing
  const [currentCall, setCurrentCall] = useState(null)
  const [incomingCall, setIncomingCall] = useState(null)
  const [callError, setCallError] = useState(null)

  // Kết nối đến server SIP
  const connect = (config) => {
    setIsConnected(false)
    setCallError(null)

    try {
      // Thiết lập các callbacks
      const sipConfig = {
        ...config,
        onRegistered: () => {
          setIsRegistered(true)
          setIsConnected(true)
          if (config.onRegistered) config.onRegistered()
        },
        onIncomingCall: (caller, invitation) => {
          setIncomingCall({ caller, invitation })
          setCallStatus('ringing')
          if (config.onIncomingCall) config.onIncomingCall(caller)
        },
        onCallEstablished: () => {
          setCallStatus('ongoing')
          if (config.onCallEstablished) config.onCallEstablished()
        },
        onCallEnded: () => {
          setCallStatus('idle')
          setCurrentCall(null)
          if (config.onCallEnded) config.onCallEnded()
        }
      }

      sipService.connect(sipConfig)
    } catch (error) {
      setCallError(error.message)
    }
  }

  // Ngắt kết nối
  const disconnect = () => {
    sipService.disconnect()
    setIsConnected(false)
    setIsRegistered(false)
    setCallStatus('idle')
    setCurrentCall(null)
    setIncomingCall(null)
  }

  // Thực hiện cuộc gọi
  const makeCall = (target) => {
    setCallError(null)

    if (!isRegistered) {
      setCallError('Chưa kết nối đến server SIP')
      return
    }

    setCallStatus('calling')

    sipService
      .makeCall(target)
      .then((call) => {
        setCurrentCall(call)
      })
      .catch((error) => {
        setCallError(error.message)
        setCallStatus('idle')
      })
  }

  // Trả lời cuộc gọi đến
  const answerCall = () => {
    if (incomingCall) {
      sipService.answerCall()
      setCurrentCall(incomingCall.invitation)
      setIncomingCall(null)
    }
  }

  // Từ chối cuộc gọi đến
  const rejectCall = () => {
    if (incomingCall && incomingCall.invitation) {
      incomingCall.invitation.reject()
      setIncomingCall(null)
      setCallStatus('idle')
    }
  }

  // Kết thúc cuộc gọi hiện tại
  const endCall = () => {
    sipService.endCall()
    setCallStatus('idle')
    setCurrentCall(null)
  }

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      sipService.disconnect()
    }
  }, [])

  // Giá trị được cung cấp cho context
  const value = {
    isConnected,
    isRegistered,
    callStatus,
    currentCall,
    incomingCall,
    callError,
    connect,
    disconnect,
    makeCall,
    answerCall,
    rejectCall,
    endCall
  }

  return <SipContext.Provider value={value}>{children}</SipContext.Provider>
}

export default SipContext
