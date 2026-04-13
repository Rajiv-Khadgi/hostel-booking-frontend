import { FaMale, FaFemale, FaUserFriends } from 'react-icons/fa';

export const GENDER_CONFIG = {
    BOYS: { label: 'Boys Only', Icon: FaMale, badge: 'bg-blue-50 text-blue-600 border-blue-100' },
    GIRLS: { label: 'Girls Only', Icon: FaFemale, badge: 'bg-pink-50 text-pink-600 border-pink-100' },
    COED: { label: 'Co-Ed', Icon: FaUserFriends, badge: 'bg-violet-50 text-violet-600 border-violet-100' },
};

export const avgRating = (reviews) =>
    reviews?.length
        ? (reviews.reduce((a, r) => a + Number(r.rating), 0) / reviews.length).toFixed(1)
        : null;

export const minPrice = (rooms) =>
    rooms?.length ? Math.min(...rooms.map(r => Number(r.price))) : null;

export const totalBeds = (rooms) =>
    rooms?.reduce((a, r) => a + r.available_beds, 0) ?? 0;

/**
 * Normalizes image paths to work with both Cloudinary (full URLs) 
 * and local storage (relative paths requiring server prefix).
 */
export const getImageUrl = (path, baseURL) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanBaseURL = baseURL.replace('/api', '');
    return `${cleanBaseURL}${path.startsWith('/') ? '' : '/'}${path}`;
};
