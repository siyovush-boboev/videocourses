import CourseCardIcon from '../icons/CourseCardIcon'

function CourseCard({ course, language, actionLabel, onOpenCourse }) {
  return (
    <article className="course-card">
      <div className="course-card__head">
        <div className="course-card__icon">
          <CourseCardIcon type={course.icon} />
        </div>
        <h2>{course.title[language]}</h2>
      </div>
      <p className="course-card__title">{course.descriptionTitle[language]}</p>
      <p className="course-card__description">{course.descriptionText[language]}</p>
      <button
        type="button"
        className="course-card__button"
        onClick={() => onOpenCourse(course.id)}
      >
        {actionLabel}
      </button>
    </article>
  )
}

export default CourseCard
