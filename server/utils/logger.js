import environment from '../config/environment.js';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const getCurrentLevel = () => {
  return LOG_LEVELS[environment.LOG_LEVEL] || LOG_LEVELS.info;
};

const formatTimestamp = () => {
  return new Date().toISOString();
};

const formatMessage = (level, message, data = {}) => {
  const timestamp = formatTimestamp();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  const jsonData = Object.keys(data).length > 0 ? ` ${JSON.stringify(data)}` : '';
  return `${prefix} ${message}${jsonData}`;
};

export const logger = {
  error: (message, data) => {
    if (LOG_LEVELS.error <= getCurrentLevel()) {
      console.error(formatMessage('error', message, data));
    }
  },

  warn: (message, data) => {
    if (LOG_LEVELS.warn <= getCurrentLevel()) {
      console.warn(formatMessage('warn', message, data));
    }
  },

  info: (message, data) => {
    if (LOG_LEVELS.info <= getCurrentLevel()) {
      console.log(formatMessage('info', message, data));
    }
  },

  debug: (message, data) => {
    if (LOG_LEVELS.debug <= getCurrentLevel()) {
      console.debug(formatMessage('debug', message, data));
    }
  },
};

export default logger;
