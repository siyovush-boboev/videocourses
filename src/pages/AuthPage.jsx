import AuthCard from '../components/auth/AuthCard'
import PublicLayout from '../components/layout/PublicLayout'

function AuthPage({ copy, language, setLanguage }) {
  return (
    <PublicLayout copy={copy} language={language} setLanguage={setLanguage}>
      <AuthCard copy={copy} language={language} />
    </PublicLayout>
  )
}

export default AuthPage
