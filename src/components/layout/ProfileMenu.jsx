import { useRef, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import useClickOutside from '../../hooks/useClickOutside'
import HomeOutlineIcon from '../icons/HomeOutlineIcon'
import LogoutOutlineIcon from '../icons/LogoutOutlineIcon'
import ShieldIcon from '../icons/ShieldIcon'
import UserIcon from '../icons/UserIcon'

function ProfileMenu({ copy, session, onGoHome, onOpenAdminPanel, onOpenProfile }) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef(null)
  const { signOut } = useAuth()
  const isAdmin = session?.role === 'admin'

  useClickOutside(rootRef, () => setIsOpen(false), isOpen)

  return (
    <div ref={rootRef} className="profile-menu">
      <button
        type="button"
        className="profile-button"
        aria-label={session.name}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <UserIcon />
      </button>

      {isOpen ? (
        <div className="profile-popover" role="menu">
          <div className="profile-popover__header">
            <span className="profile-popover__avatar" aria-hidden="true">
              <UserIcon />
            </span>
            <div>
              <p className="profile-popover__name">{session.name}</p>
              <p className="profile-popover__email">{session.email}</p>
            </div>
          </div>

          {isAdmin ? (
            <button
              type="button"
              className="profile-popover__action"
              onClick={() => {
                setIsOpen(false)
                onOpenAdminPanel?.()
              }}
            >
              <ShieldIcon />
              {copy.header.adminPanel}
            </button>
          ) : null}
          <button
            type="button"
            className="profile-popover__action"
            onClick={() => {
              setIsOpen(false)
              onGoHome?.()
            }}
          >
            <HomeOutlineIcon />
            {copy.header.allCourses}
          </button>
          <button
            type="button"
            className="profile-popover__action"
            onClick={() => {
              setIsOpen(false)
              onOpenProfile?.()
            }}
            >
            <UserIcon />
            {copy.header.profile}
          </button>
          <button
            type="button"
            className="profile-popover__action profile-popover__action--danger"
            onClick={signOut}
          >
            <LogoutOutlineIcon />
            {copy.header.signOut}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default ProfileMenu
