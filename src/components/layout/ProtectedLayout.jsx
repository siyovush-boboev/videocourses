import Footer from './Footer'
import Header from './Header'

function ProtectedLayout({
  copy,
  language,
  setLanguage,
  session,
  pathname,
  onLogoClick,
  onAdminPanelClick,
  onGoHome,
  onOpenProfile,
  children,
}) {
  return (
    <div className="page">
      <Header
        copy={copy}
        language={language}
        setLanguage={setLanguage}
        session={session}
        pathname={pathname}
        onLogoClick={onLogoClick}
        onAdminPanelClick={onAdminPanelClick}
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
      />
      <main className="content">
        <div className="content__inner">{children}</div>
      </main>
      <Footer copy={copy} />
    </div>
  )
}

export default ProtectedLayout
