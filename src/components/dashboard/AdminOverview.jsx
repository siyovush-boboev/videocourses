import { useEffect, useMemo, useState } from 'react'
import CertificateBadgeIcon from '../icons/CertificateBadgeIcon'
import EditIcon from '../icons/EditIcon'
import ChecklistIcon from '../icons/ChecklistIcon'
import ExportIcon from '../icons/ExportIcon'
import EyeIcon from '../icons/EyeIcon'
import EyeOffIcon from '../icons/EyeOffIcon'
import PlusIcon from '../icons/PlusIcon'
import SuccessChartIcon from '../icons/SuccessChartIcon'
import TrashIcon from '../icons/TrashIcon'
import UserIcon from '../icons/UserIcon'
import VideoIcon from '../icons/VideoIcon'
import { tajikistanCityGroups } from '../../data/tajikistanLocations'

const tabs = ['courses', 'users', 'results', 'contentManagement', 'usersManagement']
const initialManagementForm = {
  firstName: '',
  lastName: '',
  email: '',
  gender: '',
  birthday: '',
  phone: '',
  cityRegion: '',
  password: '',
  confirmPassword: '',
  isAdmin: false,
}
const initialCourseForm = {
  titleRu: '',
  titleTj: '',
  descriptionRu: '',
  descriptionTj: '',
  videoUrl: '',
  passingPoints: '',
}
const initialQuestionForm = {
  questionRu: '',
  questionTj: '',
  optionsRu: ['', '', ''],
  optionsTj: ['', '', ''],
  correctOption: '0',
}

const extractYoutubeVideoId = (value) => {
  const trimmedValue = value.trim()

  if (!trimmedValue) return ''

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedValue)) {
    return trimmedValue
  }

  try {
    const url = new URL(trimmedValue)

    if (url.hostname.includes('youtu.be')) {
      const idFromPath = url.pathname.split('/').filter(Boolean)[0] || ''
      return /^[a-zA-Z0-9_-]{11}$/.test(idFromPath) ? idFromPath : ''
    }

    if (url.hostname.includes('youtube.com')) {
      const watchId = url.searchParams.get('v')
      if (watchId && /^[a-zA-Z0-9_-]{11}$/.test(watchId)) {
        return watchId
      }

      const pathParts = url.pathname.split('/').filter(Boolean)
      const embedIndex = pathParts.findIndex((part) => part === 'embed' || part === 'shorts')
      const idFromPath = embedIndex >= 0 ? pathParts[embedIndex + 1] : pathParts[pathParts.length - 1]
      return /^[a-zA-Z0-9_-]{11}$/.test(idFromPath || '') ? idFromPath : ''
    }
  } catch {
    return ''
  }

  return ''
}

function AdminOverview({ copy, language, stats, data, onExport }) {
  const [activeTab, setActiveTab] = useState('courses')
  const [searchValue, setSearchValue] = useState('')
  const [managedUsers, setManagedUsers] = useState(data.manageUsers)
  const [managementSearchValue, setManagementSearchValue] = useState('')
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [showManagementPasswords, setShowManagementPasswords] = useState(false)
  const [managementForm, setManagementForm] = useState(initialManagementForm)
  const [managementErrors, setManagementErrors] = useState({})
  const [managedCourses, setManagedCourses] = useState(data.manageCourses)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState(null)
  const [courseForm, setCourseForm] = useState(initialCourseForm)
  const [courseErrors, setCourseErrors] = useState({})
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [questionForm, setQuestionForm] = useState(initialQuestionForm)
  const [questionErrors, setQuestionErrors] = useState({})
  const [questionCourseId, setQuestionCourseId] = useState(null)
  const [editingQuestionId, setEditingQuestionId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const statItems = useMemo(
    () => [
      {
        key: 'users',
        icon: <UserIcon />,
        label: copy.dashboard.admin.stats.users,
        value: stats.users,
      },
      {
        key: 'tries',
        icon: <ChecklistIcon />,
        label: copy.dashboard.admin.stats.tries,
        value: stats.tries,
      },
      {
        key: 'certificates',
        icon: <CertificateBadgeIcon />,
        label: copy.dashboard.admin.stats.certificates,
        value: stats.certificates,
      },
      {
        key: 'successRate',
        icon: <SuccessChartIcon />,
        label: copy.dashboard.admin.stats.successRate,
        value: `${stats.successRate}%`,
      },
    ],
    [copy.dashboard.admin.stats, stats],
  )

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase()

    if (!normalizedQuery) {
      return data.users
    }

    return data.users.filter((user) =>
      [
        user.name,
        user.email,
        user.phone,
        user.city,
        user.gender,
        String(user.testsTaken),
        String(user.certificates),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [data.users, searchValue])

  const filteredManagedUsers = useMemo(() => {
    const normalizedQuery = managementSearchValue.trim().toLowerCase()

    if (!normalizedQuery) {
      return managedUsers
    }

    return managedUsers.filter((user) =>
      [user.name, user.email].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [managedUsers, managementSearchValue])

  const flattenedCities = useMemo(
    () =>
      tajikistanCityGroups.map((group) => ({
        label: group.label,
        options: group.cities.map((city) => ({
          id: city.id,
          label: city.label,
        })),
      })),
    [],
  )

  const sanitizePhoneInput = (value) => {
    let sanitized = value.replace(/[^\d+]/g, '')

    if (sanitized.includes('+')) {
      sanitized = `+${sanitized.replace(/\+/g, '')}`
    }

    if (sanitized.startsWith('+')) {
      return sanitized.slice(0, 13)
    }

    return sanitized.slice(0, 9)
  }

  const isValidTajikPhone = (value) => {
    if (value.startsWith('+')) {
      return /^\+992\d{9}$/.test(value)
    }

    return /^\d{9}$/.test(value)
  }

  const getAge = (birthday) => {
    const today = new Date()
    const birthDate = new Date(`${birthday}T00:00:00`)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1
    }

    return age
  }

  const resetManagementModal = () => {
    setManagementForm(initialManagementForm)
    setManagementErrors({})
    setEditingUserId(null)
    setShowManagementPasswords(false)
    setIsUserModalOpen(false)
  }

  const openAddUserModal = () => {
    setManagementForm(initialManagementForm)
    setManagementErrors({})
    setEditingUserId(null)
    setShowManagementPasswords(false)
    setIsUserModalOpen(true)
  }

  const openEditUserModal = (user) => {
    setManagementForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      birthday: user.birthdayRaw,
      phone: user.phone,
      cityRegion: user.cityId,
      password: '',
      confirmPassword: '',
      isAdmin: user.role === 'admin',
    })
    setManagementErrors({})
    setEditingUserId(user.id)
    setShowManagementPasswords(false)
    setIsUserModalOpen(true)
  }

  const validateManagementForm = () => {
    const nextErrors = {}

    if (!managementForm.firstName.trim()) nextErrors.firstName = copy.auth.validations.required
    if (!managementForm.lastName.trim()) nextErrors.lastName = copy.auth.validations.required

    if (!managementForm.email.trim()) {
      nextErrors.email = copy.auth.validations.required
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(managementForm.email.trim())) {
      nextErrors.email = copy.auth.validations.email
    }

    if (!managementForm.gender) nextErrors.gender = copy.auth.validations.required

    if (!managementForm.birthday) {
      nextErrors.birthday = copy.auth.validations.required
    } else if (
      Number.isNaN(Date.parse(managementForm.birthday)) ||
      managementForm.birthday > new Date().toISOString().slice(0, 10)
    ) {
      nextErrors.birthday = copy.auth.validations.birthday
    } else {
      const age = getAge(managementForm.birthday)
      if (age < 16) nextErrors.birthday = copy.auth.validations.birthdayMinAge
      if (age > 100) nextErrors.birthday = copy.auth.validations.birthdayMaxAge
    }

    if (!managementForm.phone.trim()) {
      nextErrors.phone = copy.auth.validations.required
    } else if (!isValidTajikPhone(managementForm.phone)) {
      nextErrors.phone = copy.auth.validations.phone
    }

    if (!managementForm.cityRegion) nextErrors.cityRegion = copy.auth.validations.required

    if (!editingUserId || managementForm.password || managementForm.confirmPassword) {
      if (!managementForm.password) {
        nextErrors.password = copy.auth.validations.password
      } else if (managementForm.password.length < 8) {
        nextErrors.password = copy.auth.validations.passwordLength
      } else if (!/[A-Z]/.test(managementForm.password)) {
        nextErrors.password = copy.auth.validations.passwordUpper
      } else if (!/[a-z]/.test(managementForm.password)) {
        nextErrors.password = copy.auth.validations.passwordLower
      } else if (!/\d/.test(managementForm.password)) {
        nextErrors.password = copy.auth.validations.passwordDigit
      } else if (/\s/.test(managementForm.password)) {
        nextErrors.password = copy.auth.validations.passwordSpaces
      } else if (!/[^\w\s]/.test(managementForm.password)) {
        nextErrors.password = copy.auth.validations.passwordSpecial
      }

      if (!managementForm.confirmPassword) {
        nextErrors.confirmPassword = copy.auth.validations.required
      } else if (managementForm.confirmPassword !== managementForm.password) {
        nextErrors.confirmPassword = copy.auth.validations.confirmPassword
      }
    }

    return nextErrors
  }

  const handleManagementChange = (event) => {
    const { name, type, checked, value } = event.target
    const nextValue =
      type === 'checkbox' ? checked : name === 'phone' ? sanitizePhoneInput(value) : value

    setManagementForm((current) => ({ ...current, [name]: nextValue }))
    setManagementErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleManagementSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateManagementForm()

    if (Object.keys(nextErrors).length > 0) {
      setManagementErrors(nextErrors)
      return
    }

    const cityMatch =
      flattenedCities.flatMap((group) => group.options).find((option) => option.id === managementForm.cityRegion) ||
      null
    const nextUser = {
      id: editingUserId || `managed-${Date.now()}`,
      name: `${managementForm.firstName.trim()} ${managementForm.lastName.trim()}`.trim(),
      firstName: managementForm.firstName.trim(),
      lastName: managementForm.lastName.trim(),
      email: managementForm.email.trim(),
      role: managementForm.isAdmin ? 'admin' : 'user',
      registerDate:
        managedUsers.find((user) => user.id === editingUserId)?.registerDate ||
        new Date().toLocaleDateString(language === 'tj' ? 'tg-TJ' : 'ru-RU'),
      phone: managementForm.phone,
      birthdayRaw: managementForm.birthday,
      gender: managementForm.gender,
      cityId: managementForm.cityRegion,
      city:
        cityMatch?.label[language] ||
        managedUsers.find((user) => user.id === editingUserId)?.city ||
        managementForm.cityRegion,
    }

    setManagedUsers((current) =>
      editingUserId
        ? current.map((user) => (user.id === editingUserId ? nextUser : user))
        : [nextUser, ...current],
    )
    resetManagementModal()
  }

  const handleDeleteManagedUser = (id) => {
    setManagedUsers((current) => current.filter((user) => user.id !== id))
  }

  const handleDeleteManagedCourse = (id) => {
    setManagedCourses((current) => current.filter((course) => course.id !== id))
  }

  const handleDeleteQuestion = (courseId, questionId) => {
    setManagedCourses((current) =>
      current.map((course) =>
        course.id === courseId
          ? {
              ...course,
              testItems: course.testItems.filter((item) => item.id !== questionId),
              test: {
                ...course.test,
                questions: Math.max(0, course.testItems.length - 1),
                passingPoints: Math.min(course.test.passingPoints, Math.max(1, course.testItems.length - 1)),
              },
            }
          : course,
      ),
    )
  }

  const requestDelete = (title, message, action) => {
    setPendingDelete({ title, message, action })
  }

  const closeDeleteModal = () => {
    setPendingDelete(null)
  }

  const handleAddQuestion = (course) => {
    setQuestionCourseId(course.id)
    setEditingQuestionId(null)
    setQuestionForm(initialQuestionForm)
    setQuestionErrors({})
    setIsQuestionModalOpen(true)
  }

  const resetCourseModal = () => {
    setIsCourseModalOpen(false)
    setEditingCourseId(null)
    setCourseForm(initialCourseForm)
    setCourseErrors({})
  }

  const openAddCourseModal = () => {
    setEditingCourseId(null)
    setCourseForm({
      ...initialCourseForm,
      passingPoints: '1',
    })
    setCourseErrors({})
    setIsCourseModalOpen(true)
  }

  const openEditCourseModal = (course) => {
    setEditingCourseId(course.id)
    setCourseForm({
      titleRu: course.title.ru,
      titleTj: course.title.tj,
      descriptionRu: course.descriptionText.ru,
      descriptionTj: course.descriptionText.tj,
      videoUrl: course.videoId ? `https://www.youtube.com/watch?v=${course.videoId}` : '',
      passingPoints: String(course.test.passingPoints),
    })
    setCourseErrors({})
    setIsCourseModalOpen(true)
  }

  const handleCourseFormChange = (event) => {
    const { name, value } = event.target
    setCourseForm((current) => ({ ...current, [name]: value }))
    setCourseErrors((current) => ({ ...current, [name]: '' }))
  }

  const resetQuestionModal = () => {
    setIsQuestionModalOpen(false)
    setQuestionForm(initialQuestionForm)
    setQuestionErrors({})
    setQuestionCourseId(null)
    setEditingQuestionId(null)
  }

  const openEditQuestionModal = (courseId, question) => {
    setQuestionCourseId(courseId)
    setEditingQuestionId(question.id)
    setQuestionForm({
      questionRu: question.question.ru,
      questionTj: question.question.tj,
      optionsRu: [...question.options.ru.slice(0, 3), '', '', ''].slice(0, 3),
      optionsTj: [...question.options.tj.slice(0, 3), '', '', ''].slice(0, 3),
      correctOption: String(Math.min(question.correctOption, 2)),
    })
    setQuestionErrors({})
    setIsQuestionModalOpen(true)
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') {
        return
      }

      if (pendingDelete) {
        closeDeleteModal()
        return
      }

      if (isQuestionModalOpen) {
        resetQuestionModal()
        return
      }

      if (isCourseModalOpen) {
        resetCourseModal()
        return
      }

      if (isUserModalOpen) {
        resetManagementModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isCourseModalOpen, isQuestionModalOpen, isUserModalOpen, pendingDelete])

  const handleQuestionFormChange = (event) => {
    const { name, value } = event.target
    setQuestionForm((current) => ({ ...current, [name]: value }))
    setQuestionErrors((current) => ({ ...current, [name]: '' }))
  }

  const validateCourseModal = () => {
    const nextErrors = {}

    if (!courseForm.titleRu.trim()) nextErrors.titleRu = copy.auth.validations.required
    if (!courseForm.titleTj.trim()) nextErrors.titleTj = copy.auth.validations.required
    if (!courseForm.descriptionRu.trim()) nextErrors.descriptionRu = copy.auth.validations.required
    if (!courseForm.descriptionTj.trim()) nextErrors.descriptionTj = copy.auth.validations.required
    if (!courseForm.videoUrl.trim()) {
      nextErrors.videoUrl = copy.auth.validations.required
    } else if (!extractYoutubeVideoId(courseForm.videoUrl)) {
      nextErrors.videoUrl = copy.auth.validations.required
    }

    if (!courseForm.passingPoints.trim()) {
      nextErrors.passingPoints = copy.auth.validations.required
    } else {
      const points = Number(courseForm.passingPoints)
      if (
        Number.isNaN(points) ||
        points < 1 ||
        points > (managedCourses.find((course) => course.id === editingCourseId)?.testItems.length || 1) ||
        !Number.isInteger(points)
      ) {
        nextErrors.passingPoints = copy.auth.validations.required
      }
    }

    return nextErrors
  }

  const validateQuestionModal = () => {
    const nextErrors = {}
    if (!questionForm.questionRu.trim()) nextErrors.questionRu = copy.auth.validations.required
    if (!questionForm.questionTj.trim()) nextErrors.questionTj = copy.auth.validations.required
    questionForm.optionsRu.forEach((option, index) => {
      if (!option.trim()) nextErrors[`optionRu${index}`] = copy.auth.validations.required
    })
    questionForm.optionsTj.forEach((option, index) => {
      if (!option.trim()) nextErrors[`optionTj${index}`] = copy.auth.validations.required
    })
    return nextErrors
  }

  const handleCourseSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateCourseModal()

    if (Object.keys(nextErrors).length > 0) {
      setCourseErrors(nextErrors)
      return
    }

    setManagedCourses((current) =>
      editingCourseId
        ? current.map((course) =>
            course.id === editingCourseId
              ? {
                  ...course,
                  title: {
                    ...course.title,
                    ru: courseForm.titleRu.trim(),
                    tj: courseForm.titleTj.trim(),
                  },
                  descriptionText: {
                    ...course.descriptionText,
                    ru: courseForm.descriptionRu.trim(),
                    tj: courseForm.descriptionTj.trim(),
                  },
                  videoId: extractYoutubeVideoId(courseForm.videoUrl),
                  test: {
                    ...course.test,
                    passingPoints: Number(courseForm.passingPoints),
                  },
                }
              : course,
          )
        : [
            {
              id: `course-${Date.now()}`,
              title: { ru: courseForm.titleRu.trim(), tj: courseForm.titleTj.trim() },
              descriptionText: {
                ru: courseForm.descriptionRu.trim(),
                tj: courseForm.descriptionTj.trim(),
              },
              videoId: extractYoutubeVideoId(courseForm.videoUrl),
              createdBy: 'Малика Раҳимова',
              test: {
                questions: 0,
                options: 3,
                passingPoints: Number(courseForm.passingPoints),
                maxTries: 3,
              },
              testItems: [],
            },
            ...current,
          ],
    )
    resetCourseModal()
  }

  const handleQuestionSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateQuestionModal()
    if (Object.keys(nextErrors).length > 0) {
      setQuestionErrors(nextErrors)
      return
    }

    setManagedCourses((current) =>
      current.map((course) => {
        if (course.id !== questionCourseId) return course

        const nextQuestion = {
          id: editingQuestionId || `${course.id}-question-${Date.now()}`,
          correctOption: Number(questionForm.correctOption),
          question: {
            ru: questionForm.questionRu.trim(),
            tj: questionForm.questionTj.trim(),
          },
          options: {
            ru: questionForm.optionsRu.map((option) => option.trim()),
            tj: questionForm.optionsTj.map((option) => option.trim()),
          },
        }

        const nextItems = editingQuestionId
          ? course.testItems.map((item) => (item.id === editingQuestionId ? nextQuestion : item))
          : [...course.testItems, nextQuestion]

        return {
          ...course,
          test: {
            ...course.test,
            questions: nextItems.length,
            options: 3,
            passingPoints: Math.min(course.test.passingPoints, Math.max(1, nextItems.length)),
          },
          testItems: nextItems,
        }
      }),
    )
    resetQuestionModal()
  }

  const renderCoursesTable = () => (
    <section className="admin-table-card">
      <div className="admin-table-card__header">
        <h2>{copy.dashboard.admin.tables.courses.title}</h2>
      </div>
      <div className="admin-table">
        <table className="admin-table__element admin-table__element--courses">
          <thead>
            <tr>
              <th>{copy.dashboard.admin.tables.courses.columns.course}</th>
              <th>{copy.dashboard.admin.tables.courses.columns.tries}</th>
              <th>{copy.dashboard.admin.tables.courses.columns.passed}</th>
              <th>{copy.dashboard.admin.tables.courses.columns.successful}</th>
            </tr>
          </thead>
          <tbody>
            {data.courses.map((course) => (
              <tr key={course.id}>
                <td className="admin-table__cell--strong">{course.title}</td>
                <td>{course.tries}</td>
                <td>{course.passed}</td>
                <td>{course.successRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )

  const renderUsersTable = () => (
    <section className="admin-table-card">
      <div className="admin-table-card__header admin-table-card__header--with-search">
        <h2>{copy.dashboard.admin.tables.users.title}</h2>
        <input
          type="text"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="admin-search-input"
          placeholder={copy.dashboard.admin.tables.users.searchPlaceholder}
          aria-label={copy.dashboard.admin.tables.users.searchPlaceholder}
        />
      </div>

      <div className="admin-table">
        <table className="admin-table__element admin-table__element--users">
          <thead>
            <tr>
              <th>{copy.dashboard.admin.tables.users.columns.fio}</th>
              <th>{copy.dashboard.admin.tables.users.columns.email}</th>
              <th>{copy.dashboard.admin.tables.users.columns.phone}</th>
              <th>{copy.dashboard.admin.tables.users.columns.birthDate}</th>
              <th>{copy.dashboard.admin.tables.users.columns.gender}</th>
              <th>{copy.dashboard.admin.tables.users.columns.city}</th>
              <th>{copy.dashboard.admin.tables.users.columns.testsTaken}</th>
              <th>{copy.dashboard.admin.tables.users.columns.certificates}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="admin-table__cell--strong">{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.birthday}</td>
                <td>{user.gender}</td>
                <td>{user.city}</td>
                <td>{user.testsTaken}</td>
                <td>{user.certificates}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )

  const renderResultsTable = () => (
    <section className="admin-table-card">
      <div className="admin-table-card__header">
        <h2>{copy.dashboard.admin.tables.results.title}</h2>
      </div>

      <div className="admin-table">
        <table className="admin-table__element admin-table__element--results">
          <thead>
            <tr>
              <th>{copy.dashboard.admin.tables.results.columns.user}</th>
              <th>{copy.dashboard.admin.tables.results.columns.course}</th>
              <th>{copy.dashboard.admin.tables.results.columns.points}</th>
              <th>{copy.dashboard.admin.tables.results.columns.status}</th>
              <th>{copy.dashboard.admin.tables.results.columns.date}</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map((result) => (
              <tr key={result.id}>
                <td className="admin-table__cell--strong">{result.userName}</td>
                <td>{result.courseTitle}</td>
                <td>{result.points}</td>
                <td>
                  <span className={`admin-status-badge${result.passed ? ' is-success' : ' is-fail'}`}>
                    {result.passed
                      ? copy.dashboard.admin.tables.results.statusPassed
                      : copy.dashboard.admin.tables.results.statusFailed}
                  </span>
                </td>
                <td>{result.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )

  const renderUsersManagementTable = () => (
    <section className="admin-manage-section">
      <div className="admin-manage-section__top">
        <div>
          <h2>{copy.dashboard.admin.tables.usersManagement.title}</h2>
          <p className="admin-manage-section__subtitle">
            {copy.dashboard.admin.tables.usersManagement.description}
          </p>
        </div>
        <button type="button" className="admin-overview__export" onClick={openAddUserModal}>
          <PlusIcon />
          <span>{copy.dashboard.admin.tables.usersManagement.addUser}</span>
        </button>
      </div>
      <div className="admin-table-card admin-table-card--flat">
        <div className="admin-table-card__header admin-table-card__header--with-search">
          <h3 className="admin-table-card__mini-title">
            {copy.dashboard.admin.tables.usersManagement.allUsers}
          </h3>
          <input
            type="text"
            value={managementSearchValue}
            onChange={(event) => setManagementSearchValue(event.target.value)}
            className="admin-search-input"
            placeholder={copy.dashboard.admin.tables.usersManagement.searchPlaceholder}
            aria-label={copy.dashboard.admin.tables.usersManagement.searchPlaceholder}
          />
        </div>
        <div className="admin-table">
          <table className="admin-table__element admin-table__element--management">
            <thead>
              <tr>
                <th>{copy.dashboard.admin.tables.usersManagement.columns.fio}</th>
                <th>{copy.dashboard.admin.tables.usersManagement.columns.email}</th>
                <th>{copy.dashboard.admin.tables.usersManagement.columns.role}</th>
                <th>{copy.dashboard.admin.tables.usersManagement.columns.registerDate}</th>
                <th>{copy.dashboard.admin.tables.usersManagement.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredManagedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="admin-table__cell--strong">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role === 'admin' ? copy.header.roleAdmin : copy.header.roleUser}</td>
                  <td>{user.registerDate}</td>
                  <td>
                  <div className="admin-table-actions admin-table-actions--text">
                    <button
                      type="button"
                      className="admin-table-actions__button"
                      onClick={() => openEditUserModal(user)}
                      aria-label={copy.dashboard.admin.tables.usersManagement.actions.edit}
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      className="admin-table-actions__button admin-table-actions__button--danger"
                      onClick={() =>
                        requestDelete(
                          copy.dashboard.admin.tables.usersManagement.deleteUser,
                          user.name,
                          () => handleDeleteManagedUser(user.id),
                        )
                      }
                      aria-label={copy.dashboard.admin.tables.usersManagement.actions.delete}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )

  const renderContentManagementTable = () => (
    <section className="admin-manage-section">
      <div className="admin-manage-section__top">
        <div>
          <h2>{copy.dashboard.admin.tables.contentManagement.title}</h2>
          <p className="admin-manage-section__subtitle">
            {copy.dashboard.admin.tables.contentManagement.description}
          </p>
        </div>
        <button type="button" className="admin-overview__export" onClick={openAddCourseModal}>
          <PlusIcon />
          <span>{copy.dashboard.admin.tables.contentManagement.addCourse}</span>
        </button>
      </div>
      <div className="admin-course-sections">
        {managedCourses.map((course) => (
          <section key={course.id} className="admin-course-section">
            <div className="admin-course-section__top">
              <div className="admin-course-section__info">
                <h3>{course.title[language]}</h3>
                <p>{course.descriptionText[language]}</p>
                <div className="admin-course-section__meta">
                  <span className="admin-course-section__video-status">
                    <VideoIcon />
                    {course.videoId
                      ? copy.dashboard.admin.tables.contentManagement.videoStatusAdded
                      : copy.dashboard.admin.tables.contentManagement.videoStatusMissing}
                  </span>
                  <span className="admin-course-section__dot" aria-hidden="true">•</span>
                  <span>{course.testItems.length} {copy.dashboard.admin.tables.contentManagement.questionsCount}</span>
                </div>
                <span className="admin-course-section__author">
                  {copy.dashboard.admin.tables.contentManagement.createdBy}:{' '}
                  {course.createdBy?.trim() || 'Малика Раҳимова'}
                </span>
              </div>
              <div className="admin-course-section__actions">
                <button
                  type="button"
                  className="admin-action-pill"
                  onClick={() => openEditCourseModal(course)}
                >
                  <EditIcon />
                  {copy.dashboard.admin.tables.contentManagement.actions.edit}
                </button>
                <button
                  type="button"
                  className="admin-table-actions__button admin-table-actions__button--danger"
                  onClick={() =>
                    requestDelete(
                      copy.dashboard.admin.tables.contentManagement.deleteCourse,
                      course.title[language],
                      () => handleDeleteManagedCourse(course.id),
                    )
                  }
                  aria-label={copy.dashboard.admin.tables.contentManagement.actions.delete}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>

            <div className="admin-table-card admin-table-card--nested admin-table-card--flat">
              <div className="admin-table-card__header admin-table-card__header--action">
                <h3 className="admin-table-card__mini-title">
                  {copy.dashboard.admin.tables.contentManagement.questionsTitle}
                </h3>
                <button
                  type="button"
                  className="admin-action-pill"
                  onClick={() => handleAddQuestion(course)}
                >
                  <PlusIcon />
                  <span>{copy.dashboard.admin.tables.contentManagement.addQuestion}</span>
                </button>
              </div>
              <div className="admin-table">
                <table className="admin-table__element admin-table__element--questions">
                  <colgroup>
                    <col className="admin-table__column--number" />
                    <col className="admin-table__column--question" />
                    <col className="admin-table__column--correct" />
                    <col className="admin-table__column--actions" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>{copy.dashboard.admin.tables.contentManagement.columns.number}</th>
                      <th>{copy.dashboard.admin.tables.contentManagement.columns.question}</th>
                      <th>{copy.dashboard.admin.tables.contentManagement.columns.correctOption}</th>
                      <th>{copy.dashboard.admin.tables.contentManagement.columns.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.testItems.map((question, index) => (
                      <tr key={question.id}>
                        <td>{index + 1}</td>
                        <td>{question.question[language]}</td>
                        <td>{question.correctOption + 1}</td>
                        <td>
                          <div className="admin-table-actions admin-table-actions--text">
                            <button
                              type="button"
                              className="admin-table-actions__button"
                              onClick={() => openEditQuestionModal(course.id, question)}
                              aria-label={copy.dashboard.admin.tables.contentManagement.actions.edit}
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              className="admin-table-actions__button admin-table-actions__button--danger"
                              onClick={() =>
                                requestDelete(
                                  copy.dashboard.admin.tables.contentManagement.actions.delete,
                                  question.question[language],
                                  () => handleDeleteQuestion(course.id, question.id),
                                )
                              }
                              aria-label={copy.dashboard.admin.tables.contentManagement.actions.delete}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ))}
      </div>
    </section>
  )

  const renderPanelContent = () => {
    if (activeTab === 'courses') {
      return renderCoursesTable()
    }

    if (activeTab === 'users') {
      return renderUsersTable()
    }

    if (activeTab === 'results') {
      return renderResultsTable()
    }

    if (activeTab === 'usersManagement') {
      return renderUsersManagementTable()
    }

    if (activeTab === 'contentManagement') {
      return renderContentManagementTable()
    }

    return <section className="admin-table-card admin-table-card--placeholder" />
  }

  return (
    <section className="admin-overview">
      <div className="admin-overview__top">
        <div className="admin-overview__intro">
          <h1>{copy.dashboard.admin.title}</h1>
          <p>{copy.dashboard.admin.description}</p>
        </div>
        <button type="button" className="admin-overview__export" onClick={onExport}>
          <ExportIcon />
          <span>{copy.dashboard.admin.export}</span>
        </button>
      </div>

      <div className="admin-stats-grid">
        {statItems.map((item) => (
          <article key={item.key} className="admin-stat-card">
            <div className="admin-stat-card__head">
              <span className="admin-stat-card__icon">{item.icon}</span>
              <span className="admin-stat-card__label">{item.label}</span>
            </div>
            <strong className="admin-stat-card__value">{item.value}</strong>
          </article>
        ))}
      </div>

      <section className="admin-tabs-panel" aria-label={copy.dashboard.admin.tabsLabel}>
        <div className="admin-tabs" role="tablist" aria-label={copy.dashboard.admin.tabsLabel}>
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`admin-tabs__button${activeTab === tab ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {copy.dashboard.admin.tabs[tab]}
            </button>
          ))}
        </div>
      </section>

      {renderPanelContent()}

      {isUserModalOpen ? (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <div className="admin-modal__backdrop" onClick={resetManagementModal} />
          <div className="admin-modal__card">
            <div className="admin-modal__header">
              <div>
                <h2>
                  {editingUserId
                    ? copy.dashboard.admin.tables.usersManagement.editUser
                    : copy.dashboard.admin.tables.usersManagement.addUser}
                </h2>
                <p>{copy.dashboard.admin.tables.usersManagement.modalDescription}</p>
              </div>
              <button
                type="button"
                className="admin-modal__close"
                aria-label={copy.dashboard.admin.tables.usersManagement.closeModal}
                onClick={resetManagementModal}
              >
                ×
              </button>
            </div>

            <form className="admin-modal__form auth-form" onSubmit={handleManagementSubmit}>
              <div className="auth-row">
                <label className="auth-field">
                  <span>{copy.auth.firstNameLabel}</span>
                  <input type="text" name="firstName" value={managementForm.firstName} onChange={handleManagementChange} className={managementErrors.firstName ? 'is-invalid' : ''} />
                  {managementErrors.firstName ? <span className="auth-field__error">{managementErrors.firstName}</span> : null}
                </label>
                <label className="auth-field">
                  <span>{copy.auth.lastNameLabel}</span>
                  <input type="text" name="lastName" value={managementForm.lastName} onChange={handleManagementChange} className={managementErrors.lastName ? 'is-invalid' : ''} />
                  {managementErrors.lastName ? <span className="auth-field__error">{managementErrors.lastName}</span> : null}
                </label>
              </div>

              <label className="auth-field">
                <span>{copy.auth.emailLabel}</span>
                <input type="email" name="email" value={managementForm.email} onChange={handleManagementChange} className={managementErrors.email ? 'is-invalid' : ''} />
                {managementErrors.email ? <span className="auth-field__error">{managementErrors.email}</span> : null}
              </label>

              <div className="auth-row">
                <label className="auth-field">
                  <span>{copy.auth.genderLabel}</span>
                  <select name="gender" value={managementForm.gender} onChange={handleManagementChange} className={`${managementErrors.gender ? 'is-invalid ' : ''}${!managementForm.gender ? 'is-placeholder' : ''}`.trim()}>
                    <option value="">{copy.auth.genderPlaceholder}</option>
                    <option value="male">{copy.auth.genderMale}</option>
                    <option value="female">{copy.auth.genderFemale}</option>
                  </select>
                  {managementErrors.gender ? <span className="auth-field__error">{managementErrors.gender}</span> : null}
                </label>
                <label className="auth-field">
                  <span>{copy.auth.birthdayLabel}</span>
                  <input type="date" name="birthday" value={managementForm.birthday} onChange={handleManagementChange} className={managementErrors.birthday ? 'is-invalid' : ''} />
                  {managementErrors.birthday ? <span className="auth-field__error">{managementErrors.birthday}</span> : null}
                </label>
              </div>

              <label className="auth-field">
                <span>{copy.auth.phoneLabel}</span>
                <input type="tel" name="phone" value={managementForm.phone} onChange={handleManagementChange} className={managementErrors.phone ? 'is-invalid' : ''} />
                {managementErrors.phone ? <span className="auth-field__error">{managementErrors.phone}</span> : null}
              </label>

              <label className="auth-field">
                <span>{copy.auth.cityRegionLabel}</span>
                <select name="cityRegion" value={managementForm.cityRegion} onChange={handleManagementChange} className={`${managementErrors.cityRegion ? 'is-invalid ' : ''}${!managementForm.cityRegion ? 'is-placeholder' : ''}`.trim()}>
                  <option value="">{copy.auth.cityRegionPlaceholder}</option>
                  {flattenedCities.map((group) => (
                    <optgroup key={group.label[language]} label={group.label[language]}>
                      {group.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label[language]}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {managementErrors.cityRegion ? <span className="auth-field__error">{managementErrors.cityRegion}</span> : null}
              </label>

              <div className="auth-row">
                <label className="auth-field">
                  <span>{copy.auth.passwordLabel}</span>
                  <div className="auth-field__input-wrap">
                    <input type={showManagementPasswords ? 'text' : 'password'} name="password" value={managementForm.password} onChange={handleManagementChange} className={managementErrors.password ? 'is-invalid' : ''} />
                    {(managementForm.password || managementForm.confirmPassword) ? (
                      <button type="button" className="auth-password-toggle" onClick={() => setShowManagementPasswords((current) => !current)} aria-label={showManagementPasswords ? copy.auth.hidePasswords : copy.auth.showPasswords}>
                        {showManagementPasswords ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    ) : null}
                  </div>
                  {managementErrors.password ? <span className="auth-field__error">{managementErrors.password}</span> : null}
                </label>
                <label className="auth-field">
                  <span>{copy.auth.confirmPasswordLabel}</span>
                  <div className="auth-field__input-wrap">
                    <input type={showManagementPasswords ? 'text' : 'password'} name="confirmPassword" value={managementForm.confirmPassword} onChange={handleManagementChange} className={managementErrors.confirmPassword ? 'is-invalid' : ''} />
                    {(managementForm.password || managementForm.confirmPassword) ? (
                      <button type="button" className="auth-password-toggle" onClick={() => setShowManagementPasswords((current) => !current)} aria-label={showManagementPasswords ? copy.auth.hidePasswords : copy.auth.showPasswords}>
                        {showManagementPasswords ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    ) : null}
                  </div>
                  {managementErrors.confirmPassword ? <span className="auth-field__error">{managementErrors.confirmPassword}</span> : null}
                </label>
              </div>

              <label className="admin-switch">
                <input type="checkbox" name="isAdmin" checked={managementForm.isAdmin} onChange={handleManagementChange} />
                <span className="admin-switch__track" />
                <span className="admin-switch__label">{copy.dashboard.admin.tables.usersManagement.adminToggle}</span>
              </label>

              <div className="admin-modal__actions">
                <button type="button" className="course-test-card__button course-test-card__button--secondary" onClick={resetManagementModal}>
                  {copy.auth.back}
                </button>
                <button type="submit" className="course-test-card__button">
                  {editingUserId ? copy.dashboard.admin.tables.usersManagement.saveUser : copy.dashboard.admin.tables.usersManagement.createUser}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isCourseModalOpen ? (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <div className="admin-modal__backdrop" onClick={resetCourseModal} />
          <div className="admin-modal__card">
            <div className="admin-modal__header">
              <div>
                <h2>
                  {editingCourseId
                    ? copy.dashboard.admin.tables.contentManagement.editCourse
                    : copy.dashboard.admin.tables.contentManagement.addCourse}
                </h2>
                <p>{copy.dashboard.admin.tables.contentManagement.modalDescription}</p>
              </div>
              <button
                type="button"
                className="admin-modal__close"
                aria-label={copy.dashboard.admin.tables.contentManagement.closeModal}
                onClick={resetCourseModal}
              >
                ×
              </button>
            </div>

            <form className="admin-modal__form auth-form" onSubmit={handleCourseSubmit}>
              <h3 className="admin-modal__section-title">
                {copy.dashboard.admin.tables.contentManagement.courseInfoTitle}
              </h3>
              <div className="auth-row">
                <label className="auth-field">
                  <span>{copy.dashboard.admin.tables.contentManagement.titleRu}</span>
                  <input
                    type="text"
                    name="titleRu"
                    value={courseForm.titleRu}
                    onChange={handleCourseFormChange}
                    className={courseErrors.titleRu ? 'is-invalid' : ''}
                  />
                  {courseErrors.titleRu ? (
                    <span className="auth-field__error">{courseErrors.titleRu}</span>
                  ) : null}
                </label>
                <label className="auth-field">
                  <span>{copy.dashboard.admin.tables.contentManagement.titleTj}</span>
                  <input
                    type="text"
                    name="titleTj"
                    value={courseForm.titleTj}
                    onChange={handleCourseFormChange}
                    className={courseErrors.titleTj ? 'is-invalid' : ''}
                  />
                  {courseErrors.titleTj ? (
                    <span className="auth-field__error">{courseErrors.titleTj}</span>
                  ) : null}
                </label>
              </div>

              <div className="auth-row">
                <label className="auth-field">
                  <span>{copy.dashboard.admin.tables.contentManagement.descriptionRu}</span>
                  <textarea
                    name="descriptionRu"
                    value={courseForm.descriptionRu}
                    onChange={handleCourseFormChange}
                    className={`admin-modal__textarea${courseErrors.descriptionRu ? ' is-invalid' : ''}`}
                    rows="4"
                  />
                  {courseErrors.descriptionRu ? (
                    <span className="auth-field__error">{courseErrors.descriptionRu}</span>
                  ) : null}
                </label>
                <label className="auth-field">
                  <span>{copy.dashboard.admin.tables.contentManagement.descriptionTj}</span>
                  <textarea
                    name="descriptionTj"
                    value={courseForm.descriptionTj}
                    onChange={handleCourseFormChange}
                    className={`admin-modal__textarea${courseErrors.descriptionTj ? ' is-invalid' : ''}`}
                    rows="4"
                  />
                  {courseErrors.descriptionTj ? (
                    <span className="auth-field__error">{courseErrors.descriptionTj}</span>
                  ) : null}
                </label>
              </div>

              <div className="auth-row">
                <label className="auth-field">
                  <span>{copy.dashboard.admin.tables.contentManagement.videoUrl}</span>
                  <input
                    type="text"
                    name="videoUrl"
                    value={courseForm.videoUrl}
                    onChange={handleCourseFormChange}
                    className={courseErrors.videoUrl ? 'is-invalid' : ''}
                  />
                  {courseErrors.videoUrl ? (
                    <span className="auth-field__error">{courseErrors.videoUrl}</span>
                  ) : null}
                </label>

                <label className="auth-field">
                  <span>{copy.courseDetail.passingPoints}</span>
                  <input
                    type="number"
                    name="passingPoints"
                    value={courseForm.passingPoints}
                    onChange={handleCourseFormChange}
                    min="1"
                    className={courseErrors.passingPoints ? 'is-invalid' : ''}
                  />
                  {courseErrors.passingPoints ? (
                    <span className="auth-field__error">{courseErrors.passingPoints}</span>
                  ) : null}
                </label>
              </div>

              <div className="admin-modal__actions">
                <button
                  type="button"
                  className="course-test-card__button course-test-card__button--secondary"
                  onClick={resetCourseModal}
                >
                  {copy.auth.back}
                </button>
                <button type="submit" className="course-test-card__button">
                  {editingCourseId
                    ? copy.dashboard.admin.tables.contentManagement.saveCourse
                    : copy.dashboard.admin.tables.contentManagement.addCourse}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isQuestionModalOpen ? (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <div className="admin-modal__backdrop" onClick={resetQuestionModal} />
          <div className="admin-modal__card">
            <div className="admin-modal__header">
              <div>
                <h2>
                  {editingQuestionId
                    ? copy.dashboard.admin.tables.contentManagement.actions.edit
                    : copy.dashboard.admin.tables.contentManagement.addQuestion}
                </h2>
                <p>{copy.dashboard.admin.tables.contentManagement.questionModalDescription}</p>
              </div>
              <button
                type="button"
                className="admin-modal__close"
                aria-label={copy.dashboard.admin.tables.contentManagement.closeModal}
                onClick={resetQuestionModal}
              >
                ×
              </button>
            </div>

            <form className="admin-modal__form auth-form" onSubmit={handleQuestionSubmit}>
              <div className="auth-row">
                <label className="auth-field">
                  <span>{copy.dashboard.admin.tables.contentManagement.questionRu}</span>
                  <textarea
                    name="questionRu"
                    value={questionForm.questionRu}
                    onChange={handleQuestionFormChange}
                    className={`admin-modal__textarea${questionErrors.questionRu ? ' is-invalid' : ''}`}
                    rows="3"
                  />
                  {questionErrors.questionRu ? (
                    <span className="auth-field__error">{questionErrors.questionRu}</span>
                  ) : null}
                </label>
                <label className="auth-field">
                  <span>{copy.dashboard.admin.tables.contentManagement.questionTj}</span>
                  <textarea
                    name="questionTj"
                    value={questionForm.questionTj}
                    onChange={handleQuestionFormChange}
                    className={`admin-modal__textarea${questionErrors.questionTj ? ' is-invalid' : ''}`}
                    rows="3"
                  />
                  {questionErrors.questionTj ? (
                    <span className="auth-field__error">{questionErrors.questionTj}</span>
                  ) : null}
                </label>
              </div>

              {[0, 1, 2].map((optionIndex) => (
                <div
                  key={optionIndex}
                  className={`admin-question-option${
                    questionForm.correctOption === String(optionIndex) ? ' is-selected' : ''
                  }`}
                >
                  <label className="admin-question-option__select">
                    <input
                      type="radio"
                      name="correctOption"
                      value={optionIndex}
                      checked={questionForm.correctOption === String(optionIndex)}
                      onChange={handleQuestionFormChange}
                    />
                  </label>
                  <label className="auth-field">
                    <span>{copy.dashboard.admin.tables.contentManagement.optionRu} {optionIndex + 1}</span>
                    <input
                      type="text"
                      value={questionForm.optionsRu[optionIndex]}
                      onChange={(event) =>
                        handleQuestionFormChange({
                          target: {
                            name: 'optionsRu',
                            value: questionForm.optionsRu.map((option, index) =>
                              index === optionIndex ? event.target.value : option,
                            ),
                          },
                        })
                      }
                      className={questionErrors[`optionRu${optionIndex}`] ? 'is-invalid' : ''}
                    />
                    {questionErrors[`optionRu${optionIndex}`] ? (
                      <span className="auth-field__error">{questionErrors[`optionRu${optionIndex}`]}</span>
                    ) : null}
                  </label>
                  <label className="auth-field">
                    <span>{copy.dashboard.admin.tables.contentManagement.optionTj} {optionIndex + 1}</span>
                    <input
                      type="text"
                      value={questionForm.optionsTj[optionIndex]}
                      onChange={(event) =>
                        handleQuestionFormChange({
                          target: {
                            name: 'optionsTj',
                            value: questionForm.optionsTj.map((option, index) =>
                              index === optionIndex ? event.target.value : option,
                            ),
                          },
                        })
                      }
                      className={questionErrors[`optionTj${optionIndex}`] ? 'is-invalid' : ''}
                    />
                    {questionErrors[`optionTj${optionIndex}`] ? (
                      <span className="auth-field__error">{questionErrors[`optionTj${optionIndex}`]}</span>
                    ) : null}
                  </label>
                </div>
              ))}

              <div className="admin-modal__actions">
                <button
                  type="button"
                  className="course-test-card__button course-test-card__button--secondary"
                  onClick={resetQuestionModal}
                >
                  {copy.auth.back}
                </button>
                <button type="submit" className="course-test-card__button">
                  {editingQuestionId
                    ? copy.dashboard.admin.tables.contentManagement.saveQuestion
                    : copy.dashboard.admin.tables.contentManagement.createQuestion}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {pendingDelete ? (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <div className="admin-modal__backdrop" onClick={closeDeleteModal} />
          <div className="admin-modal__card admin-modal__card--confirm">
            <div className="admin-modal__header">
              <div>
                <h2>{pendingDelete.title}</h2>
                <p>{pendingDelete.message}</p>
              </div>
              <button
                type="button"
                className="admin-modal__close"
                onClick={closeDeleteModal}
                aria-label={copy.auth.back}
              >
                ×
              </button>
            </div>
            <div className="admin-modal__actions admin-modal__actions--confirm">
              <button
                type="button"
                className="course-test-card__button course-test-card__button--secondary"
                onClick={closeDeleteModal}
              >
                {copy.dashboard.admin.cancelDelete}
              </button>
              <button
                type="button"
                className="course-test-card__button course-test-card__button--danger"
                onClick={() => {
                  pendingDelete.action()
                  closeDeleteModal()
                }}
              >
                {copy.dashboard.admin.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default AdminOverview
