import Footer from './Footer'
import Header from './Header'

function ProtectedLayout({
  copy,
  language,
  setLanguage,
  session,
  children,
}) {
  return (
    <div className="page">
      <Header
        copy={copy}
        language={language}
        setLanguage={setLanguage}
        session={session}
      />
      <main className="content">
        <div className="content__inner">{children}</div>
      </main>
      <Footer copy={copy} />
    </div>
  )
}

export default ProtectedLayout
