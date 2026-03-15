import { validate as uuidValidate } from 'uuid';

export const validators = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Password validation (min 6 chars, at least 1 uppercase, 1 number)
  isValidPassword: (password) => {
    if (typeof password !== 'string') return false;
    return password.length >= 6 && /[A-Z]/.test(password) && /\d/.test(password);
  },

  // UUID validation
  isValidUUID: (uuid) => {
    return uuidValidate(uuid);
  },

  // Age validation (5-19 for kids/teens, 18+ for counselors)
  isValidAge: (age, minAge = 5, maxAge = 19) => {
    const num = parseInt(age);
    return !isNaN(num) && num >= minAge && num <= maxAge;
  },

  // Name validation (2-50 chars, letters/spaces only)
  isValidName: (name) => {
    if (typeof name !== 'string') return false;
    return name.length >= 2 && name.length <= 50 && /^[a-zA-Z\s]+$/.test(name);
  },

  // URL validation
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Enum validation
  isValidEnum: (value, enumValues) => {
    return enumValues.includes(value);
  },

  // Mood validation
  isValidMood: (mood) => {
    const validMoods = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'suspicious'];
    return validators.isValidEnum(mood, validMoods);
  },

  // Mood intensity validation (1-10)
  isValidMoodIntensity: (intensity) => {
    const num = parseInt(intensity);
    return !isNaN(num) && num >= 1 && num <= 10;
  },

  // User type validation
  isValidUserType: (userType) => {
    const validTypes = ['child', 'teenager', 'counselor', 'parent'];
    return validators.isValidEnum(userType, validTypes);
  },

  // Gender validation
  isValidGender: (gender) => {
    const validGenders = ['male', 'female', 'other', 'prefer-not'];
    return validators.isValidEnum(gender, validGenders);
  },

  // Tags validation (array of max 50 char strings)
  isValidTags: (tags) => {
    return (
      Array.isArray(tags) &&
      tags.every((tag) => typeof tag === 'string' && tag.length <= 50)
    );
  },

  // Required field check
  isRequired: (value) => {
    return value !== null && value !== undefined && value !== '';
  },

  // Pagination validation
  isValidPagination: (page, limit) => {
    const p = parseInt(page);
    const l = parseInt(limit);
    return !isNaN(p) && !isNaN(l) && p >= 1 && l >= 1 && l <= 100;
  },
};

export default validators;
