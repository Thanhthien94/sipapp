import { useState, useEffect } from 'react'
import { useSip } from '../context/SipContext'

const Dialer = () => {
  const { makeCall, answerCall, rejectCall, endCall, callStatus, incomingCall } = useSip()

  const [number, setNumber] = useState('')

  const handleCall = () => {
    if (number.trim()) {
      // Kiểm tra xem đã có định dạng SIP URI chưa
      const target = number.includes('sip:') ? number : `sip:${number}`

      makeCall(target)
    }
  }

  const handleKeypadClick = (digit) => {
    setNumber((prev) => prev + digit)
  }

  const handleClear = () => {
    setNumber('')
  }

  const renderDialPad = () => {
    const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

    return (
      <div className="grid grid-cols-3 gap-2 mb-4">
        {buttons.map((btn) => (
          <button key={btn} className="dialpad-btn" onClick={() => handleKeypadClick(btn)}>
            {btn}
          </button>
        ))}
      </div>
    )
  }

  const renderIncomingCall = () => {
    if (!incomingCall) return null

    return (
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold text-primary">Cuộc gọi đến</h3>
        <p className="text-lg">Từ: {incomingCall.caller}</p>
        <div className="flex space-x-4 justify-center">
          <button className="btn btn-success" onClick={answerCall}>
            Trả lời
          </button>
          <button className="btn btn-danger" onClick={rejectCall}>
            Từ chối
          </button>
        </div>
      </div>
    )
  }

  const renderCallControls = () => {
    if (callStatus === 'idle') {
      return (
        <>
          <div className="flex mb-4">
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Nhập số điện thoại hoặc SIP URI"
              className="input rounded-r-none flex-1"
            />
            <button
              className="px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 text-xl font-bold hover:bg-gray-200"
              onClick={handleClear}
            >
              ×
            </button>
          </div>
          {renderDialPad()}
          <button
            className={`w-full btn btn-success ${!number.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleCall}
            disabled={!number.trim()}
          >
            Gọi
          </button>
        </>
      )
    } else {
      return (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-primary">
            {callStatus === 'calling'
              ? 'Đang gọi...'
              : callStatus === 'ringing'
                ? 'Đang đổ chuông...'
                : 'Đang trong cuộc gọi'}
          </h3>
          <p className="text-2xl">{number}</p>
          <div className="text-lg text-gray-600 my-4">
            {callStatus === 'ongoing' && <CallTimer />}
          </div>
          <button className="btn btn-danger rounded-full px-6" onClick={endCall}>
            Kết thúc
          </button>
        </div>
      )
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      {callStatus === 'ringing' && incomingCall ? renderIncomingCall() : renderCallControls()}
    </div>
  )
}

// Component đồng hồ đếm thời gian cuộc gọi
const CallTimer = () => {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = () => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return <div>{formatTime()}</div>
}

export default Dialer
