import { useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import usePathname from '../../hooks/usePathname'
import { translations } from '../../data/translations'
import AuthPage from '../../pages/AuthPage'
import DashboardPage from '../../pages/DashboardPage'

function AppContent() {
  const [language, setLanguage] = useState('ru')
  const { isReady, session } = useAuth()
  const { pathname, navigateTo } = usePathname()
  const copy = translations[language]

  useEffect(() => {
    if (!isReady) {
      return
    }

    if (!session && pathname !== '/login') {
      navigateTo('/login', { replace: true })
      return
    }

    if (session && pathname === '/login') {
      navigateTo('/', { replace: true })
      return
    }

    if (session?.role !== 'admin' && pathname === '/admin') {
      navigateTo('/', { replace: true })
      return
    }

    const isAllowedProtectedPath =
      pathname === '/' ||
      pathname === '/admin' ||
      pathname === '/login' ||
      pathname.startsWith('/courses/')

    if (session && !isAllowedProtectedPath) {
      navigateTo('/', { replace: true })
    }
  }, [isReady, navigateTo, pathname, session])

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
      pathname={pathname === '/login' ? '/' : pathname}
      navigateTo={navigateTo}
    />
  )
}

export default AppContent
