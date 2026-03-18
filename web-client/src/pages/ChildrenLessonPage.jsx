import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ChildrenLesson.css';
import ChildrenQuiz from '../components/ChildrenQuiz';
import ChildrenCourseStructure from '../components/ChildrenCourseStructure';
import ChildrenInteractiveStory from '../components/ChildrenInteractiveStory';

const ChildrenLessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('lesson');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    setMode('lesson');
    if (courseId) {
      fetchCourse();
    } else if (lessonId) {
      fetchLesson();
    }
  }, [courseId, lessonId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/children-courses/${courseId}`);
      const result = await response.json();
      if (result.success && result.data) {
        setCourse(result.data);
        // Auto-load first lesson of first unit
        if (result.data.units && result.data.units.length > 0) {
          const firstUnit = result.data.units[0];
          if (firstUnit.lessons && firstUnit.lessons.length > 0) {
            const firstLesson = firstUnit.lessons[0];
            setLesson({
              ...firstLesson,
              challenges: firstLesson.challenges || [],
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/children-courses/lesson/${lessonId}`);
      const result = await response.json();
      if (result.success) {
        setLesson({
          ...result.data,
          challenges: result.data.challenges || [],
        });
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLesson = (selectedLesson) => {
    setLesson({
      ...selectedLesson,
      challenges: selectedLesson.challenges || [],
    });
    setMode('lesson');
  };

  if (loading) {
    return (
      <div className="lesson-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-error">
        <p>Lesson not found</p>
        <button onClick={() => navigate('/children')}>← Back to Courses</button>
      </div>
    );
  }

  return (
    <div className="children-lesson-page">
      {mode !== 'quiz' ? (
        <div className="lesson-container">
          {/* Sidebar with course structure */}
          {course && (
            <aside className="lesson-sidebar">
              <button 
                className="back-btn"
                onClick={() => navigate('/children')}
              >
                ← Back to Courses
              </button>
              <ChildrenCourseStructure
                course={course}
                lesson={lesson}
                onSelectLesson={handleSelectLesson}
              />
            </aside>
          )}

          {/* Main lesson content */}
          <div className="lesson-main">
            {mode === 'lesson' && <div className="lesson-content">
              {/* Lesson Header */}
              <div className="lesson-header">
                <h1>{lesson.title}</h1>
                <p className="lesson-description">{lesson.description}</p>
              </div>

              {/* Lesson Body */}
              <div className="lesson-body">
                {lesson.imageSrc && (
                  <img src={lesson.imageSrc} alt={lesson.title} className="lesson-image" />
                )}

                <div className="lesson-text">
                  <h2>📖 Learn</h2>
                  <p>{lesson.content}</p>
                </div>

                {/* Challenges Count */}
                {lesson.challenges && lesson.challenges.length > 0 && (
                  <div className="challenges-preview">
                    <h3>📖 Interactive Story Path</h3>
                    <p>
                      {lesson.challenges.length} story nodes with choices and consequences
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="lesson-footer">
                {lesson.challenges && lesson.challenges.length > 0 && (
                  <button className="start-quiz-btn" onClick={() => setMode('story')}>
                    Start Story ({lesson.challenges.length} steps)
                  </button>
                )}
              </div>
            </div>}

            {mode === 'story' && (
              <ChildrenInteractiveStory
                lesson={lesson}
                onBack={() => setMode('lesson')}
                onComplete={() => setMode('lesson')}
              />
            )}
          </div>
        </div>
      ) : (
        /* Quiz Component */
        <ChildrenQuiz
          lesson={lesson}
          onBack={() => setMode('lesson')}
          onComplete={() => setMode('lesson')}
        />
      )}
    </div>
  );
};

export default ChildrenLessonPage;
