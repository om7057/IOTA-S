import { Navigate } from 'react-router-dom';

/**
 * AgeGate component that checks if user has selected their age group.
 * If not selected, redirects to age selection page.
 * If selected, redirects to the appropriate mode (child or teen).
 */
const AgeGate = ({ children, requiredMode }) => {
  const ageSelection = localStorage.getItem('age_selection');

  // If no age selection made, redirect to age selection
  if (!ageSelection) {
    return <Navigate to="/age-selection" replace />;
  }

  // If requiredMode is specified, check if it matches
  if (requiredMode) {
    if (requiredMode === 'preteen' && ageSelection !== 'preteen') {
      return <Navigate to="/teen" replace />;
    }
    if (requiredMode === 'teen' && ageSelection !== 'teen') {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

/**
 * Initial redirect component - redirects based on age selection
 */
export const InitialRedirect = () => {
  const ageSelection = localStorage.getItem('age_selection');

  if (!ageSelection) {
    return <Navigate to="/age-selection" replace />;
  }

  if (ageSelection === 'teen') {
    return <Navigate to="/teen" replace />;
  }

  // Default to child/preteen mode (home)
  return <Navigate to="/home" replace />;
};

export default AgeGate;
