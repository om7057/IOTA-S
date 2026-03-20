/**
 * Data Sanitization Utilities
 * Removes emoji and special characters from story options and content
 * Applied at data layer to prevent storage of unsanitized content
 */

/**
 * Normalize option text by removing leading emoji and special characters
 * Used at data layer to prevent unsanitized content from being stored
 * Regex: Unicode extended pictographics + variation selectors + common symbols
 * @param {string} text - Option text to normalize
 * @returns {string} Sanitized text
 */
export const normalizeOptionText = (text) => {
  if (typeof text !== 'string') {
    return String(text);
  }
  // Remove leading emoji (Unicode extended pictographics, variation selectors, common symbols)
  return text
    .replace(/^[\s\uFE0F\u200D\p{Extended_Pictographic}✓✔✗✕☑☒]+/gu, '')
    .trim();
};

/**
 * Sanitize story options array
 * @param {Array} options - Array of option objects or strings
 * @returns {Array} Sanitized options
 */
export const sanitizeStoryOptions = (options) => {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.map((option) => {
    if (typeof option === 'string') {
      return normalizeOptionText(option);
    }

    if (typeof option === 'object' && option !== null) {
      return {
        ...option,
        text: normalizeOptionText(option.text || ''),
      };
    }

    return option;
  });
};

/**
 * Sanitize story JSON structure (for interactive stories with scenes and choices)
 * @param {Object} storyJson - Story JSON structure with scenes and options
 * @returns {Object} Sanitized story JSON
 */
export const sanitizeStoryJson = (storyJson) => {
  if (!storyJson || typeof storyJson !== 'object') {
    return storyJson;
  }

  // Handle array of scenes
  if (Array.isArray(storyJson)) {
    return storyJson.map((scene) => sanitizeSingleScene(scene));
  }

  // Handle object with 'scenes' property
  if (Array.isArray(storyJson.scenes)) {
    return {
      ...storyJson,
      scenes: storyJson.scenes.map((scene) => sanitizeSingleScene(scene)),
    };
  }

  // If it's a single scene object
  if (storyJson.options) {
    return sanitizeSingleScene(storyJson);
  }

  return storyJson;
};

/**
 * Sanitize a single story scene
 * @param {Object} scene - Scene object with options
 * @returns {Object} Sanitized scene
 */
function sanitizeSingleScene(scene) {
  if (!scene || typeof scene !== 'object') {
    return scene;
  }

  const sanitized = { ...scene };

  if (Array.isArray(scene.options)) {
    sanitized.options = scene.options.map((option) => {
      if (typeof option === 'object' && option !== null) {
        return {
          ...option,
          text: normalizeOptionText(option.text || ''),
        };
      }
      return option;
    });
  }

  return sanitized;
}

/**
 * Sanitize challenge options (used in lessons/challenges)
 * @param {Array} options - Array of challenge options
 * @returns {Array} Sanitized options
 */
export const sanitizeChallengeOptions = (options) => {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.map((option) => {
    if (typeof option === 'string') {
      return normalizeOptionText(option);
    }

    if (typeof option === 'object' && option !== null) {
      return {
        ...option,
        text: normalizeOptionText(option.text || ''),
      };
    }

    return option;
  });
};
