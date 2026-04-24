import { useState } from 'react'
import { tajikistanCityGroups } from '../../data/tajikistanLocations'
import GoogleIcon from '../icons/GoogleIcon'
import EyeIcon from '../icons/EyeIcon'
import EyeOffIcon from '../icons/EyeOffIcon'

function SignupStub({ copy, language }) {
  const [step, setStep] = useState('details')
  const [showPasswords, setShowPasswords] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    birthday: '',
    phone: '',
    cityRegion: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitMessage, setSubmitMessage] = useState('')
  const shouldShowPasswordToggle =
    formData.password.length > 0 || formData.confirmPassword.length > 0

  const sanitizePhoneInput = (value) => {
    let sanitized = value.replace(/[^\d+]/g, '')

    if (sanitized.includes('+')) {
      sanitized = `+${sanitized.replace(/\+/g, '')}`
    }

    if (sanitized.startsWith('+')) {
      return sanitized.slice(0, 13)
    }

    return sanitized.slice(0, 9)
  }

  const isValidTajikPhone = (value) => {
    if (value.startsWith('+')) {
      return /^\+992\d{9}$/.test(value)
    }

    return /^\d{9}$/.test(value)
  }

  const getAge = (birthday) => {
    const today = new Date()
    const birthDate = new Date(`${birthday}T00:00:00`)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age -= 1
    }

    return age
  }

  const validateDetailsField = (name, value, nextFormData = formData) => {
    if (name === 'firstName' && !value.trim()) {
      return copy.auth.validations.required
    }

    if (name === 'lastName' && !value.trim()) {
      return copy.auth.validations.required
    }

    if (name === 'email') {
      if (!value.trim()) {
        return copy.auth.validations.required
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return copy.auth.validations.email
      }
    }

    if (name === 'gender' && !value) {
      return copy.auth.validations.required
    }

    if (name === 'birthday') {
      if (!value) {
        return copy.auth.validations.required
      }

      if (
        Number.isNaN(Date.parse(value)) ||
        value > new Date().toISOString().slice(0, 10)
      ) {
        return copy.auth.validations.birthday
      }

      const age = getAge(value)

      if (age < 16) {
        return copy.auth.validations.birthdayMinAge
      }

      if (age > 100) {
        return copy.auth.validations.birthdayMaxAge
      }
    }

    if (name === 'phone') {
      if (!value.trim()) {
        return copy.auth.validations.required
      }

      if (!isValidTajikPhone(value)) {
        return copy.auth.validations.phone
      }
    }

    if (name === 'cityRegion' && !nextFormData.cityRegion) {
      return copy.auth.validations.required
    }

    return ''
  }

  const validatePasswordField = (name, value, nextFormData = formData) => {
    if (name === 'password') {
      if (!value) {
        return copy.auth.validations.password
      }

      if (value.length < 8) {
        return copy.auth.validations.passwordLength
      }

      if (!/[A-Z]/.test(value)) {
        return copy.auth.validations.passwordUpper
      }

      if (!/[a-z]/.test(value)) {
        return copy.auth.validations.passwordLower
      }

      if (!/\d/.test(value)) {
        return copy.auth.validations.passwordDigit
      }

      if (/\s/.test(value)) {
        return copy.auth.validations.passwordSpaces
      }

      if (!/[^\w\s]/.test(value)) {
        return copy.auth.validations.passwordSpecial
      }
    }

    if (name === 'confirmPassword') {
      if (!value) {
        return copy.auth.validations.required
      }

      if (value !== nextFormData.password) {
        return copy.auth.validations.confirmPassword
      }
    }

    return ''
  }

  const validateDetails = () => {
    const nextErrors = {}

    ;[
      'firstName',
      'lastName',
      'email',
      'gender',
      'birthday',
      'phone',
      'cityRegion',
    ].forEach((fieldName) => {
      const message = validateDetailsField(fieldName, formData[fieldName], formData)

      if (message) {
        nextErrors[fieldName] = message
      }
    })

    return nextErrors
  }

  const validatePasswordStep = () => {
    const nextErrors = {}

    ;['password', 'confirmPassword'].forEach((fieldName) => {
      const message = validatePasswordField(fieldName, formData[fieldName], formData)

      if (message) {
        nextErrors[fieldName] = message
      }
    })

    return nextErrors
  }

  const handleChange = (event) => {
    const { name } = event.target
    const value =
      name === 'phone' ? sanitizePhoneInput(event.target.value) : event.target.value
    const nextFormData = { ...formData, [name]: value }

    setFormData(nextFormData)
    setFieldErrors((current) => {
      if (name === 'password') {
        return { ...current, password: '', confirmPassword: '' }
      }

      return { ...current, [name]: '' }
    })

    setSubmitMessage('')
  }

  const handleNextStep = (event) => {
    event.preventDefault()
    const nextErrors = validateDetails()

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setSubmitMessage('')
      return
    }

    setFieldErrors({})
    setStep('password')
    setSubmitMessage('')
  }

  const handleCreateAccount = (event) => {
    event.preventDefault()
    const nextErrors = validatePasswordStep()

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setSubmitMessage('')
      return
    }

    setFieldErrors({})
    setSubmitMessage(copy.auth.signupPending)
  }

  const handleBack = () => {
    setFieldErrors({})
    setSubmitMessage('')
    setShowPasswords(false)
    setStep('details')
  }

  return (
    <form
      className="auth-form"
      onSubmit={step === 'details' ? handleNextStep : handleCreateAccount}
    >
      {step === 'details' ? (
        <>
          <div className="auth-row">
            <label className="auth-field">
              <span>{copy.auth.firstNameLabel}</span>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                className={fieldErrors.firstName ? 'is-invalid' : ''}
              />
              {fieldErrors.firstName ? (
                <span className="auth-field__error">{fieldErrors.firstName}</span>
              ) : null}
            </label>

            <label className="auth-field">
              <span>{copy.auth.lastNameLabel}</span>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                autoComplete="family-name"
                className={fieldErrors.lastName ? 'is-invalid' : ''}
              />
              {fieldErrors.lastName ? (
                <span className="auth-field__error">{fieldErrors.lastName}</span>
              ) : null}
            </label>
          </div>

          <label className="auth-field">
            <span>{copy.auth.emailLabel}</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              className={fieldErrors.email ? 'is-invalid' : ''}
            />
            {fieldErrors.email ? (
              <span className="auth-field__error">{fieldErrors.email}</span>
            ) : null}
          </label>

          <div className="auth-row">
            <label className="auth-field">
              <span>{copy.auth.genderLabel}</span>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`${fieldErrors.gender ? 'is-invalid ' : ''}${!formData.gender ? 'is-placeholder' : ''}`.trim()}
              >
                <option value="">{copy.auth.genderPlaceholder}</option>
                <option value="male">{copy.auth.genderMale}</option>
                <option value="female">{copy.auth.genderFemale}</option>
              </select>
              {fieldErrors.gender ? (
                <span className="auth-field__error">{fieldErrors.gender}</span>
              ) : null}
            </label>

            <label className="auth-field">
              <span>{copy.auth.birthdayLabel}</span>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className={fieldErrors.birthday ? 'is-invalid' : ''}
              />
              {fieldErrors.birthday ? (
                <span className="auth-field__error">{fieldErrors.birthday}</span>
              ) : null}
            </label>
          </div>

          <label className="auth-field">
            <span>{copy.auth.phoneLabel}</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              inputMode="tel"
              className={fieldErrors.phone ? 'is-invalid' : ''}
            />
            {fieldErrors.phone ? (
              <span className="auth-field__error">{fieldErrors.phone}</span>
            ) : null}
          </label>

          <label className="auth-field auth-field--spaced">
            <span>{copy.auth.cityRegionLabel}</span>
            <select
              name="cityRegion"
              value={formData.cityRegion}
              onChange={handleChange}
              className={`${fieldErrors.cityRegion ? 'is-invalid ' : ''}${!formData.cityRegion ? 'is-placeholder' : ''}`.trim()}
            >
              <option value="">{copy.auth.cityRegionPlaceholder}</option>
              {tajikistanCityGroups.map((group) => (
                <optgroup key={group.id} label={group.label[language]}>
                  {group.cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.label[language]}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {fieldErrors.cityRegion ? (
              <span className="auth-field__error">{fieldErrors.cityRegion}</span>
            ) : null}
          </label>

          <div className="auth-actions">
            <button type="submit" className="auth-submit">
              {copy.auth.next}
            </button>

            <button type="button" className="google-submit">
              <GoogleIcon />
              <span>{copy.auth.google}</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="auth-step-header">
            <h2>{copy.auth.signupPasswordTitle}</h2>
            <p>{copy.auth.signupPasswordSubtitle}</p>
          </div>

          <label className="auth-field">
            <span>{copy.auth.passwordLabel}</span>
            <div className="auth-field__input-wrap">
              <input
                type={showPasswords ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={fieldErrors.password ? 'is-invalid' : ''}
              />
              {shouldShowPasswordToggle ? (
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPasswords((current) => !current)}
                  aria-label={
                    showPasswords ? copy.auth.hidePasswords : copy.auth.showPasswords
                  }
                  aria-pressed={showPasswords}
                >
                  {showPasswords ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              ) : null}
            </div>
            {fieldErrors.password ? (
              <span className="auth-field__error">{fieldErrors.password}</span>
            ) : null}
          </label>

          <label className="auth-field auth-field--spaced">
            <span>{copy.auth.confirmPasswordLabel}</span>
            <div className="auth-field__input-wrap">
              <input
                type={showPasswords ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                className={fieldErrors.confirmPassword ? 'is-invalid' : ''}
              />
              {shouldShowPasswordToggle ? (
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPasswords((current) => !current)}
                  aria-label={
                    showPasswords ? copy.auth.hidePasswords : copy.auth.showPasswords
                  }
                  aria-pressed={showPasswords}
                >
                  {showPasswords ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              ) : null}
            </div>
            {fieldErrors.confirmPassword ? (
              <span className="auth-field__error">
                {fieldErrors.confirmPassword}
              </span>
            ) : null}
          </label>

          {submitMessage ? <p className="auth-success">{submitMessage}</p> : null}

          <div className="auth-actions">
            <button
              type="button"
              className="google-submit"
              onClick={handleBack}
            >
              <span>{copy.auth.back}</span>
            </button>

            <button type="submit" className="auth-submit">
              {copy.auth.createAccount}
            </button>
          </div>
        </>
      )}
    </form>
  )
}

export default SignupStub
