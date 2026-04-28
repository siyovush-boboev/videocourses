import Footer from './Footer'
import Header from './Header'

function PublicLayout({
  copy,
  language,
  setLanguage,
  children,
  centered = false,
  pathname,
  onLoginClick,
  onLogoClick,
}) {
  return (
    <div className="page">
      <Header
        copy={copy}
        language={language}
        setLanguage={setLanguage}
        pathname={pathname}
        onLoginClick={onLoginClick}
        onLogoClick={onLogoClick}
      />
      <main className={centered ? 'content content--auth' : 'content'}>
        <div className="content__inner">{children}</div>
      </main>
      <Footer copy={copy} />
    </div>
  )
}

export default PublicLayout
