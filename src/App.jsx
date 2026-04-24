import { AuthProvider } from './context/AuthContext'
import AppContent from './components/app/AppContent'

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
