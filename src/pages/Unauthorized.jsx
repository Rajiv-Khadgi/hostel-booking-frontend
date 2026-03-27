import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';

export default function Unauthorized() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                    <FaShieldAlt className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Access Denied
                </h2>
                <p className="mt-4 text-gray-600 max-w-sm mx-auto">
                    You don't have the necessary permissions to access this page. Please contact the administrator or go back to safety.
                </p>
                <div className="mt-8">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-bold rounded-2xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 shadow-emerald-200"
                    >
                        <FaArrowLeft className="text-xs" /> Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
