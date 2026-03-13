import { useState } from 'react';
import { fetchSession, loginWithCredentials } from '../services';

const inferRoleFromRedirectPath = (redirectPath = '') => {
  if (redirectPath.startsWith('/admin')) {
    return 'admin';
  }

  if (redirectPath.startsWith('/supervisors')) {
    return 'supervisor';
  }

  if (redirectPath.startsWith('/interns')) {
    return 'intern';
  }

  return '';
};

export function useAuth() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const updateLoginForm = (key, value) => {
    setLoginForm((current) => ({ ...current, [key]: value }));
  };

  const login = async () => {
    const result = await loginWithCredentials(loginForm);
    const nextToken = result.accessToken || '';
    const session = await fetchSession(nextToken);
    const redirectPath = result.redirectPath || session.redirectPath || '';
    const role = inferRoleFromRedirectPath(redirectPath);

    setToken(nextToken);
    setUser(session.authenticated && role ? {
      username: String(loginForm.username || '').trim(),
      role,
    } : null);
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
