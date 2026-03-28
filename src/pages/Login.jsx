import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import { FiMail, FiLock, FiCheckCircle, FiShield, FiArrowRight } from 'react-icons/fi';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle redirect messages
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear state so refresh doesn't keep showing it
      window.history.replaceState({}, document.title)
    }

    // Handle session expired messages
    const expiredMsg = localStorage.getItem('sessionExpiredMessage');
    if (expiredMsg) {
      setServerError(expiredMsg);
      localStorage.removeItem('sessionExpiredMessage');
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await loginSchema.validate(formData, { abortEarly: false });
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      } else {
        setServerError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 flex justify-center items-center font-sans text-gray-900">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100">
                
                {/* Branding Panel (Top on mobile, Left on Desktop) */}
                <div className="lg:w-5/12 bg-emerald-800 relative overflow-hidden flex flex-col justify-center text-center lg:text-left text-white p-10 lg:p-14 order-1">
                    {/* Soft abstract background blobs */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 lg:-mr-32 lg:-mt-32 lg:w-96 lg:h-96 rounded-full bg-emerald-600 opacity-60 blur-3xl mix-blend-screen pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 lg:-ml-32 lg:-mb-32 lg:w-[30rem] lg:h-[30rem] rounded-full bg-emerald-950 opacity-50 blur-3xl mix-blend-multiply pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-lg mx-auto lg:mx-0">
                        <Link to="/" className="inline-block mb-8 lg:mb-16 text-3xl font-extrabold tracking-tight">
                            Home<span className="text-emerald-400">Space</span>.
                        </Link>

                        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6 leading-tight">
                            Welcome back to <br className="hidden lg:block"/>your comfort zone.
                        </h1>
                        <p className="text-base lg:text-lg text-emerald-100/90 mb-8 lg:mb-12 max-w-md mx-auto lg:mx-0 font-light">
                            Sign in to manage your bookings, message property owners, and explore new potential homes.
                        </p>

                        <div className="space-y-6 hidden sm:block mt-auto">
                            <div className="flex items-center space-x-4 bg-emerald-900/40 p-4 rounded-2xl backdrop-blur-md border border-emerald-600/30">
                                <div className="bg-emerald-500/20 p-3 rounded-full shrink-0">
                                    <FiShield className="h-6 w-6 text-emerald-200" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-white">Secure Access</p>
                                    <p className="text-sm text-emerald-200/80">Your privacy and data are always protected.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Panel (Bottom on mobile, Right on Desktop) */}
                <div className="w-full lg:w-7/12 flex flex-col justify-center px-6 sm:px-12 py-10 lg:py-14 order-2 bg-white">
                    <div className="w-full max-w-md mx-auto relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="text-3xl font-extrabold text-emerald-700 tracking-tight">
              Home<span className="text-emerald-500">Space</span>.
            </Link>
          </div>

          <div className="text-center md:text-left mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign into your account</h2>
            <p className="text-gray-500">
              Don't have an account?{' '}
              <Link to="/register/student" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                Create one now
              </Link>
            </p>
          </div>

          {/* Alerts */}
          {serverError && (
            <div className="mb-8 border-l-4 border-red-500 bg-red-50 p-4 rounded-r-xl animate-pulse">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{serverError}</p>
                </div>
              </div>
            </div>
          )}
          {successMessage && (
            <div className="mb-8 border-l-4 border-emerald-500 bg-emerald-50 p-4 rounded-r-xl">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-emerald-500" />
                <div className="ml-3">
                  <p className="text-sm text-emerald-700 font-medium">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiMail className="h-5 w-5" />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="ram@example.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-11 pr-4 py-3 border ${errors.email ? 'border-red-300 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50 hover:bg-white focus:bg-white`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiLock className="h-5 w-5" />
                </div>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-11 pr-4 py-3 border ${errors.password ? 'border-red-300 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50 hover:bg-white focus:bg-white`}
                />
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-md text-[15px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-lg overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-500 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center">
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                  {!isSubmitting && <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </div>
          </form>

          {/* Switch Role Link */}
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 mb-3 flex items-center justify-center">
              <span className="h-px w-8 bg-gray-200 mr-4"></span>
              Are you a property owner?
              <span className="h-px w-8 bg-gray-200 ml-4"></span>
            </p>
            <Link
              to="/register/owner"
              className="inline-flex justify-center items-center py-2.5 px-6 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors border border-emerald-100 hover:border-emerald-200"
            >
              List your property
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
