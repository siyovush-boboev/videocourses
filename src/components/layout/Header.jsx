import logo from '../../assets/Logo.png'
import LanguageSelect from './LanguageSelect'
import ProfileMenu from './ProfileMenu'
import ShieldIcon from '../icons/ShieldIcon'

function Header({
  copy,
  language,
  setLanguage,
  session,
  pathname,
  onLogoClick,
  onAdminPanelClick,
}) {
  const isAdmin = session?.role === 'admin'
  const headerInnerClassName = session
    ? 'header__inner header__inner--protected'
    : 'header__inner header__inner--public'
  const adminButtonClassName =
    isAdmin && pathname === '/admin'
      ? 'admin-button is-active'
      : 'admin-button'

  return (
    <header className="header">
      <div className={headerInnerClassName}>
        {session ? (
          <>
            <button type="button" className="brand brand--button" onClick={onLogoClick}>
              <img className="brand__logo" src={logo} alt="Videocourses" />
            </button>

            <div className="header__actions">
              <LanguageSelect
                copy={copy}
                language={language}
                setLanguage={setLanguage}
              />
              {isAdmin ? (
                <button
                  type="button"
                  className={adminButtonClassName}
                  onClick={onAdminPanelClick}
                >
                  <ShieldIcon />
                  <span>{copy.header.adminPanel}</span>
                </button>
              ) : null}
              <div className="header__user-group">
                <p className="user-name">{session.name}</p>
                <ProfileMenu copy={copy} session={session} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="brand">
              <img className="brand__logo" src={logo} alt="Videocourses" />
            </div>

            <div className="header__actions">
              <LanguageSelect
                copy={copy}
                language={language}
                setLanguage={setLanguage}
              />
            </div>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
