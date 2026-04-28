import ResultCheckIcon from '../components/icons/ResultCheckIcon'
import ResultFailIcon from '../components/icons/ResultFailIcon'

function TestResultPage({
  copy,
  course,
  language,
  result,
  onRetake,
  onGoHome,
  onViewCertificate,
}) {
  const isPassed = result.score >= course.test.passingPoints
  const failText = copy.test.resultFailText
    .replace('{points}', String(course.test.passingPoints))
    .replace('{percent}', `${course.test.passingPoints}%`)

  return (
    <section className="test-result-page">
      <div
        className={`test-result-box ${isPassed ? 'is-success' : 'is-fail'}`}
      >
        <div className="test-result-box__icon" aria-hidden="true">
          {isPassed ? <ResultCheckIcon /> : <ResultFailIcon />}
        </div>
        <p className="test-result-box__label">
          {isPassed ? copy.test.resultSuccessTitle : copy.test.resultFailTitle}
        </p>
        <p className="test-result-box__answers">
          {result.correctAnswers} / {result.totalQuestions}
        </p>
        <p className="test-result-box__percent">{result.score}%</p>
        <p className="test-result-box__course-title">{course.title[language]}</p>
        <p className="test-result-box__text">
          {isPassed ? copy.test.resultSuccessText : failText}
        </p>
      </div>

      {isPassed ? (
        <div className="test-result-card">
          <h2>{copy.test.certificateTitle}</h2>
          <p>{copy.test.certificateText}</p>
          <div className="test-result-actions">
            <button
              type="button"
              className="test-result-button test-result-button--primary"
              onClick={onViewCertificate}
            >
              {copy.test.viewCertificate}
            </button>
            <button
              type="button"
              className="test-result-button"
              onClick={onGoHome}
            >
              {copy.test.goHome}
            </button>
          </div>
        </div>
      ) : (
        <div className="test-result-actions">
          <button
            type="button"
            className="test-result-button test-result-button--primary"
            onClick={onRetake}
          >
            {copy.test.retake}
          </button>
          <button
            type="button"
            className="test-result-button"
            onClick={onGoHome}
          >
            {copy.test.goHome}
          </button>
        </div>
      )}
    </section>
  )
}

export default TestResultPage
