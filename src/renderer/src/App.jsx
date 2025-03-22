import { SipProvider, useSip } from './context/SipContext'
import LoginForm from '@components/LoginForm'
import Dialer from '@components/Dialer'

// Component nội dung chính
const MainContent = () => {
  const { isRegistered } = useSip()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-white p-4 shadow-md">
        <h1 className="text-xl font-bold text-center">SIP Call App</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        {isRegistered ? <Dialer /> : <LoginForm />}
      </main>

      <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600 border-t border-gray-200">
        <p>SIP Call App &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

// Component App chính bao ngoài Provider
function App() {
  return (
    <SipProvider>
      <MainContent />
    </SipProvider>
  )
}

export default App
