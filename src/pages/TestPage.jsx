import { useState } from 'react'

const calculateTestResult = (testItems, answers) => {
  const correctAnswers = testItems.reduce((total, item) => {
    return total + ((answers[item.id] === item.correctOption) ? 1 : 0)
  }, 0)
  const totalQuestions = testItems.length
  const score = Math.round((correctAnswers / totalQuestions) * 100)

  return {
    score,
    correctAnswers,
    totalQuestions,
  }
}

function TestPage({ copy, course, language, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})

  const currentQuestion = course.testItems[currentIndex]
  const totalQuestions = course.testItems.length
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100
  const selectedOption = answers[currentQuestion.id] ?? null
  const isFirstQuestion = currentIndex === 0
  const isLastQuestion = currentIndex === totalQuestions - 1

  const handleSelectOption = (optionIndex) => {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: optionIndex,
    }))
  }

  const handleBack = () => {
    if (!isFirstQuestion) {
      setCurrentIndex((current) => current - 1)
    }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(calculateTestResult(course.testItems, answers))
      return
    }

    setCurrentIndex((current) => current + 1)
  }

  return (
    <section className="test-page">
      <div className="test-page__header">
        <h1>{course.title[language]}</h1>
        <p className="test-page__position">
          {copy.test.questionNumber} {currentIndex + 1} / {totalQuestions}
        </p>
        <div className="test-progress" aria-hidden="true">
          <div className="test-progress__track">
            <div
              className="test-progress__fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="test-card">
        <p className="test-card__question">{currentQuestion.question[language]}</p>

        <div className="test-options">
          {currentQuestion.options[language].map((option, index) => (
            <button
              key={option}
              type="button"
              className={`test-option${selectedOption === index ? ' is-selected' : ''}`}
              onClick={() => handleSelectOption(index)}
            >
              <span className="test-option__marker">
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="test-nav">
        <button
          type="button"
          className="test-nav__button"
          onClick={handleBack}
          disabled={isFirstQuestion}
        >
          {copy.test.back}
        </button>
        <button
          type="button"
          className="test-nav__button test-nav__button--primary"
          onClick={handleNext}
          disabled={selectedOption === null}
        >
          {isLastQuestion ? copy.test.finish : copy.test.nextQuestion}
        </button>
      </div>
    </section>
  )
}

export default TestPage
