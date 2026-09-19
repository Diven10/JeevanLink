import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API = 'http://localhost:5000';
const SESSION_TOKEN = 'jl_token';
const SESSION_USER = 'jl_user';

// sessionStorage is intentionally used instead of localStorage.
// Each browser tab gets its own authenticated session, so you can demo
// a hospital account in one tab and a donor account in another.
const readSessionUser = () => {
  try { return JSON.parse(sessionStorage.getItem(SESSION_USER) || 'null'); } catch { return null; }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readSessionUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Remove the old shared localStorage session from previous builds.
    // It is the reason different tabs used to force each other into the same account.
    localStorage.removeItem('token');
    localStorage.removeItem('jl_user');

    const token = sessionStorage.getItem(SESSION_TOKEN);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchMe();
  }, []);

  const fetchMe = async () => {
    try {
      const token = sessionStorage.getItem(SESSION_TOKEN);
      if (!token) {
        setUser(null);
        return;
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await axios.get(`${API}/api/auth/me`);
      setUser(res.data);
      sessionStorage.setItem(SESSION_USER, JSON.stringify(res.data));
    } catch (error) {
      // Only clear the tab session when the server explicitly rejects the token.
      // A temporary backend/network error should not log the user out on refresh.
      if (error.response?.status === 401) {
        sessionStorage.removeItem(SESSION_TOKEN);
        sessionStorage.removeItem(SESSION_USER);
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password });
    const { token } = res.data;
    sessionStorage.setItem(SESSION_TOKEN, token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await fetchMe();
  };

  const register = async (data) => {
    await axios.post(`${API}/api/auth/register`, data);
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_TOKEN);
    sessionStorage.removeItem(SESSION_USER);
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
