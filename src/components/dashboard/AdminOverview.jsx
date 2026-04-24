import RoleHero from './RoleHero'

function AdminOverview({ copy }) {
  return (
    <RoleHero
      label={copy.dashboard.admin.label}
      title={copy.dashboard.admin.title}
      description={copy.dashboard.admin.description}
      badge={copy.auth.roleBadgeAdmin}
    />
  )
}

export default AdminOverview
