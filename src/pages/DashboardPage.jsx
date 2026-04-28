import { useState } from 'react'
import AdminOverview from '../components/dashboard/AdminOverview'
import ProtectedLayout from '../components/layout/ProtectedLayout'
import { mockCourses } from '../data/mockCourses'
import CertificatePage from './CertificatePage'
import CourseDetailPage from './CourseDetailPage'
import CoursesPage from './CoursesPage'
import TestPage from './TestPage'
import TestResultPage from './TestResultPage'

const buildCertificateNumber = (courseId, sessionId) => {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const compactCourseId = courseId.slice(0, 4).toUpperCase()
  const compactSessionId = sessionId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()
  return `ARV-${stamp}-${compactSessionId}-${compactCourseId}`
}

function DashboardPage({ copy, language, setLanguage, session, pathname, navigateTo }) {
  const [testResults, setTestResults] = useState({})
  const isCertificatePath =
    pathname.startsWith('/courses/') && pathname.endsWith('/certificate')
  const isTestResultPath =
    pathname.startsWith('/courses/') && pathname.endsWith('/test/result')
  const isTestPath =
    pathname.startsWith('/courses/') &&
    pathname.endsWith('/test') &&
    !isTestResultPath &&
    !isCertificatePath
  const courseId = isCertificatePath
    ? pathname.replace('/courses/', '').replace('/certificate', '')
    : isTestResultPath
    ? pathname.replace('/courses/', '').replace('/test/result', '')
    : isTestPath
      ? pathname.replace('/courses/', '').replace('/test', '')
      : pathname.startsWith('/courses/')
        ? pathname.replace('/courses/', '')
        : null
  const selectedCourse = courseId
    ? mockCourses.find((course) => course.id === courseId)
    : null
  const selectedResult = courseId ? testResults[courseId] : null

  const handleLogoClick = () => {
    navigateTo('/')
  }

  const handleAdminPanelClick = () => {
    if (session.role === 'admin') {
      navigateTo('/admin')
    }
  }

  const handleOpenCourse = (id) => {
    navigateTo(`/courses/${id}`)
  }

  const handleOpenTest = (id) => {
    setTestResults((current) => {
      if (!(id in current)) {
        return current
      }

      const next = { ...current }
      delete next[id]
      return next
    })
    navigateTo(`/courses/${id}/test`)
  }

  const handleOpenCertificate = (id) => {
    navigateTo(`/courses/${id}/certificate`)
  }

  const handleTestComplete = (courseIdToSave, result) => {
    setTestResults((current) => ({
      ...current,
      [courseIdToSave]: result,
    }))
    navigateTo(`/courses/${courseIdToSave}/test/result`)
  }

  let content = <CoursesPage copy={copy} language={language} onOpenCourse={handleOpenCourse} />
  const canViewCertificate =
    selectedCourse &&
    selectedResult &&
    selectedResult.score >= selectedCourse.test.passingPoints

  if (pathname === '/admin') {
    content = <AdminOverview copy={copy} />
  } else if (selectedCourse && isCertificatePath && canViewCertificate) {
    content = (
      <CertificatePage
        copy={{ ...copy, languageKey: language }}
        course={selectedCourse}
        session={session}
        certificateNumber={buildCertificateNumber(selectedCourse.id, session.id)}
        issuedDate={new Date().toLocaleDateString(
          language === 'ru' ? 'ru-RU' : 'tg-TJ',
        )}
        verifyUrl={window.location.href}
        onOpenCourse={handleOpenCourse}
      />
    )
  } else if (selectedCourse && isCertificatePath) {
    content = (
      <CourseDetailPage
        copy={copy}
        course={selectedCourse}
        language={language}
        onOpenTest={handleOpenTest}
      />
    )
  } else if (selectedCourse && isTestResultPath && selectedResult) {
    content = (
      <TestResultPage
        copy={copy}
        course={selectedCourse}
        language={language}
        result={selectedResult}
        onRetake={() => handleOpenTest(selectedCourse.id)}
        onGoHome={handleLogoClick}
        onViewCertificate={() => handleOpenCertificate(selectedCourse.id)}
      />
    )
  } else if (selectedCourse && isTestResultPath) {
    content = (
      <CourseDetailPage
        copy={copy}
        course={selectedCourse}
        language={language}
        onOpenTest={handleOpenTest}
      />
    )
  } else if (selectedCourse && isTestPath) {
    content = (
      <TestPage
        copy={copy}
        course={selectedCourse}
        language={language}
        onComplete={(result) => handleTestComplete(selectedCourse.id, result)}
      />
    )
  } else if (selectedCourse) {
    content = (
      <CourseDetailPage
        copy={copy}
        course={selectedCourse}
        language={language}
        onOpenTest={handleOpenTest}
      />
    )
  }

  return (
    <ProtectedLayout
      copy={copy}
      language={language}
      setLanguage={setLanguage}
      session={session}
      pathname={pathname}
      onLogoClick={handleLogoClick}
      onAdminPanelClick={handleAdminPanelClick}
    >
      {content}
    </ProtectedLayout>
  )
}

export default DashboardPage
