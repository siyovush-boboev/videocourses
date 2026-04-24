import { useState } from 'react'
import useAuth from '../../hooks/useAuth'
import { translations } from '../../data/translations'
import AuthPage from '../../pages/AuthPage'
import DashboardPage from '../../pages/DashboardPage'

function AppContent() {
  const [language, setLanguage] = useState('ru')
  const { isReady, session } = useAuth()
  const copy = translations[language]

  if (!isReady) {
    return null
  }

  if (!session) {
    return (
      <AuthPage
        language={language}
        setLanguage={setLanguage}
        copy={copy}
      />
    )
  }

  return (
    <DashboardPage
      language={language}
      setLanguage={setLanguage}
      copy={copy}
      session={session}
    />
  )
}

export default AppContent
