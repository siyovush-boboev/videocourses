import { useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import usePathname from '../../hooks/usePathname'
import { translations } from '../../data/translations'
import PublicLayout from '../layout/PublicLayout'
import { mockCourses } from '../../data/mockCourses'
import AuthPage from '../../pages/AuthPage'
import CourseDetailPage from '../../pages/CourseDetailPage'
import CoursesPage from '../../pages/CoursesPage'
import DashboardPage from '../../pages/DashboardPage'

const POST_LOGIN_PATH_KEY = 'videocourses-post-login-path'

const getCourseIdFromPath = (pathname) => {
  const courseMatch = pathname.match(/^\/courses\/([^/]+)$/)
  return courseMatch ? courseMatch[1] : null
}

function AppContent() {
  const [language, setLanguage] = useState('ru')
  const { isReady, session } = useAuth()
  const { pathname, navigateTo } = usePathname()
  const copy = translations[language]
  const publicCourseId = getCourseIdFromPath(pathname)
  const selectedPublicCourse = publicCourseId
    ? mockCourses.find((course) => course.id === publicCourseId)
    : null

  useEffect(() => {
    if (!isReady) {
      return
    }

    const isPublicPath =
      pathname === '/' || pathname === '/login' || Boolean(selectedPublicCourse)
    const isProtectedPath =
      pathname === '/admin' ||
      pathname === '/profile' ||
      /^\/courses\/[^/]+\/test$/.test(pathname) ||
      /^\/courses\/[^/]+\/test\/result$/.test(pathname) ||
      /^\/courses\/[^/]+\/certificate\/[^/]+$/.test(pathname)

    if (!session && isProtectedPath) {
      window.sessionStorage.setItem(POST_LOGIN_PATH_KEY, pathname)
      navigateTo('/login', { replace: true })
      return
    }

    if (session && pathname === '/login') {
      const pendingPath = window.sessionStorage.getItem(POST_LOGIN_PATH_KEY)
      window.sessionStorage.removeItem(POST_LOGIN_PATH_KEY)
      navigateTo(pendingPath || '/', { replace: true })
      return
    }

    if (session?.role !== 'admin' && pathname === '/admin') {
      navigateTo('/', { replace: true })
      return
    }

    if (!session && !isPublicPath && pathname !== '/login') {
      navigateTo('/', { replace: true })
      return
    }

    const isAllowedSignedInPath =
      pathname === '/' ||
      pathname === '/admin' ||
      pathname === '/profile' ||
      pathname === '/login' ||
      /^\/courses\/[^/]+$/.test(pathname) ||
      /^\/courses\/[^/]+\/test$/.test(pathname) ||
      /^\/courses\/[^/]+\/test\/result$/.test(pathname) ||
      /^\/courses\/[^/]+\/certificate\/[^/]+$/.test(pathname)

    if (session && !isAllowedSignedInPath) {
      navigateTo('/', { replace: true })
    }
  }, [isReady, navigateTo, pathname, selectedPublicCourse, session])

  if (!isReady) {
    return null
  }

  if (!session) {
    if (pathname === '/') {
      return (
        <PublicLayout
          copy={copy}
          language={language}
          setLanguage={setLanguage}
          pathname={pathname}
          onLoginClick={() => navigateTo('/login')}
          onLogoClick={() => navigateTo('/')}
        >
          <CoursesPage
            copy={copy}
            language={language}
            onOpenCourse={(id) => navigateTo(`/courses/${id}`)}
          />
        </PublicLayout>
      )
    }

    if (selectedPublicCourse) {
      return (
        <PublicLayout
          copy={copy}
          language={language}
          setLanguage={setLanguage}
          pathname={pathname}
          onLoginClick={() => navigateTo('/login')}
          onLogoClick={() => navigateTo('/')}
        >
          <CourseDetailPage
            copy={copy}
            course={selectedPublicCourse}
            language={language}
            onOpenTest={(id) => navigateTo(`/courses/${id}/test`)}
          />
        </PublicLayout>
      )
    }

    return (
      <AuthPage
        language={language}
        setLanguage={setLanguage}
        copy={copy}
        pathname={pathname}
        onLoginClick={() => navigateTo('/login')}
        onLogoClick={() => navigateTo('/')}
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
