const getYoutubeEmbedUrl = (value) => {
  const trimmedValue = value?.trim?.() || ''

  if (!trimmedValue) return ''

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedValue)) {
    return `https://www.youtube.com/embed/${trimmedValue}`
  }

  try {
    const url = new URL(trimmedValue)

    if (url.hostname.includes('youtu.be')) {
      const idFromPath = url.pathname.split('/').filter(Boolean)[0] || ''
      if (/^[a-zA-Z0-9_-]{11}$/.test(idFromPath)) {
        return `https://www.youtube.com/embed/${idFromPath}`
      }
    }

    if (url.hostname.includes('youtube.com')) {
      const watchId = url.searchParams.get('v')
      if (watchId && /^[a-zA-Z0-9_-]{11}$/.test(watchId)) {
        return `https://www.youtube.com/embed/${watchId}`
      }

      const pathParts = url.pathname.split('/').filter(Boolean)
      const embedIndex = pathParts.findIndex((part) => part === 'embed' || part === 'shorts')
      const idFromPath = embedIndex >= 0 ? pathParts[embedIndex + 1] : pathParts[pathParts.length - 1]
      if (/^[a-zA-Z0-9_-]{11}$/.test(idFromPath || '')) {
        return `https://www.youtube.com/embed/${idFromPath}`
      }
    }
  } catch {
    return ''
  }

  return ''
}

function CourseDetailPage({ copy, course, language, onOpenTest, onGoHome }) {
  const requiredPercent = Math.round(
    (course.test.passingPoints / course.test.questions) * 100,
  )
  const videoEmbedUrl = getYoutubeEmbedUrl(course.videoId)

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
          {videoEmbedUrl ? (
            <iframe
              src={videoEmbedUrl}
              title={course.title[language]}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : null}
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
            <dd>
              {course.test.passingPoints} ({requiredPercent}%)
            </dd>
          </div>
          <div className="course-test-card__item">
            <dt>{copy.courseDetail.maxTries}</dt>
            <dd>{course.test.maxTries}</dd>
          </div>
        </dl>

        <div className="course-test-card__actions">
          <button
            type="button"
            className="course-test-card__button course-test-card__button--secondary"
            onClick={onGoHome}
          >
            {copy.courseDetail.allCourses}
          </button>
          <button
            type="button"
            className="course-test-card__button"
            onClick={() => onOpenTest(course.id)}
          >
            {copy.courseDetail.action}
          </button>
        </div>
      </section>
    </section>
  )
}

export default CourseDetailPage
