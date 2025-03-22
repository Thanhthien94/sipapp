import { Web, UserAgent, Registerer } from 'sip.js'

class SipService {
  constructor() {
    this.userAgent = null
    this.registerer = null
    this.session = null
    this.callOptions = {
      media: {
        constraints: {
          audio: true,
          video: false
        },
        remote: {
          audio: document.createElement('audio')
        }
      }
    }

    // Khởi tạo audio
    this.callOptions.media.remote.audio.autoplay = true
  }

  /**
   * Kết nối đến server SIP
   * @param {Object} config Thông tin cấu hình
   * @param {string} config.uri Uri của người dùng (ví dụ: "sip:user@domain.com")
   * @param {string} config.password Mật khẩu
   * @param {string} config.server Địa chỉ server SIP WebSocket (ví dụ: "wss://sip.domain.com:8089/ws")
   * @param {Function} config.onRegistered Callback khi đăng ký thành công
   * @param {Function} config.onIncomingCall Callback khi có cuộc gọi đến
   * @param {Function} config.onCallEstablished Callback khi cuộc gọi được thiết lập
   * @param {Function} config.onCallEnded Callback khi cuộc gọi kết thúc
   */
  connect(config) {
    try {
      // Tạo User Agent
      const userAgentOptions = {
        uri: UserAgent.makeURI(config.uri),
        authorizationUsername: config.uri.split(':')[1].split('@')[0],
        authorizationPassword: config.password,
        transportOptions: {
          server: config.server
        }
      }

      this.userAgent = new UserAgent(userAgentOptions)

      // Xử lý sự kiện cuộc gọi đến
      this.userAgent.delegate = {
        onInvite: (invitation) => {
          this.session = invitation

          // Thông báo cuộc gọi đến
          if (config.onIncomingCall) {
            const caller = invitation.remoteIdentity.uri.toString()
            config.onIncomingCall(caller, invitation)
          }

          // Xử lý khi cuộc gọi được thiết lập
          this.session.stateChange.addListener((state) => {
            if (state === SessionState.Established) {
              if (config.onCallEstablished) {
                config.onCallEstablished()
              }
            }
          })
        }
      }

      // Bắt đầu User Agent
      this.userAgent
        .start()
        .then(() => {
          // Đăng ký với server SIP
          this.registerer = new Registerer(this.userAgent)
          return this.registerer.register()
        })
        .then(() => {
          if (config.onRegistered) {
            config.onRegistered()
          }
        })
        .catch((error) => {
          console.error('SIP registration failed:', error)
        })
    } catch (error) {
      console.error('SIP connection error:', error)
    }
  }

  /**
   * Thực hiện cuộc gọi
   * @param {string} target Số điện thoại hoặc URI SIP để gọi
   * @returns {Promise} Promise
   */
  makeCall(target) {
    if (!this.userAgent) {
      return Promise.reject(new Error('User agent not initialized'))
    }

    try {
      const targetURI = UserAgent.makeURI(target)

      // Tạo phiên gọi mới
      this.session = new Web.Simple(this.userAgent)

      // Gọi
      return this.session.call(targetURI, this.callOptions).then((session) => {
        // Lưu session và thiết lập các bộ xử lý sự kiện
        this.setupSessionEventHandlers(session)
        return session
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Trả lời cuộc gọi đến
   */
  answerCall() {
    if (this.session) {
      this.session
        .accept(this.callOptions)
        .then((session) => {
          this.setupSessionEventHandlers(session)
        })
        .catch((error) => {
          console.error('Failed to answer call:', error)
        })
    }
  }

  /**
   * Kết thúc cuộc gọi hiện tại
   */
  endCall() {
    if (this.session) {
      this.session.bye()
      this.session = null
    }
  }

  /**
   * Thiết lập các xử lý sự kiện cho phiên gọi
   * @param {Session} session Phiên gọi
   */
  setupSessionEventHandlers(session) {
    session.stateChange.addListener((state) => {
      console.log('Call state changed to:', state)

      if (state === SessionState.Terminated) {
        this.session = null
        if (this.callOptions.onCallEnded) {
          this.callOptions.onCallEnded()
        }
      }
    })
  }

  /**
   * Ngắt kết nối khỏi server SIP
   */
  disconnect() {
    if (this.registerer) {
      this.registerer.unregister()
    }

    if (this.userAgent) {
      this.userAgent.stop()
    }

    this.userAgent = null
    this.registerer = null
    this.session = null
  }
}

export default new SipService()
