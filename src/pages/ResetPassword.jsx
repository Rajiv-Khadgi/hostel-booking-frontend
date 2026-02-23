import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';
import api from '../api/axios';

const resetPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirm_password: Yup.string()
        .required('Confirm password is required')
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
});

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [formData, setFormData] = useState({ password: '', confirm_password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token || !email) {
            setError('Invalid password reset link. Please request a new one.');
            return;
        }

        try {
            await resetPasswordSchema.validate(formData, { abortEarly: false });
            setIsSubmitting(true);

            await api.post('/reset-password', {
                email,
                token,
                password: formData.password
            });

            setSuccess(true);
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                setError(err.inner[0].message);
            } else {
                setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl mx-auto flex items-center justify-center font-bold text-3xl shadow-sm">
                    H
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Create new password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Your new password must be different from previous used passwords.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">

                    {success ? (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
                                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Password reset</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Your password has been successfully reset. You can now sign in with your new password.
                            </p>
                            <Link
                                to="/login"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-all hover:shadow-md"
                            >
                                Continue to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4">
                                    <p className="text-sm text-red-600 text-center font-medium">{error}</p>
                                </div>
                            )}

                            {(!token || !email) && !error && (
                                <div className="mb-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                    <p className="text-sm text-yellow-700 text-center font-medium">
                                        Invalid password reset link. Please try requesting a new link from the forgot password page.
                                    </p>
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`appearance-none block w-full px-4 py-3 border ${error.includes('Password is') ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'
                                            } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        name="confirm_password"
                                        type="password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        className={`appearance-none block w-full px-4 py-3 border ${error.includes('match') ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-emerald-500'
                                            } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors bg-gray-50 focus:bg-white`}
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !token || !email}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-all hover:shadow-md"
                                    >
                                        {isSubmitting ? 'Resetting password...' : 'Reset password'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
