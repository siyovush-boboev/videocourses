import { useEffect, useState } from 'react'
import AdminOverview from '../components/dashboard/AdminOverview'
import ProtectedLayout from '../components/layout/ProtectedLayout'
import { mockCourses } from '../data/mockCourses'
import CertificatePage from './CertificatePage'
import CourseDetailPage from './CourseDetailPage'
import CoursesPage from './CoursesPage'
import ProfilePage from './ProfilePage'
import TestPage from './TestPage'
import TestResultPage from './TestResultPage'

const buildCertificateNumber = (courseId, sessionId) => {
  const compactCourseId = courseId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()
  const compactSessionId = sessionId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()
  return `ARV-${compactSessionId}-${compactCourseId}`
}

const defaultTryHistoryByUserId = {
  'user-1': [
    {
      id: 'user-1-bank-products-1',
      courseId: 'bank-products',
      correctAnswers: 2,
      totalQuestions: 3,
      score: 67,
      passed: true,
      attemptedDate: '18.04.2026',
      tryNumber: 1,
    },
    {
      id: 'user-1-customer-service-1',
      courseId: 'customer-service',
      correctAnswers: 1,
      totalQuestions: 3,
      score: 33,
      passed: false,
      attemptedDate: '20.04.2026',
      tryNumber: 1,
    },
    {
      id: 'user-1-customer-service-2',
      courseId: 'customer-service',
      correctAnswers: 2,
      totalQuestions: 3,
      score: 67,
      passed: true,
      attemptedDate: '22.04.2026',
      tryNumber: 2,
    },
    {
      id: 'user-1-compliance-1',
      courseId: 'compliance',
      correctAnswers: 2,
      totalQuestions: 3,
      score: 67,
      passed: false,
      attemptedDate: '25.04.2026',
      tryNumber: 1,
    },
  ],
  'admin-1': [
    {
      id: 'admin-1-cash-discipline-1',
      courseId: 'cash-discipline',
      correctAnswers: 2,
      totalQuestions: 3,
      score: 67,
      passed: true,
      attemptedDate: '17.04.2026',
      tryNumber: 1,
    },
  ],
}

function buildInitialTestResults(tryHistory) {
  return tryHistory.reduce((accumulator, entry) => {
    const previous = accumulator[entry.courseId]

    if (!previous || entry.tryNumber > previous.tryNumber) {
      accumulator[entry.courseId] = {
        score: entry.score,
        correctAnswers: entry.correctAnswers,
        totalQuestions: entry.totalQuestions,
        tryNumber: entry.tryNumber,
      }
    }

    return accumulator
  }, {})
}

function parseStoredCollection(storageKey) {
  const stored = window.localStorage.getItem(storageKey)

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

function DashboardPage({ copy, language, setLanguage, session, pathname, navigateTo }) {
  const testResultsStorageKey = `videocourses-test-results-${session.id}`
  const tryHistoryStorageKey = `videocourses-try-history-${session.id}`
  const defaultTryHistory = defaultTryHistoryByUserId[session.id] || []
  const [testResults, setTestResults] = useState(() => {
    const stored = parseStoredCollection(testResultsStorageKey)
    if (stored && Object.keys(stored).length > 0) {
      return stored
    }

    return buildInitialTestResults(defaultTryHistory)
  })
  const [tryHistory, setTryHistory] = useState(() => {
    const stored = parseStoredCollection(tryHistoryStorageKey)
    if (Array.isArray(stored) && stored.length > 0) {
      return stored
    }

    return defaultTryHistory
  })

  const certificateMatch = pathname.match(/^\/courses\/([^/]+)\/certificate\/([^/]+)$/)
  const testResultMatch = pathname.match(/^\/courses\/([^/]+)\/test\/result$/)
  const testMatch = pathname.match(/^\/courses\/([^/]+)\/test$/)
  const courseMatch = pathname.match(/^\/courses\/([^/]+)$/)
  const isCertificatePath = Boolean(certificateMatch)
  const isTestResultPath = Boolean(testResultMatch)
  const isTestPath = Boolean(testMatch)
  const isProfilePath = pathname === '/profile'
  const courseId =
    certificateMatch?.[1] || testResultMatch?.[1] || testMatch?.[1] || courseMatch?.[1] || null
  const selectedCourse = courseId
    ? mockCourses.find((course) => course.id === courseId)
    : null
  const selectedResult = courseId ? testResults[courseId] : null
  const selectedCertificateNumber = certificateMatch?.[2] || null
  const expectedCertificateNumber =
    selectedCourse && session
      ? buildCertificateNumber(selectedCourse.id, session.id)
      : null

  const certificateEntries = mockCourses
    .map((course) => {
      const latestPassedTry = [...tryHistory]
        .reverse()
        .find((entry) => entry.courseId === course.id && entry.passed)

      if (!latestPassedTry) {
        return null
      }

      return {
        course,
        issuedDate: latestPassedTry.attemptedDate,
        certificateNumber: buildCertificateNumber(course.id, session.id),
      }
    })
    .filter(Boolean)

  const tryEntries = [...tryHistory]
    .reverse()
    .map((entry) => ({
      ...entry,
      course: mockCourses.find((course) => course.id === entry.courseId),
    }))
    .filter((entry) => entry.course)

  const canViewCertificate =
    selectedCourse &&
    selectedCertificateNumber === expectedCertificateNumber &&
    certificateEntries.some((entry) => entry.course.id === selectedCourse.id)

  useEffect(() => {
    window.localStorage.setItem(testResultsStorageKey, JSON.stringify(testResults))
  }, [testResults, testResultsStorageKey])

  useEffect(() => {
    window.localStorage.setItem(tryHistoryStorageKey, JSON.stringify(tryHistory))
  }, [tryHistory, tryHistoryStorageKey])

  const handleLogoClick = () => {
    navigateTo('/')
  }

  const handleAdminPanelClick = () => {
    if (session.role === 'admin') {
      navigateTo('/admin')
    }
  }

  const handleOpenProfile = () => {
    navigateTo('/profile')
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
    navigateTo(`/courses/${id}/certificate/${buildCertificateNumber(id, session.id)}`)
  }

  const handleTestComplete = (courseIdToSave, result) => {
    const courseForAttempt = mockCourses.find((course) => course.id === courseIdToSave)
    const existingAttemptsCount = tryHistory.filter(
      (entry) => entry.courseId === courseIdToSave,
    ).length
    const attemptedDate = new Date().toLocaleDateString(
      language === 'ru' ? 'ru-RU' : 'tg-TJ',
    )
    const nextTryEntry = {
      id: `${courseIdToSave}-${Date.now()}`,
      courseId: courseIdToSave,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      score: result.score,
      passed: result.correctAnswers >= courseForAttempt.test.passingPoints,
      attemptedDate,
      tryNumber: existingAttemptsCount + 1,
    }

    setTestResults((current) => ({
      ...current,
      [courseIdToSave]: result,
    }))
    setTryHistory((current) => [...current, nextTryEntry])
    navigateTo(`/courses/${courseIdToSave}/test/result`)
  }

  let content = <CoursesPage copy={copy} language={language} onOpenCourse={handleOpenCourse} />

  if (pathname === '/admin') {
    content = <AdminOverview copy={copy} />
  } else if (isProfilePath) {
    content = (
      <ProfilePage
        copy={copy}
        language={language}
        session={session}
        certificateEntries={certificateEntries}
        tryEntries={tryEntries}
        onOpenCertificate={handleOpenCertificate}
        onGoHome={handleLogoClick}
      />
    )
  } else if (selectedCourse && isCertificatePath && canViewCertificate) {
    content = (
      <CertificatePage
        copy={{ ...copy, languageKey: language }}
        course={selectedCourse}
        session={session}
        certificateNumber={expectedCertificateNumber}
        issuedDate={
          certificateEntries.find((entry) => entry.course.id === selectedCourse.id)?.issuedDate ||
          new Date().toLocaleDateString(language === 'ru' ? 'ru-RU' : 'tg-TJ')
        }
        verifyUrl={window.location.href}
        onOpenCourse={handleOpenCourse}
        onGoHome={handleLogoClick}
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
      onOpenProfile={handleOpenProfile}
    >
      {content}
    </ProtectedLayout>
  )
}

export default DashboardPage
