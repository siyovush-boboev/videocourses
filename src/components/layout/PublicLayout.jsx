import Footer from './Footer'
import Header from './Header'

function PublicLayout({ copy, language, setLanguage, children }) {
  return (
    <div className="page">
      <Header copy={copy} language={language} setLanguage={setLanguage} />
      <main className="content content--auth">
        <div className="content__inner">{children}</div>
      </main>
      <Footer copy={copy} />
    </div>
  )
}

export default PublicLayout
