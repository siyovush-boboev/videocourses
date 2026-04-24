import logo from '../../assets/Logo.png'
import LanguageSelect from './LanguageSelect'
import ProfileMenu from './ProfileMenu'
import ShieldIcon from '../icons/ShieldIcon'

function Header({ copy, language, setLanguage, session }) {
  const isAdmin = session?.role === 'admin'
  const roleLabel = isAdmin ? copy.header.roleAdmin : copy.header.roleUser
  const headerInnerClassName = session
    ? 'header__inner header__inner--protected'
    : 'header__inner header__inner--public'

  return (
    <header className="header">
      <div className={headerInnerClassName}>
        {session ? (
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
              <button
                type="button"
                className={isAdmin ? 'admin-button' : 'role-button'}
              >
                {isAdmin ? <ShieldIcon /> : null}
                <span>{isAdmin ? copy.header.adminPanel : roleLabel}</span>
              </button>
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
