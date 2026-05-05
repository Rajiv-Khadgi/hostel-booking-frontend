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
            <div className="flex flex-col items-center justify-center gap-3 text-center w-28 h-28 p-3 rounded-3xl bg-gray-50/80 border border-gray-100 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-100/50 transition-all group">
                <div className="w-12 h-12 flex flex-col items-center justify-center text-emerald-600/80 group-hover:scale-110 group-hover:text-emerald-600 transition-all">
                    {IconComponent
                        ? <IconComponent size={32} />
                        : <FiCheck size={32} className="text-emerald-500" />
                    }
                </div>
                <span className="text-[12px] font-bold text-gray-700 leading-tight group-hover:text-emerald-800 transition-colors">
                    {name}
                </span>
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div className="flex items-center gap-3 w-full">
                {IconComponent
                    ? <IconComponent size={20} className="text-emerald-600 shrink-0" />
                    : <FiCheck size={20} className="text-emerald-500 shrink-0" />
                }
                <span className="text-[15px] font-semibold tracking-tight text-gray-800 leading-tight">
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
