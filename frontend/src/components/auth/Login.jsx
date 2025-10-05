import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const { login, googleLogin, demoLogin, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoogleButton, setShowGoogleButton] = useState(true);
  const [googleTried, setGoogleTried] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {

    try {
      setIsSubmitting(true);
      await login(data);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Identity Services button setup with graceful fallback
  useEffect(() => {
    // Feature flag to fully disable Google Sign-In in environments where it's not configured
    const enableGoogle = String(process.env.REACT_APP_ENABLE_GOOGLE || '').toLowerCase() === 'true';
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    if (!enableGoogle) {
      setShowGoogleButton(false);
      return;
    }
    if (!clientId) {
      setShowGoogleButton(false);
      // eslint-disable-next-line no-console
      console.warn('REACT_APP_GOOGLE_CLIENT_ID not set. Google Sign-In will be disabled.');
      return;
    }

    setShowGoogleButton(true); // Ensure container stays visible while we attempt init

    const renderButton = () => {
      const target = document.getElementById('googleSignInDiv');
      if (!target) return false;
      // Clear any previously rendered button before re-rendering
      target.innerHTML = '';
      const container = target.closest('.google-btn-container');
      const containerWidth = container ? container.clientWidth : target.clientWidth;
      const width = Math.max(200, Math.floor(containerWidth));
      try {
        window.google.accounts.id.renderButton(target, {
          type: 'standard',
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          logo_alignment: 'left',
          width,
        });
        return target.childElementCount > 0;
      } catch {
        return false;
      }
    };

    const tryInitialize = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              if (response && response.credential) {
                await googleLogin(response.credential);
              }
            } catch {
              /* handled via toast */
            }
          },
          ux_mode: 'popup',
        });
        return renderButton();
      } catch {
        return false;
      }
    };

    // Poll for GIS readiness up to ~5 seconds
    let attempts = 0;
    const maxAttempts = 20; // 20 * 250ms = 5s
    const interval = setInterval(() => {
      attempts += 1;
      if (window.google?.accounts?.id) {
        const ok = tryInitialize();
        clearInterval(interval);
        setGoogleTried(true);
        if (!ok) {
          // If render still failed, hide the button
          setShowGoogleButton(false);
        }
      } else if (attempts >= maxAttempts) {
        // Script never became ready
        clearInterval(interval);
        setGoogleTried(true);
        setShowGoogleButton(false);
      }
    }, 250);

    // Re-render button on window resize to keep alignment
    const onResize = () => {
      if (window.google?.accounts?.id) {
        renderButton();
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', onResize);
    };
  }, [googleLogin]);

  const handleGoogleFallbackClick = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google client ID is not configured.');
      return;
    }
    if (!window.google?.accounts?.id) {
      toast.error('Google script not loaded yet. Please disable blockers and try again.');
      return;
    }
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (response?.credential) {
            try {
              await googleLogin(response.credential);
            } catch {
              // handled with toast in context
            }
          }
        },
        ux_mode: 'popup',
      });
      const target = document.getElementById('googleSignInDiv');
      if (target) {
        target.innerHTML = '';
        window.google.accounts.id.renderButton(target, {
          type: 'standard',
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          logo_alignment: 'left',
          width: Math.max(200, Math.floor((target.closest('.google-btn-container')?.clientWidth) || target.clientWidth)),
        });
        setShowGoogleButton(true);
      } else {
        toast.error('Google container not found.');
      }
    } catch {
      toast.error('Unable to initialize Google Sign-In.');
    }
  };

  // If already authenticated, redirect appropriately (supports stored intent)
  useEffect(() => {
    if (!isAuthenticated) return;
    const desired = localStorage.getItem('postLoginRedirect');
    let target = '/dashboard';
    if (user?.role === 'admin') {
      target = desired || '/admin';
    } else if (desired === '/admin') {
      // User intended to go to admin but is not an admin
      toast.error('You are not authorized to access the Admin Panel.');
    }
    // Clear intent once used
    if (desired) {
      localStorage.removeItem('postLoginRedirect');
    }
    navigate(target, { replace: true });
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card shadow-strong">
          <div className="card-header text-center">
            {/* Todo List App Title */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 font-mono tracking-wider">
              TODO LIST
            </h1>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4"
            >
              <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </motion.div>
            <h2 className="card-title text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="card-description mt-2">
              Sign in to your account to continue
            </p>
          </div>

          <div className="card-content">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    id="email"
                    className="input pl-10"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="input pl-10 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="btn btn-primary btn-lg w-full"
              >
                {loading || isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>

            </form>

            {/* Demo Admin Login (one-click) */}
            <div className="w-full text-center mt-6">
              <button
                type="button"
                className="btn btn-primary btn-lg w-full"
                disabled={loading || isSubmitting}
                onClick={async () => {
                  try {
                    const { user } = await demoLogin();
                    const target = user?.role === 'admin' ? '/admin' : '/dashboard';
                    navigate(target, { replace: true });
                  } catch {
                    // toast handled in context
                  }
                }}
              >
                Demo Admin Login
              </button>
            </div>

            {/* Google Sign-In (inside card-content to align with same padding) */}
            <div className="w-full mt-4 google-btn-container">
              {/* Always keep the target container in the DOM so fallback can use it */}
              <div id="googleSignInDiv" className={`w-full ${showGoogleButton ? '' : 'hidden'}`} />
              {!showGoogleButton && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleFallbackClick}
                    className="btn btn-ghost btn-lg w-full"
                    title="Sign in with Google"
                  >
                    Sign in with Google
                  </button>
                  {googleTried && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Google Sign-In couldn’t be rendered. Ensure the Google script is allowed and env is configured.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="card-footer flex-col space-y-4">
            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
              </span>
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Sign up here
              </Link>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400"
        >
          
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login; 