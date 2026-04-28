import { createContext, useState } from 'react'
import { mockUsers } from '../data/mockUsers'

const STORAGE_KEY = 'videocourses-session'

const AuthContext = createContext(null)

function buildSessionFromUser(user) {
  return {
    id: user.id,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    gender: user.gender,
    birthday: user.birthday,
    phone: user.phone,
    city: user.city,
  }
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const storedSession = window.localStorage.getItem(STORAGE_KEY)

    if (!storedSession) {
      return null
    }

    const parsedSession = JSON.parse(storedSession)
    const matchedUser = mockUsers.find((user) => user.id === parsedSession.id)

    if (!matchedUser) {
      return parsedSession
    }

    const hydratedSession = {
      ...buildSessionFromUser(matchedUser),
      ...parsedSession,
      firstName: parsedSession.firstName ?? matchedUser.firstName,
      lastName: parsedSession.lastName ?? matchedUser.lastName,
      gender: parsedSession.gender ?? matchedUser.gender,
      birthday: parsedSession.birthday ?? matchedUser.birthday,
      phone: parsedSession.phone ?? matchedUser.phone,
      city: parsedSession.city ?? matchedUser.city,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hydratedSession))
    return hydratedSession
  })

  const signIn = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase()

    const matchedUser = mockUsers.find(
      (user) =>
        user.email.toLowerCase() === normalizedEmail && user.password === password,
    )

    if (!matchedUser) {
      return {
        ok: false,
        error: 'Неверный логин или пароль.',
      }
    }

    const nextSession = buildSessionFromUser(matchedUser)

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)

    return { ok: true }
  }

  const signOut = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }

  return (
    <AuthContext value={{ isReady: true, session, signIn, signOut }}>
      {children}
    </AuthContext>
  )
}

export { AuthContext, AuthProvider }
