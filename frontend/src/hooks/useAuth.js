import { useState } from 'react';
import { loginUser } from '../utils/api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('sukhman_authenticated') === 'true';
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sukhman_user');
    return saved ? JSON.parse(saved) : { name: "Sukhman", role: "Aspiring NLS Scholar", targetExam: "CLAT 2027" };
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (password) => {
    setIsLoading(true);
    setError(null);
    try {
      const { ok, data } = await loginUser(password);
      if (ok && data.success) {
        setIsAuthenticated(true);
        setUser(data.user);
        localStorage.setItem('sukhman_authenticated', 'true');
        localStorage.setItem('sukhman_user', JSON.stringify(data.user));
        return true;
      } else {
        setError(data.message || "Incorrect secret key. Hint: Sukhman0118");
        return false;
      }
    } catch (err) {
      console.error("Auth login exception:", err);
      setError("Login network error. Please check connection.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('sukhman_authenticated');
    localStorage.removeItem('sukhman_user');
  };

  return {
    isAuthenticated,
    user,
    error,
    isLoading,
    login,
    logout
  };
}
