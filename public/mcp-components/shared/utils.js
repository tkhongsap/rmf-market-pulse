/**
 * Thai RMF Market Pulse - Shared Widget Utilities
 * Provides formatting, theme detection, and color helpers for widgets
 */

/**
 * Format a number with specified decimal places and optional currency
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {string} suffix - Optional suffix (e.g., '%', ' THB')
 * @returns {string} Formatted number
 */
function formatNumber(value, decimals = 2, suffix = '') {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  const formatted = Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return formatted + suffix;
}

/**
 * Format a percentage value
 * @param {number} value - The percentage value
 * @param {boolean} showSign - Whether to show + for positive values (default: true)
 * @returns {string} Formatted percentage
 */
function formatPercentage(value, showSign = true) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  const sign = showSign && value > 0 ? '+' : '';
  return sign + formatNumber(value, 2, '%');
}

/**
 * Format currency in Thai Baht
 * @param {number} value - The amount
 * @returns {string} Formatted currency
 */
function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  return formatNumber(value, 2, ' THB');
}

/**
 * Format an ISO date string to readable format
 * @param {string} dateString - ISO date string
 * @param {boolean} includeTime - Whether to include time (default: false)
 * @returns {string} Formatted date
 */
function formatDate(dateString, includeTime = false) {
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Get the current theme from ChatGPT
 * @returns {string} 'light' or 'dark'
 */
function getTheme() {
  try {
    // ChatGPT provides theme via window.openai.matchTheme()
    if (window.openai && typeof window.openai.matchTheme === 'function') {
      const theme = window.openai.matchTheme();
      return theme === 'dark' ? 'dark' : 'light';
    }
  } catch (error) {
    console.warn('Failed to get theme from window.openai:', error);
  }
  
  // Fallback: detect system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
}

/**
 * Apply theme to the document
 * @param {string} theme - 'light' or 'dark'
 */
function applyTheme(theme) {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }
}

/**
 * Initialize theme and listen for changes
 */
function initTheme() {
  const currentTheme = getTheme();
  applyTheme(currentTheme);
  
  // Listen for theme changes
  try {
    if (window.openai && typeof window.openai.addEventListener === 'function') {
      window.openai.addEventListener('themechange', (event) => {
        const newTheme = event.detail.theme === 'dark' ? 'dark' : 'light';
        applyTheme(newTheme);
      });
    }
  } catch (error) {
    console.warn('Failed to setup theme listener:', error);
  }
  
  // Fallback: listen to system preference changes
  if (window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', (e) => {
      applyTheme(e.matches ? 'dark' : 'light');
    });
  }
}

/**
 * Get color class for risk level
 * @param {number} riskLevel - Risk level (1-8)
 * @returns {string} CSS class name
 */
function getRiskColor(riskLevel) {
  if (riskLevel <= 3) {
    return 'badge-risk-low';
  } else if (riskLevel <= 5) {
    return 'badge-risk-medium';
  } else {
    return 'badge-risk-high';
  }
}

/**
 * Get risk level text description
 * @param {number} riskLevel - Risk level (1-8)
 * @returns {string} Risk description
 */
function getRiskText(riskLevel) {
  const levels = {
    1: 'Very Low Risk',
    2: 'Low Risk',
    3: 'Low-Medium Risk',
    4: 'Medium Risk',
    5: 'Medium-High Risk',
    6: 'High Risk',
    7: 'Very High Risk',
    8: 'Extremely High Risk',
  };
  
  return levels[riskLevel] || `Risk ${riskLevel}/8`;
}

/**
 * Get color for value change
 * @param {number} value - Change value
 * @returns {string} 'text-positive', 'text-negative', or ''
 */
function getChangeColor(value) {
  if (value > 0) {
    return 'text-positive';
  } else if (value < 0) {
    return 'text-negative';
  }
  return '';
}

/**
 * Get change indicator SVG icon
 * @param {number} value - Change value
 * @returns {string} SVG icon markup
 */
function getChangeArrow(value) {
  if (value > 0) {
    return '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle;"><polyline points="3 8 6 5 9 8"></polyline></svg>';
  } else if (value < 0) {
    return '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle;"><polyline points="3 4 6 7 9 4"></polyline></svg>';
  }
  return '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle;"><line x1="3" y1="6" x2="9" y2="6"></line></svg>';
}

/**
 * Safely access nested object properties
 * @param {object} obj - Object to access
 * @param {string} path - Dot-separated path (e.g., 'user.profile.name')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Value at path or defaultValue
 */
function getNestedValue(obj, path, defaultValue = null) {
  try {
    return path.split('.').reduce((current, prop) => current?.[prop], obj) ?? defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis
 */
function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Call ChatGPT tool (wrapper for window.openai.callTool)
 * @param {string} toolName - Name of the tool
 * @param {object} params - Tool parameters
 */
async function callTool(toolName, params) {
  try {
    if (window.openai && typeof window.openai.callTool === 'function') {
      await window.openai.callTool(toolName, params);
    } else {
      console.warn('window.openai.callTool not available');
    }
  } catch (error) {
    console.error('Error calling tool:', error);
  }
}

/**
 * Get tool output data from ChatGPT
 * @returns {object|null} Tool output data
 */
function getToolOutput() {
  try {
    if (window.openai && window.openai.toolOutput) {
      return window.openai.toolOutput;
    }
  } catch (error) {
    console.error('Error getting tool output:', error);
  }
  return null;
}

/**
 * Create a debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
