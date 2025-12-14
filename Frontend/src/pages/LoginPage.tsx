import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginSchema, type LoginFormData } from '../utils/validation';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear auth errors when component mounts or form changes
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data);
      // Navigation will be handled by the useEffect above
    } catch (error) {
      // Error is already set in the auth context
      // We can also set form-specific errors if needed
      if (error instanceof Error && error.message.includes('Invalid credentials')) {
        setFormError('email', { message: 'Invalid email or password' });
        setFormError('password', { message: 'Invalid email or password' });
      }
    }
  };

  // Show loading spinner while checking authentication status
  if (isLoading && !isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 shadow-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo/Icon area */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8 transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="mt-3 text-gray-600 font-medium">
              Sign in to access your Resource Manager
            </p>
            <div className="mt-4 h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto"></div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Global error message */}
            {error && (
              <div className="rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-4 animate-shake">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-red-700 font-medium">{error}</div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Email field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl bg-gray-50/50 backdrop-blur-sm transition-all duration-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-blue-500/25 ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                    }`}
                    placeholder="john@example.com"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    {...register('password')}
                    type="password"
                    autoComplete="current-password"
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl bg-gray-50/50 backdrop-blur-sm transition-all duration-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-blue-500/25 ${
                      errors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                    }`}
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-semibold rounded-2xl text-white transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-blue-500/50 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed scale-95'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 active:scale-95'
                }`}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <svg className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  )}
                </span>
                {isSubmitting ? 'Signing you in...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Secure access to your resources
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;