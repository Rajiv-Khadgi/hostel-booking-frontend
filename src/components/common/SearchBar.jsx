import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import useDebounce from '../../hooks/useDebounce';

export default function SearchBar({ value, onChange, placeholder = "Search...", className = "w-full" }) {
    // Internal state for immediate visual feedback
    const [inputValue, setInputValue] = useState(value);
    const debouncedValue = useDebounce(inputValue, 500);

    // Sync internal state if external value changes (e.g., cleared by parent)
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Emit debounced value to parent
    useEffect(() => {
        // If the debounced value is different from the current parent value,
        // and it matches the current input (meaning the user has stopped typing),
        // then we update the parent.
        if (debouncedValue !== value && debouncedValue === inputValue) {
            onChange(debouncedValue);
        }
    }, [debouncedValue, onChange, value, inputValue]);

    const isSearching = inputValue !== value;

    return (
        <div className={`relative group ${className}`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                {isSearching ? (
                    <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                ) : (
                    <FiSearch className="text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" size={16} />
                )}
            </div>
            <input
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 rounded-xl border-0 bg-white ring-1 ring-inset ring-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/50 hover:ring-gray-300 transition-all duration-300 text-sm shadow-sm placeholder-gray-400 text-gray-900"
            />
            {inputValue && (
                <button
                    type="button"
                    onClick={() => {
                        setInputValue('');
                        onChange('');
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-full transition-all active:scale-95"
                >
                    <FiX size={15} />
                </button>
            )}
            {isSearching && (
                <div className="absolute -bottom-5 left-4 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">Searching...</span>
                </div>
            )}
        </div>
    );
}
