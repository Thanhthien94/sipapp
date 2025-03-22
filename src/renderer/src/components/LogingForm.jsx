import { useState } from 'react'
import { useSip } from '../context/SipContext'

const LoginForm = () => {
  const { connect, isRegistered, isConnected, callError } = useSip()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    domain: '',
    server: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Tạo SIP URI từ tên người dùng và tên miền
    const uri = `sip:${formData.username}@${formData.domain}`

    // Kết nối đến server SIP
    connect({
      uri,
      password: formData.password,
      server: formData.server,
      onRegistered: () => {
        console.log('Đăng ký SIP thành công')
        setIsLoading(false)
      }
    })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Đăng nhập SIP</h2>

      {callError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">Lỗi: {callError}</div>
      )}

      {isRegistered ? (
        <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-center">
          Đã đăng nhập thành công!
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="form-label">
              Tên người dùng:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Mật khẩu:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="domain" className="form-label">
              Tên miền SIP:
            </label>
            <input
              type="text"
              id="domain"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              placeholder="example.com"
              className="input"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="server" className="form-label">
              WebSocket Server:
            </label>
            <input
              type="text"
              id="server"
              name="server"
              value={formData.server}
              onChange={handleChange}
              placeholder="wss://example.com:8089/ws"
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full btn btn-primary ${isLoading || isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading || isConnected}
          >
            {isLoading ? 'Đang kết nối...' : 'Đăng nhập'}
          </button>
        </form>
      )}
    </div>
  )
}

export default LoginForm
