import CourseCard from '../components/courses/CourseCard'
import { mockCourses } from '../data/mockCourses'

function CoursesPage({ copy, language, onOpenCourse }) {
  return (
    <section className="courses-page">
      <div className="courses-page__header">
        <h1>{copy.courses.title}</h1>
        <p className="content__description">{copy.courses.description}</p>
      </div>

      <div className="courses-grid">
        {mockCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            language={language}
            actionLabel={copy.courses.action}
            onOpenCourse={onOpenCourse}
          />
        ))}
      </div>
    </section>
  )
}

export default CoursesPage
