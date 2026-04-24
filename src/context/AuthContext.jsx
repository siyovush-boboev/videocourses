import { createContext, useState } from 'react'
import { mockUsers } from '../data/mockUsers'

const STORAGE_KEY = 'videocourses-session'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const storedSession = window.localStorage.getItem(STORAGE_KEY)
    return storedSession ? JSON.parse(storedSession) : null
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
        error:
          'Неверный логин или пароль. Используйте тестовый аккаунт администратора или сотрудника.',
      }
    }

    const nextSession = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
    }

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
