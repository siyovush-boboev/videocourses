import CourseCardIcon from '../components/icons/CourseCardIcon'
import ChevronIcon from '../components/icons/ChevronIcon'
import ResultCheckIcon from '../components/icons/ResultCheckIcon'
import ResultFailIcon from '../components/icons/ResultFailIcon'
import UserIcon from '../components/icons/UserIcon'

function formatGender(copy, gender) {
  return gender === 'female' ? copy.profile.genderFemale : copy.profile.genderMale
}

function ProfilePage({
  copy,
  language,
  session,
  certificateEntries,
  tryEntries,
  onOpenCertificate,
  onGoHome,
}) {
  return (
    <section className="profile-page">
      <section className="profile-section">
        <button
          type="button"
          className="profile-back-button"
          onClick={onGoHome}
        >
          <span className="profile-back-button__icon" aria-hidden="true">
            <ChevronIcon />
          </span>
          <span>{copy.test.goHome}</span>
        </button>
        <div className="profile-section__header">
          <h1>{copy.profile.title}</h1>
        </div>
        <div className="profile-section__title">
          <span className="profile-section__icon" aria-hidden="true">
            <UserIcon />
          </span>
          <h2>{copy.profile.personalTitle}</h2>
        </div>
        <dl className="profile-details">
          <div className="profile-details__item">
            <dt>{copy.profile.firstName}</dt>
            <dd>{session.firstName}</dd>
          </div>
          <div className="profile-details__item">
            <dt>{copy.profile.lastName}</dt>
            <dd>{session.lastName}</dd>
          </div>
          <div className="profile-details__item">
            <dt>{copy.profile.email}</dt>
            <dd>{session.email}</dd>
          </div>
          <div className="profile-details__item">
            <dt>{copy.profile.gender}</dt>
            <dd>{formatGender(copy, session.gender)}</dd>
          </div>
          <div className="profile-details__item">
            <dt>{copy.profile.birthday}</dt>
            <dd>{session.birthday}</dd>
          </div>
          <div className="profile-details__item">
            <dt>{copy.profile.phone}</dt>
            <dd>{session.phone}</dd>
          </div>
          <div className="profile-details__item">
            <dt>{copy.profile.city}</dt>
            <dd>{session.city}</dd>
          </div>
        </dl>
      </section>

      <section className="profile-section">
        <div className="profile-section__title">
          <span className="profile-section__icon" aria-hidden="true">
            <CourseCardIcon type="card" />
          </span>
          <h2>{copy.profile.certificatesTitle}</h2>
        </div>
        {certificateEntries.length ? (
          <div className="profile-cert-grid">
            {certificateEntries.map((entry) => (
              <article key={entry.course.id} className="profile-cert-card">
                <div className="profile-cert-card__icon">
                  <CourseCardIcon type={entry.course.icon} />
                </div>
                <div className="profile-cert-card__content">
                  <p className="profile-cert-card__title">{entry.course.title[language]}</p>
                  <p>{copy.profile.certificateDate}: {entry.issuedDate}</p>
                  <p>{copy.profile.certificateNumber}: {entry.certificateNumber}</p>
                </div>
                <button
                  type="button"
                  className="profile-cert-card__button"
                  onClick={() => onOpenCertificate(entry.course.id)}
                >
                  {copy.profile.viewCertificate}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="profile-empty">{copy.profile.noCertificates}</p>
        )}
      </section>

      <section className="profile-section">
        <div className="profile-section__title">
          <span className="profile-section__icon" aria-hidden="true">
            <ResultCheckIcon />
          </span>
          <h2>{copy.profile.triesTitle}</h2>
        </div>
        {tryEntries.length ? (
          <div className="profile-tries">
            {tryEntries.map((entry) => (
              <article key={entry.id} className="profile-try-row">
                <div className={`profile-try-row__status ${entry.passed ? 'is-success' : 'is-fail'}`}>
                  {entry.passed ? <ResultCheckIcon /> : <ResultFailIcon />}
                </div>
                <div className="profile-try-row__meta">
                  <p className="profile-try-row__title">{entry.course.title[language]}</p>
                  <p>{entry.attemptedDate}</p>
                  <p>{copy.profile.tryNumber} {entry.tryNumber}</p>
                </div>
                <div className="profile-try-row__result">
                  <p className="profile-try-row__points">
                    {entry.correctAnswers} / {entry.totalQuestions}
                  </p>
                  <div className="profile-try-row__badge">
                    <strong>{entry.score}%</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="profile-empty">{copy.profile.noTries}</p>
        )}
      </section>
    </section>
  )
}

export default ProfilePage
