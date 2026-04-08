import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
    if (totalPages <= 1) return null;

    // Advanced truncation logic
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (page >= totalPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="mt-8 px-5 py-4 flex flex-col sm:flex-row items-center justify-between bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 gap-4 transition-all hover:shadow-md">
            {totalItems !== undefined && pageSize !== undefined ? (
                <p className="text-xs text-gray-500 whitespace-nowrap bg-gray-50/80 px-3 py-1.5 rounded-lg border border-gray-100">
                    Showing <span className="font-medium text-gray-900">{(page - 1) * pageSize + 1}</span>–<span className="font-medium text-gray-900">{Math.min(page * pageSize, totalItems)}</span> of <span className="font-medium text-gray-900">{totalItems}</span>
                </p>
            ) : <div />}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto justify-center">
                <button
                    onClick={() => {
                        onPageChange(Math.max(1, page - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === 1}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 bg-white ring-1 ring-inset ring-gray-200 shadow-sm hover:bg-gray-50 hover:text-emerald-600 hover:ring-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:ring-gray-200 transition-all duration-200 active:scale-95"
                >
                    <FiChevronLeft size={18} strokeWidth={2} />
                </button>
                {getPageNumbers().map((p, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            if (p !== '...') {
                                onPageChange(p);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                        disabled={p === '...'}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm transition-all duration-200 ${
                            p === page 
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/40 font-medium active:scale-95' 
                                : p === '...'
                                ? 'text-gray-400 cursor-default'
                                : 'text-gray-600 bg-white ring-1 ring-inset ring-gray-200 shadow-sm hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200 active:scale-95'
                        }`}
                    >
                        {p}
                    </button>
                ))}
                <button
                    onClick={() => {
                        onPageChange(Math.min(totalPages, page + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === totalPages}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 bg-white ring-1 ring-inset ring-gray-200 shadow-sm hover:bg-gray-50 hover:text-emerald-600 hover:ring-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:ring-gray-200 transition-all duration-200 active:scale-95"
                >
                    <FiChevronRight size={18} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}
