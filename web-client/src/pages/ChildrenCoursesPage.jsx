import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChildrenNewsStories from '../components/ChildrenNewsStories';
import './ChildrenCourses.css';

const ChildrenCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const navigate = useNavigate();

  const handlePlayNewsStory = (story) => {
    // Store story in sessionStorage to pass to lesson page
    sessionStorage.setItem('newsStory', JSON.stringify(story));
    // Navigate to a news story player page
    navigate(`/children/news-story/${story.id}`);
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/children-courses`;
      if (selectedCategory !== 'all') {
        url = `${API_URL}/children-courses/category/${selectedCategory}`;
      }
      const response = await fetch(url);
      const result = await response.json();
      setCourses(result.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Try to set active course if authenticated
        await fetch(`${API_URL}/children-courses/progress/set-course`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId }),
        });
      }
    } catch (error) {
      console.warn('Could not set active course:', error);
    }
    // Navigate regardless of set-course success
    navigate(`/children/course/${courseId}`);
  };

  const categories = [
    { id: 'all', label: 'All Courses', icon: '📚' },
    { id: 'body-safety', label: 'Body Safety & Boundaries', icon: '🛡️' },
    { id: 'relationships', label: 'Child Labour', icon: '⚠️' },
    { id: 'boundaries', label: 'Child Marriage', icon: '💍' },
    { id: 'general', label: 'Online Safety', icon: '📱' },
  ];

  return (
    <div className="children-courses-page">
      {/* Header */}
      <div className="children-header">
        <h1>🛡️ Child Safety Learning</h1>
        <p>Story-based courses on sexual abuse, child labour, child marriage, and online exploitation</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <p>No courses available yet</p>
        </div>
      ) : (
        /* Courses Grid */
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              {course.imageSrc ? (
                <img src={course.imageSrc} alt={course.title} className="course-image" />
              ) : (
                <div className="course-icon">{course.icon}</div>
              )}
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-meta">
                <span className="age-group">Ages {course.ageGroup}</span>
                <span className="difficulty">{course.difficulty}</span>
              </div>
              <div className="course-units">
                {course.units && course.units.length > 0 && (
                  <p>{course.units.length} units</p>
                )}
              </div>
              <button
                className="start-btn"
                onClick={() => handleStartCourse(course.id)}
              >
                Start Learning
              </button>
            </div>
          ))}
        </div>
      )}

      {/* News Stories Section */}
      <ChildrenNewsStories onSelectStory={handlePlayNewsStory} />
    </div>
  );
};

export default ChildrenCoursesPage;
