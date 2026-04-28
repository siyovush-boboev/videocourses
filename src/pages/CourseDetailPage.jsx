function CourseDetailPage({ copy, course, language, onOpenTest }) {
  return (
    <section className="course-detail-page">
      <div className="course-detail-page__header">
        <h1>{course.title[language]}</h1>
        <p className="course-detail-page__description">
          {course.fullDescription[language]}
        </p>
      </div>

      <section className="course-video-card">
        <h2>{copy.courseDetail.videoTitle}</h2>
        <div className="course-video-card__frame">
          <iframe
            src={`https://www.youtube.com/embed/${course.videoId}`}
            title={course.title[language]}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </section>

      <section className="course-test-card">
        <h2>{copy.courseDetail.infoTitle}</h2>

        <dl className="course-test-card__list">
          <div className="course-test-card__item">
            <dt>{copy.courseDetail.questions}</dt>
            <dd>{course.test.questions}</dd>
          </div>
          <div className="course-test-card__item">
            <dt>{copy.courseDetail.options}</dt>
            <dd>{course.test.options}</dd>
          </div>
          <div className="course-test-card__item">
            <dt>{copy.courseDetail.passingPoints}</dt>
            <dd>{course.test.passingPoints}%</dd>
          </div>
          <div className="course-test-card__item">
            <dt>{copy.courseDetail.maxTries}</dt>
            <dd>{course.test.maxTries}</dd>
          </div>
        </dl>

        <button
          type="button"
          className="course-test-card__button"
          onClick={() => onOpenTest(course.id)}
        >
          {copy.courseDetail.action}
        </button>
      </section>
    </section>
  )
}

export default CourseDetailPage
