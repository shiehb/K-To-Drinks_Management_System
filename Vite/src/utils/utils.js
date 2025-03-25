// utils.js

// String manipulation utilities
export const capitalizeEachWord = (str) => {
    if (typeof str !== 'string') return '';
    return str.toLowerCase().split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Date formatting utilities
  export const formatDate = (dateString, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    try {
      return new Date(dateString).toLocaleDateString(undefined, defaultOptions);
    } catch (e) {
      console.error('Invalid date format:', dateString);
      return 'Invalid date';
    }
  };
  
  // API response handler
  export const handleApiResponse = async (response) => {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }
    return response.json();
  };
  
  // CSV generation utilities
  export const generateCSVContent = (data, headers) => {
    const headerRow = headers.join(',');
    const dataRows = data.map(item => 
      headers.map(header => `"${String(item[header] || '').replace(/"/g, '""')}"`)
    );
    return [headerRow, ...dataRows].join('\n');
  };
  
  // Local storage utilities
  export const loadState = (key) => {
    try {
      const serializedState = localStorage.getItem(key);
      return serializedState ? JSON.parse(serializedState) : null;
    } catch (e) {
      console.error('Failed to load state:', e);
      return null;
    }
  };
  
  export const saveState = (key, state) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(key, serializedState);
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  };