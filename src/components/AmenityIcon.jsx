import { FiCheck } from 'react-icons/fi';
import {
    // Amenities
    FaWifi, FaParking, FaBed, FaBath, FaDesktop, FaShower,
    FaSwimmingPool, FaBook, FaCouch, FaSnowflake, FaTv,
    FaUtensils, FaDumbbell, FaTshirt, FaTree, FaWindowMaximize,
    FaPaw, FaWheelchair, FaLock, FaFan, FaRecycle,
    // Services
    FaConciergeBell, FaShieldAlt, FaHandsWash, FaBroom,
    FaHamburger, FaShuttleVan, FaEnvelope, FaCalendarAlt,
    FaChalkboardTeacher, FaBicycle, FaTools, FaLaptop,
    FaCommentDots, FaFirstAid, FaUsers,
    // Gender
    FaMale, FaFemale, FaUserFriends,
} from 'react-icons/fa';

const ICON_MAP = {
    FaWifi, FaParking, FaBed, FaBath, FaDesktop, FaShower,
    FaSwimmingPool, FaBook, FaCouch, FaSnowflake, FaTv,
    FaUtensils, FaDumbbell, FaTshirt, FaTree, FaWindowMaximize,
    FaPaw, FaWheelchair, FaLock, FaFan, FaRecycle,
    FaConciergeBell, FaShieldAlt, FaHandsWash, FaBroom,
    FaHamburger, FaShuttleVan, FaEnvelope, FaCalendarAlt,
    FaChalkboardTeacher, FaBicycle, FaTools, FaLaptop,
    FaCommentDots, FaFirstAid, FaUsers,
    FaMale, FaFemale, FaUserFriends,
};

/**
 * Renders a single amenity or service with its icon.
 *
 * variant="pill"  — icon + text inline chip  (listing cards)
 * variant="tile"  — icon above text, vertical (detail page grid)
 */
export default function AmenityIcon({ icon, name, variant = 'pill' }) {
    const IconComponent = icon ? ICON_MAP[icon] : null;

    if (variant === 'tile') {
        return (
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    {IconComponent
                        ? <IconComponent size={18} />
                        : <FiCheck size={16} className="text-emerald-500" />
                    }
                </div>
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider leading-tight max-w-16">
                    {name}
                </span>
            </div>
        );
    }

    // pill variant — professional monochromatic icon, clean text
    return (
        <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-600 leading-none tracking-tight">
            {IconComponent
                ? <IconComponent size={14} className="text-emerald-600 shrink-0" />
                : <FiCheck size={14} className="text-emerald-500 shrink-0" />
            }
            {name}
        </span>
    );
}
