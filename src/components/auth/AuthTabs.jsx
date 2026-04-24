function AuthTabs({ copy, activeTab, setActiveTab }) {
  return (
    <div className="auth-tabs" role="tablist" aria-label={copy.auth.welcome}>
      <button
        type="button"
        className={activeTab === 'login' ? 'auth-tab is-active' : 'auth-tab'}
        onClick={() => setActiveTab('login')}
      >
        {copy.auth.loginTab}
      </button>
      <button
        type="button"
        className={activeTab === 'signup' ? 'auth-tab is-active' : 'auth-tab'}
        onClick={() => setActiveTab('signup')}
      >
        {copy.auth.signupTab}
      </button>
    </div>
  )
}

export default AuthTabs
