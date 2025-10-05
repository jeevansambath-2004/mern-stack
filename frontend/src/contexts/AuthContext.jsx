import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(undefined);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'SET_TOKEN':
      return { ...state, token: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const { user } = await apiService.getProfile();
          dispatch({ type: 'SET_USER', payload: user });
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { user, token } = await apiService.login(credentials);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: token });
      
      toast.success('Login successful!');
    } catch (error) {
      const message = error?.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const googleLogin = async (idToken) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { user, token } = await apiService.googleLogin(idToken);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: token });

      toast.success('Logged in with Google!');
    } catch (error) {
      const message = error?.response?.data?.error || 'Google login failed';
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const demoLogin = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { user, token } = await apiService.demoAdminLogin();

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: token });

      toast.success('Logged in as Demo Admin');
      return { user, token };
    } catch (error) {
      const message = error?.response?.data?.error || 'Demo admin login failed';
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { user, token } = await apiService.register(credentials);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: token });
      
      toast.success('Registration successful!');
    } catch (error) {
      const message = error?.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { user } = await apiService.updateProfile(data);
      
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'UPDATE_USER', payload: user });
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      const message = error?.response?.data?.error || 'Profile update failed';
      toast.error(message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    googleLogin,
    demoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};