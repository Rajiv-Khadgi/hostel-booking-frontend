/**
 * Utility to map technical error responses into human-friendly, actionable messages.
 */

const ERROR_MAP = {
    // Auth Errors
    'Unauthorized': 'Please sign in to continue.',
    'Invalid or expired token': 'Your session has expired. Please log in again.',
    'User not found': 'Account not found. Please check your credentials.',
    
    // Booking Errors
    'Only students can request bookings.': 'Guest bookings are reserved for verified student accounts.',
    'Already booked': 'You already have an active request or booking for this room.',
    'No available beds': 'This room is currently full. Try another room type.',
    'Invalid dates': 'Please select a valid future date for your booking.',
    
    // Review Errors
    'Make sure you have a verified stay.': 'You can only review hostels where you have a confirmed previous stay.',
    'Review already exists': 'You have already shared your experience for this property.',
    
    // Global/Network
    'Network Error': 'Connection issue. Please check your internet and try again.',
    'Internal Server Error': 'Something went wrong on our end. We are looking into it.',
    'timeout': 'The request took too long. Please try again later.'
};

/**
 * Parses axios/API error and returns a friendly string
 * @param {Object} error - The error object from a catch block
 * @param {string} fallback - A default message if no mapping is found
 * @returns {string}
 */
export const getFriendlyErrorMessage = (error, fallback = 'An unexpected error occurred. Please try again.') => {
    // If it's a string error (direct from backend)
    const rawError = error?.response?.data?.error || error?.message || '';
    
    // Check for direct matches in our map
    if (ERROR_MAP[rawError]) {
        return ERROR_MAP[rawError];
    }

    // Check for substrings (e.g. "verified stay" anywhere in the error)
    if (typeof rawError === 'string') {
        for (const [key, value] of Object.entries(ERROR_MAP)) {
            if (rawError.toLowerCase().includes(key.toLowerCase())) {
                return value;
            }
        }
    }

    // Special handling for HTTP status codes if no specific message
    const status = error?.response?.status;
    if (status === 401) return ERROR_MAP['Unauthorized'];
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 404) return 'The requested resource was not found.';
    if (status >= 500) return ERROR_MAP['Internal Server Error'];

    return rawError || fallback;
};
