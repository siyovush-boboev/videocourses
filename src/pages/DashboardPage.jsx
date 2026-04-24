import AdminOverview from '../components/dashboard/AdminOverview'
import UserOverview from '../components/dashboard/UserOverview'
import ProtectedLayout from '../components/layout/ProtectedLayout'

function DashboardPage({ copy, language, setLanguage, session }) {
  return (
    <ProtectedLayout
      copy={copy}
      language={language}
      setLanguage={setLanguage}
      session={session}
    >
      {session.role === 'admin' ? (
        <AdminOverview copy={copy} />
      ) : (
        <UserOverview copy={copy} />
      )}
    </ProtectedLayout>
  )
}

export default DashboardPage
