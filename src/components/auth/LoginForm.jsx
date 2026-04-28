import { useState } from 'react'
import useAuth from '../../hooks/useAuth'
import GoogleIcon from '../icons/GoogleIcon'
import EyeIcon from '../icons/EyeIcon'
import EyeOffIcon from '../icons/EyeOffIcon'

function LoginForm({ copy }) {
  const { signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const shouldShowPasswordToggle = formData.password.length > 0

  const validateField = (name, value, nextFormData = formData) => {
    if (name === 'email') {
      if (!value.trim()) {
        return copy.auth.validations.required
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return copy.auth.validations.email
      }
    }

    if (name === 'password' && !nextFormData.password) {
      return copy.auth.validations.password
    }

    return ''
  }

  const validate = () => {
    const nextErrors = {}

    ;['email', 'password'].forEach((fieldName) => {
      const message = validateField(fieldName, formData[fieldName], formData)

      if (message) {
        nextErrors[fieldName] = message
      }
    })

    return nextErrors
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    const nextFormData = { ...formData, [name]: value }

    setFormData(nextFormData)
    setFieldErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleFocus = () => {
    if (error) {
      setError('')
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate()

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setError('')
      return
    }

    setFieldErrors({})

    const result = signIn(formData)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setError('')
  }

  return (
    <div className="auth-panel">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="auth-field">
          <span>{copy.auth.loginLabel}</span>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={handleFocus}
            autoComplete="username"
            className={fieldErrors.email ? 'is-invalid' : ''}
          />
          {fieldErrors.email ? (
            <span className="auth-field__error">{fieldErrors.email}</span>
          ) : null}
        </label>

        <label className="auth-field">
          <span>{copy.auth.passwordLabel}</span>
          <div className="auth-field__input-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={handleFocus}
              autoComplete="current-password"
              className={fieldErrors.password ? 'is-invalid' : ''}
            />
            {shouldShowPasswordToggle ? (
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword ? copy.auth.hidePasswords : copy.auth.showPasswords
                }
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            ) : null}
          </div>
          {fieldErrors.password ? (
            <span className="auth-field__error">{fieldErrors.password}</span>
          ) : null}
        </label>

        <div className="auth-error-slot" aria-live="polite">
          {error ? <p className="auth-error">{error}</p> : null}
        </div>

        <div className="auth-actions">
          <button type="submit" className="auth-submit">
            {copy.auth.submit}
          </button>

          <button type="button" className="google-submit">
            <GoogleIcon />
            <span>{copy.auth.google}</span>
          </button>
        </div>
      </form>

      <div className="auth-hint">
        <p className="auth-hint__title">{copy.auth.hintTitle}</p>
        <p>{copy.auth.adminHint}</p>
        <p>{copy.auth.userHint}</p>
      </div>
    </div>
  )
}

export default LoginForm
