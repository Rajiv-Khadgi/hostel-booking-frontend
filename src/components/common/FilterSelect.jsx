import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function FilterSelect({ value, onChange, options, icon: Icon, className = "", configObject = null, defaultLabel = "All" }) {
    // Allows passing an object where values are keys and labels are inside config
    const selectOptions = configObject 
        ? Object.entries(configObject).map(([val, cfg]) => ({ value: val, label: cfg.label || cfg }))
        : options || [];

    return (
        <div className={`relative group ${className}`}>
            {Icon && (
                <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
            )}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full ${Icon ? 'pl-11' : 'pl-5'} pr-10 py-2.5 rounded-xl border-0 bg-white ring-1 ring-inset ring-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/50 hover:ring-gray-300 transition-all duration-300 appearance-none shadow-sm cursor-pointer text-sm text-gray-900`}
            >
                <option value="ALL">{defaultLabel}</option>
                {selectOptions.map((opt, i) => (
                    <option key={i} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <FiChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
        </div>
    );
}
