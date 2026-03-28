import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import { FiUser, FiMail, FiPhone, FiLock, FiCheckCircle, FiArrowRight, FiHome } from 'react-icons/fi';

const registrationSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required').min(2, 'Too short'),
  middle_name: Yup.string().nullable().optional(),
  last_name: Yup.string().required('Last name is required').min(2, 'Too short'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().required('Phone number is required').matches(/^[0-9]+$/, 'Must be only digits').min(10, 'Must be at least 10 digits'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain at least one symbol'),
  confirm_password: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
});

export default function OwnerRegister() {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // OTP Flow
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');

  const { registerOwner, requestRegisterOtp } = useAuth();
  const navigate = useNavigate();

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
      if (!otpStep) {
        await registrationSchema.validate(formData, { abortEarly: false });
        await requestRegisterOtp(formData.email);
        setSuccessMessage(`An OTP has been sent to ${formData.email}. Please enter it below.`);
        setOtpStep(true);
      } else {
        if (!otp || otp.length < 6) {
          setServerError('Please enter a valid 6-digit OTP');
          setIsSubmitting(false);
          return;
        }

        const payload = {
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'owner',
          otp
        };

        await registerOwner(payload);
        navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
      }
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      } else {
        setServerError(err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
        <div className="container mx-auto px-4 py-8 lg:py-12 flex justify-center items-center font-sans text-gray-900">
            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100">
                
                {/* Branding Panel (Top on mobile, Left on Desktop) */}
                <div className="lg:w-5/12 bg-emerald-900 relative overflow-hidden flex flex-col justify-center text-center lg:text-left text-white p-10 lg:p-14 order-1">
                    {/* Soft abstract background blobs */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 lg:-mr-32 lg:-mt-32 lg:w-96 lg:h-96 rounded-full bg-emerald-700 opacity-60 blur-3xl mix-blend-screen pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 lg:-ml-32 lg:-mb-32 lg:w-[30rem] lg:h-[30rem] rounded-full bg-black opacity-50 blur-3xl mix-blend-multiply pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-lg mx-auto lg:mx-0">
                        <Link to="/" className="inline-block mb-8 lg:mb-16 text-3xl font-extrabold tracking-tight">
                            Home<span className="text-emerald-400">Space</span>. <span className="text-sm font-normal text-emerald-200 uppercase tracking-widest ml-1 lg:ml-2 block lg:inline mt-1 lg:mt-0">For Owners</span>
                        </Link>

                        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6 leading-tight">
                            Manage your properties <br className="hidden lg:block"/>with confidence.
                        </h1>
                        <p className="text-base lg:text-lg text-emerald-100/90 mb-8 lg:mb-12 max-w-md mx-auto lg:mx-0 font-light">
                            Join the most trusted platform for student accommodations. Manage bookings, collect rent, and grow your occupancy seamlessly.
                        </p>

                        <div className="space-y-6 hidden sm:block mt-auto">
                            <div className="flex items-center space-x-4 bg-emerald-800/60 p-4 rounded-2xl backdrop-blur-md border border-emerald-600/50">
                                <div className="bg-emerald-500/30 p-3 rounded-full shrink-0">
                                    <FiHome className="h-6 w-6 text-emerald-300" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-white">Premium Property Network</p>
                                    <p className="text-sm text-emerald-200/80">Connect with thousands of verified students.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Panel (Bottom on mobile, Right on Desktop) */}
                <div className="w-full lg:w-7/12 flex flex-col justify-center px-6 sm:px-12 py-10 lg:py-14 order-2 bg-white">
                    <div className="w-full max-w-xl mx-auto relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="text-3xl font-extrabold text-emerald-800 tracking-tight">
              Home<span className="text-emerald-600">Space</span>.
            </Link>
          </div>

          <div className="text-center md:text-left mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Owner Account</h2>
            <p className="text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-emerald-700 hover:text-emerald-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="mb-10 flex items-center justify-between space-x-4">
            <div className="flex flex-col flex-1">
              <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${!otpStep ? 'bg-emerald-700' : 'bg-emerald-100'}`}></div>
              <span className={`text-xs mt-2 font-medium ${!otpStep ? 'text-emerald-700' : 'text-gray-400'} uppercase tracking-wider`}>Account Details</span>
            </div>
            <div className="flex flex-col flex-1">
              <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${otpStep ? 'bg-emerald-700' : 'bg-gray-100'}`}></div>
              <span className={`text-xs mt-2 font-medium ${otpStep ? 'text-emerald-700' : 'text-gray-400'} uppercase tracking-wider`}>Verification</span>
            </div>
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
            <div className="mb-8 border-l-4 border-emerald-600 bg-emerald-50 p-4 rounded-r-xl">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-emerald-600" />
                <div className="ml-3">
                  <p className="text-sm text-emerald-800 font-medium">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!otpStep ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">First Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FiUser className="h-5 w-5" />
                      </div>
                      <input
                        name="first_name"
                        type="text"
                        placeholder="e.g. Shyam"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-11 pr-4 py-3 border ${errors.first_name ? 'border-red-300 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-gray-50 hover:bg-white focus:bg-white`}
                      />
                    </div>
                    {errors.first_name && <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.first_name}</p>}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Last Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FiUser className="h-5 w-5" />
                      </div>
                      <input
                        name="last_name"
                        type="text"
                        placeholder="e.g. Sharma"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-11 pr-4 py-3 border ${errors.last_name ? 'border-red-300 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-gray-50 hover:bg-white focus:bg-white`}
                      />
                    </div>
                    {errors.last_name && <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.last_name}</p>}
                  </div>
                </div>

                {/* Middle Name (Optional Container) */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1">Middle Name (Optional)</label>
                  <div className="relative opacity-80 focus-within:opacity-100 transition-opacity">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <FiUser className="h-5 w-5" />
                    </div>
                    <input
                      name="middle_name"
                      type="text"
                      placeholder="e.g. Kumar"
                      value={formData.middle_name}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-gray-50 hover:bg-white focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FiMail className="h-5 w-5" />
                      </div>
                      <input
                        name="email"
                        type="email"
                        placeholder="shyam@hostels.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-11 pr-4 py-3 border ${errors.email ? 'border-red-300 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-gray-50 hover:bg-white focus:bg-white`}
                      />
                    </div>
                    {errors.email && <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FiPhone className="h-5 w-5" />
                      </div>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="98********"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-11 pr-4 py-3 border ${errors.phone ? 'border-red-300 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-gray-50 hover:bg-white focus:bg-white`}
                      />
                    </div>
                    {errors.phone && <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Password */}
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
                        value={formData.password}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-11 pr-4 py-3 border ${errors.password ? 'border-red-300 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-gray-50 hover:bg-white focus:bg-white`}
                      />
                    </div>
                    {errors.password && <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FiLock className="h-5 w-5" />
                      </div>
                      <input
                        name="confirm_password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-11 pr-4 py-3 border ${errors.confirm_password ? 'border-red-300 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-gray-50 hover:bg-white focus:bg-white`}
                      />
                    </div>
                    {errors.confirm_password && <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.confirm_password}</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mb-6 border-4 border-emerald-50 shadow-inner">
                    <FiMail className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
                  <p className="text-gray-500 px-4">
                    We've sent a 6-digit code to <span className="font-semibold text-emerald-800">{formData.email}</span>.
                  </p>
                </div>

                <div className="max-w-xs mx-auto mb-8">
                  <label className="block text-sm font-semibold tracking-wide text-gray-700 mb-3 text-center uppercase">
                    Verification Code
                  </label>
                  <input
                    name="otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="appearance-none block w-full px-6 py-4 border-2 border-emerald-300 focus:border-emerald-700 rounded-2xl shadow-sm placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 text-4xl text-center letter-spacing-[0.5em] font-mono font-bold text-gray-900 transition-all bg-white"
                    placeholder="------"
                  />
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-md text-[15px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-lg overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-600 to-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center">
                  {isSubmitting ? 'Processing...' : (otpStep ? 'Complete Registration' : 'Continue to Verification')}
                  {!isSubmitting && !otpStep && <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  {!isSubmitting && otpStep && <FiCheckCircle className="ml-2 w-5 h-5" />}
                </span>
              </button>

              {otpStep && (
                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  disabled={isSubmitting}
                  className="mt-4 w-full flex justify-center py-3 px-4 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  Edit Account Details
                </button>
              )}
            </div>
          </form>

          {/* Switch Role Link */}
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 mb-3 flex items-center justify-center">
              <span className="h-px w-8 bg-gray-200 mr-4"></span>
              Looking for a place to stay?
              <span className="h-px w-8 bg-gray-200 ml-4"></span>
            </p>
            <Link
              to="/register/student"
              className="inline-flex justify-center items-center py-2.5 px-6 rounded-xl text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors border border-emerald-200 hover:border-emerald-300"
            >
              Register as a Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
