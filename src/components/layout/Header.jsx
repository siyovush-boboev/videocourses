import logo from '../../assets/Logo.png'
import LanguageSelect from './LanguageSelect'
import ProfileMenu from './ProfileMenu'
import ShieldIcon from '../icons/ShieldIcon'
import LoginArrowIcon from '../icons/LoginArrowIcon'

function Header({
  copy,
  language,
  setLanguage,
  session,
  pathname,
  onLogoClick,
  onAdminPanelClick,
  onLoginClick,
  onOpenProfile,
}) {
  const isAdmin = session?.role === 'admin'
  const shouldShowLoginButton = !session && pathname !== '/login'
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
                <ProfileMenu
                  copy={copy}
                  session={session}
                  onOpenProfile={onOpenProfile}
                />
              </div>
            </div>
          </>
        ) : (
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
              {shouldShowLoginButton ? (
                <button
                  type="button"
                  className="login-button"
                  onClick={onLoginClick}
                >
                  <LoginArrowIcon />
                  {copy.header.login}
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
