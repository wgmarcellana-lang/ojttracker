import { useState } from 'react';
import { loginWithCredentials } from '../services';

export function useAuth() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const updateLoginForm = (key, value) => {
    setLoginForm((current) => ({ ...current, [key]: value }));
  };

  const login = async () => {
    const result = await loginWithCredentials(loginForm);
    setToken(result.accessToken || '');
    setUser(result.user);
    return result;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setLoginForm({ username: '', password: '' });
  };

  return {
    token,
    user,
    loginForm,
    updateLoginForm,
    login,
    logout,
  };
}
