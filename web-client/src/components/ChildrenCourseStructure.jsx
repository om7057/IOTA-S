import React from 'react';

const ChildrenCourseStructure = ({ course, lesson, onSelectLesson }) => {
  if (!course || !course.units) return null;

  return (
    <div className="course-structure">
      <h3>Course Outline</h3>
      <div className="units-list">
        {course.units.map((unit, unitIdx) => (
          <div key={unit.id} className="unit">
            <div className="unit-header">
              <span className="unit-icon">📚</span>
              <span className="unit-title">
                Unit {unitIdx + 1}: {unit.title}
              </span>
            </div>
            {unit.lessons && unit.lessons.length > 0 && (
              <div className="lessons-list">
                {unit.lessons.map((lesson, lessonIdx) => (
                  <button
                    key={lesson.id}
                    className={`lesson-btn ${
                      lesson.id === lesson?.id ? 'active' : ''
                    }`}
                    onClick={() => onSelectLesson(lesson)}
                  >
                    <span className="lesson-number">{lessonIdx + 1}</span>
                    <span className="lesson-name">{lesson.title}</span>
                    {lesson.challenges && lesson.challenges.length > 0 && (
                      <span className="lesson-challenges">
                        {lesson.challenges.length} ?
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChildrenCourseStructure;
