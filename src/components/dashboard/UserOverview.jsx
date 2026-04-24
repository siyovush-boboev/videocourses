import RoleHero from './RoleHero'

function UserOverview({ copy }) {
  return (
    <RoleHero
      label={copy.dashboard.user.label}
      title={copy.dashboard.user.title}
      description={copy.dashboard.user.description}
      badge={copy.auth.roleBadgeUser}
    />
  )
}

export default UserOverview
