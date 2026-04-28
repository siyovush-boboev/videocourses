import AuthCard from '../components/auth/AuthCard'
import PublicLayout from '../components/layout/PublicLayout'

function AuthPage({
  copy,
  language,
  setLanguage,
  pathname,
  onLoginClick,
  onLogoClick,
}) {
  return (
    <PublicLayout
      copy={copy}
      language={language}
      setLanguage={setLanguage}
      centered
      pathname={pathname}
      onLoginClick={onLoginClick}
      onLogoClick={onLogoClick}
    >
      <AuthCard copy={copy} language={language} />
    </PublicLayout>
  )
}

export default AuthPage
