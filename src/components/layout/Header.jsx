import logo from '../../assets/Logo.png'
import LanguageSelect from './LanguageSelect'
import ProfileMenu from './ProfileMenu'
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
  onGoHome,
  onOpenProfile,
}) {
  const shouldShowLoginButton = !session && pathname !== '/login'
  const headerInnerClassName = session
    ? 'header__inner header__inner--protected'
    : 'header__inner header__inner--public'

  return (
    <header className="header">
      <div className={headerInnerClassName}>
        <button type="button" className="brand brand--button" onClick={onLogoClick}>
          <img className="brand__logo" src={logo} alt="Videocourses" />
        </button>

        {session ? (
          <div className="header__actions">
            <LanguageSelect
              copy={copy}
              language={language}
              setLanguage={setLanguage}
            />
            <div className="header__user-group">
              <p className="user-name">{session.name}</p>
              <ProfileMenu
                copy={copy}
                session={session}
                onGoHome={onGoHome}
                onOpenAdminPanel={onAdminPanelClick}
                onOpenProfile={onOpenProfile}
              />
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </header>
  )
}

export default Header
