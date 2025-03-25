import React, { useState, createContext, useContext, useEffect } from 'react';

// Environment-based API URL
const API_URL = `https://k-to-drinks-management-system.onrender.com/api`;
console.log('API URL:', API_URL);

// Create AuthContext
const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (isAuthenticated && storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Logging in with credentials:', credentials);

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        const userData = {
          username: data.username,
          firstName: data.first_name,
          lastName: data.last_name,
        };
        setUser(userData);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      } else {
        console.error('Login failed:', data.error);
        setError(data.error || 'Invalid Credentials');
        return false;
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please try again later.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    console.log('User logged out.');
  };

  return (
    <AuthContext.Provider value={{ user, error, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export const useAuth = () => useContext(AuthContext);
