import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import AdminOverview from '../components/dashboard/AdminOverview'
import ProtectedLayout from '../components/layout/ProtectedLayout'
import { mockCourses } from '../data/mockCourses'
import { tajikistanCityGroups } from '../data/tajikistanLocations'
import { mockUsers } from '../data/mockUsers'
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

  const allUserHistories = mockUsers.map((user) => {
    const storageKey = `videocourses-try-history-${user.id}`
    const stored = parseStoredCollection(storageKey)

    if (Array.isArray(stored) && stored.length > 0) {
      return { user, history: stored }
    }

    return { user, history: defaultTryHistoryByUserId[user.id] || [] }
  })
  const allTryHistory = allUserHistories.flatMap(({ history }) => history)

  const successfulAttempts = allTryHistory.filter((entry) => entry.passed).length
  const adminStats = {
    users: mockUsers.length,
    tries: allTryHistory.length,
    certificates: allUserHistories.reduce((count, { history }) => {
      const uniquePassedCourses = new Set(
        history.filter((entry) => entry.passed).map((entry) => entry.courseId),
      )
      return count + uniquePassedCourses.size
    }, 0),
    successRate:
      allTryHistory.length > 0 ? Math.round((successfulAttempts / allTryHistory.length) * 100) : 0,
  }
  const genderMap = {
    male: copy.profile.genderMale,
    female: copy.profile.genderFemale,
  }
  const adminCourseRows = mockCourses.map((course) => {
    const attempts = allTryHistory.filter((entry) => entry.courseId === course.id)
    const passed = attempts.filter((entry) => entry.passed).length

    return {
      id: course.id,
      title: course.title[language],
      tries: attempts.length,
      passed,
      successRate: attempts.length > 0 ? Math.round((passed / attempts.length) * 100) : 0,
    }
  })
  const adminUserRows = allUserHistories.map(({ user, history }) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    birthday: user.birthday,
    gender: genderMap[user.gender] || user.gender,
    city: user.city,
    testsTaken: history.length,
    certificates: new Set(
      history.filter((entry) => entry.passed).map((entry) => entry.courseId),
    ).size,
  }))
  const adminManageUsers = mockUsers.map((user) => ({
    id: user.id,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    registerDate: user.registerDate || '01.04.2026',
    phone: user.phone,
    birthday: new Date(`${user.birthday}T00:00:00`).toLocaleDateString(
      language === 'tj' ? 'tg-TJ' : 'ru-RU',
    ),
    birthdayRaw: user.birthday,
    gender: user.gender,
    city: user.city,
    cityId:
      tajikistanCityGroups
        .flatMap((group) => group.cities)
        .find((city) => city.label[language] === user.city || city.label.ru === user.city)?.id ||
      'dushanbe',
  }))
  const adminManageCourses = mockCourses.map((course) => ({
    id: course.id,
    title: course.title,
    descriptionText: course.descriptionText,
    videoId: course.videoId,
    createdBy: 'Малика Раҳимова',
    test: { ...course.test },
    testItems: course.testItems.map((item) => ({
      ...item,
      question: { ...item.question },
      options: {
        ru: [...item.options.ru],
        tj: [...item.options.tj],
      },
    })),
  }))
  const adminResultRows = [...allUserHistories]
    .flatMap(({ user, history }) =>
      history.map((entry) => {
        const course = mockCourses.find((item) => item.id === entry.courseId)

        return {
          id: entry.id,
          userName: user.name,
          courseTitle: course?.title[language] || entry.courseId,
          points: `${entry.correctAnswers}/${entry.totalQuestions}`,
          passed: entry.passed,
          date: entry.attemptedDate,
        }
      }),
    )
    .sort((left, right) => {
      const leftValue = Number.parseInt(left.date.split('.').reverse().join(''), 10) || 0
      const rightValue = Number.parseInt(right.date.split('.').reverse().join(''), 10) || 0

      return rightValue - leftValue
    })

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

  const handleExportAdminStats = () => {
    const workbook = XLSX.utils.book_new()

    const statsSheet = XLSX.utils.json_to_sheet([
      { metric: copy.dashboard.admin.stats.users, value: adminStats.users },
      { metric: copy.dashboard.admin.stats.tries, value: adminStats.tries },
      { metric: copy.dashboard.admin.stats.certificates, value: adminStats.certificates },
      { metric: copy.dashboard.admin.stats.successRate, value: `${adminStats.successRate}%` },
    ])

    const courseStatsSheet = XLSX.utils.json_to_sheet(
      adminCourseRows.map((course) => ({
        [copy.dashboard.admin.tables.courses.columns.course]: course.title,
        [copy.dashboard.admin.tables.courses.columns.tries]: course.tries,
        [copy.dashboard.admin.tables.courses.columns.passed]: course.passed,
        [copy.dashboard.admin.tables.courses.columns.successful]: `${course.successRate}%`,
      })),
    )

    const usersSheet = XLSX.utils.json_to_sheet(
      adminUserRows.map((user) => ({
        [copy.dashboard.admin.tables.users.columns.fio]: user.name,
        [copy.dashboard.admin.tables.users.columns.email]: user.email,
        [copy.dashboard.admin.tables.users.columns.phone]: user.phone,
        [copy.dashboard.admin.tables.users.columns.birthDate]: user.birthday,
        [copy.dashboard.admin.tables.users.columns.gender]: user.gender,
        [copy.dashboard.admin.tables.users.columns.city]: user.city,
        [copy.dashboard.admin.tables.users.columns.testsTaken]: user.testsTaken,
        [copy.dashboard.admin.tables.users.columns.certificates]: user.certificates,
      })),
    )

    const resultsSheet = XLSX.utils.json_to_sheet(
      adminResultRows.map((result) => ({
        [copy.dashboard.admin.tables.results.columns.user]: result.userName,
        [copy.dashboard.admin.tables.results.columns.course]: result.courseTitle,
        [copy.dashboard.admin.tables.results.columns.points]: result.points,
        [copy.dashboard.admin.tables.results.columns.status]: result.passed
          ? copy.dashboard.admin.tables.results.statusPassed
          : copy.dashboard.admin.tables.results.statusFailed,
        [copy.dashboard.admin.tables.results.columns.date]: result.date,
      })),
    )

    const managedUsersSheet = XLSX.utils.json_to_sheet(
      adminManageUsers.map((user) => ({
        [copy.dashboard.admin.tables.usersManagement.columns.fio]: user.name,
        [copy.dashboard.admin.tables.usersManagement.columns.email]: user.email,
        [copy.dashboard.admin.tables.usersManagement.columns.role]:
          user.role === 'admin' ? copy.header.roleAdmin : copy.header.roleUser,
        [copy.dashboard.admin.tables.usersManagement.columns.registerDate]: user.registerDate,
        [copy.dashboard.admin.tables.users.columns.phone]: user.phone,
        [copy.dashboard.admin.tables.users.columns.birthDate]: user.birthday,
        [copy.dashboard.admin.tables.users.columns.gender]:
          genderMap[user.gender] || user.gender,
        [copy.dashboard.admin.tables.users.columns.city]: user.city,
      })),
    )

    const managedCoursesSheet = XLSX.utils.json_to_sheet(
      adminManageCourses.map((course) => ({
        ID: course.id,
        [copy.dashboard.admin.tables.contentManagement.titleRu]: course.title.ru,
        [copy.dashboard.admin.tables.contentManagement.titleTj]: course.title.tj,
        [copy.dashboard.admin.tables.contentManagement.descriptionRu]: course.descriptionText.ru,
        [copy.dashboard.admin.tables.contentManagement.descriptionTj]: course.descriptionText.tj,
        [copy.dashboard.admin.tables.contentManagement.videoUrl]: `https://www.youtube.com/watch?v=${course.videoId}`,
        [copy.dashboard.admin.tables.contentManagement.createdBy]:
          course.createdBy || 'Малика Раҳимова',
        [copy.dashboard.admin.tables.contentManagement.questionsTitle]: course.testItems.length,
        [copy.courseDetail.passingPoints]: course.test.passingPoints,
        [copy.courseDetail.maxTries]: course.test.maxTries,
      })),
    )

    const questionBankSheet = XLSX.utils.json_to_sheet(
      adminManageCourses.flatMap((course) =>
        course.testItems.map((question, index) => ({
          courseId: course.id,
          courseRu: course.title.ru,
          courseTj: course.title.tj,
          [copy.dashboard.admin.tables.contentManagement.columns.number]: index + 1,
          [copy.dashboard.admin.tables.contentManagement.questionRu]: question.question.ru,
          [copy.dashboard.admin.tables.contentManagement.questionTj]: question.question.tj,
          [`${copy.dashboard.admin.tables.contentManagement.optionRu} 1`]: question.options.ru[0],
          [`${copy.dashboard.admin.tables.contentManagement.optionRu} 2`]: question.options.ru[1],
          [`${copy.dashboard.admin.tables.contentManagement.optionRu} 3`]: question.options.ru[2],
          [`${copy.dashboard.admin.tables.contentManagement.optionTj} 1`]: question.options.tj[0],
          [`${copy.dashboard.admin.tables.contentManagement.optionTj} 2`]: question.options.tj[1],
          [`${copy.dashboard.admin.tables.contentManagement.optionTj} 3`]: question.options.tj[2],
          [copy.dashboard.admin.tables.contentManagement.columns.correctOption]:
            question.correctOption + 1,
        })),
      ),
    )

    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Stats')
    XLSX.utils.book_append_sheet(workbook, courseStatsSheet, 'Course Stats')
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Users')
    XLSX.utils.book_append_sheet(workbook, resultsSheet, 'Results')
    XLSX.utils.book_append_sheet(workbook, managedUsersSheet, 'Users Mgmt')
    XLSX.utils.book_append_sheet(workbook, managedCoursesSheet, 'Courses Mgmt')
    XLSX.utils.book_append_sheet(workbook, questionBankSheet, 'Question Bank')

    XLSX.writeFile(workbook, 'admin-export.xlsx')
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
    content = (
      <AdminOverview
        copy={copy}
        language={language}
        stats={adminStats}
        data={{
          courses: adminCourseRows,
          users: adminUserRows,
          results: adminResultRows,
          manageUsers: adminManageUsers,
          manageCourses: adminManageCourses,
        }}
        onExport={handleExportAdminStats}
      />
    )
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
        onGoHome={handleLogoClick}
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
        onGoHome={handleLogoClick}
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
        onGoHome={handleLogoClick}
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
      onGoHome={handleLogoClick}
      onOpenProfile={handleOpenProfile}
    >
      {content}
    </ProtectedLayout>
  )
}

export default DashboardPage
