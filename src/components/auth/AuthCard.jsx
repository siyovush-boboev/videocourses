import { useState } from 'react'
import AuthTabs from './AuthTabs'
import LoginForm from './LoginForm'
import SignupStub from './SignupStub'

function AuthCard({ copy, language }) {
  const [activeTab, setActiveTab] = useState('login')

  return (
    <section className="auth-card">
      <h1>{copy.auth.welcome}</h1>
      <p className="auth-card__subtitle">{copy.auth.subtitle}</p>

      <AuthTabs copy={copy} activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'login' ? (
        <LoginForm copy={copy} />
      ) : (
        <SignupStub copy={copy} language={language} />
      )}
    </section>
  )
}

export default AuthCard
