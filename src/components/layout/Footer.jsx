import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-emerald-100/70 pt-16 pb-8 border-t border-emerald-900 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">HomeSpace</h3>
            <p className="text-sm leading-relaxed max-w-xs transition-colors">
              Discover verified hostels and student residences across Nepal with ease. Your perfect stay is just a few clicks away.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors inline-block relative group">Home<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-400 transition-all group-hover:w-full"></span></Link></li>
              <li><Link to="/explore" className="hover:text-emerald-400 transition-colors inline-block relative group">Explore Hostels<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-400 transition-all group-hover:w-full"></span></Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors inline-block relative group">About Us<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-400 transition-all group-hover:w-full"></span></Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors inline-block relative group">Contact<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-400 transition-all group-hover:w-full"></span></Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              Contact Us
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-emerald-500 mt-1 shrink-0" size={18} />
                <span className="text-sm">Kathmandu, Bagmati<br />Nepal, 44600</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-emerald-500 shrink-0" size={18} />
                <span className="text-sm">+977 123 456 789</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-emerald-500 shrink-0" size={18} />
                <a href="mailto:support@homespace.com" className="text-sm hover:text-emerald-400 transition-colors">support@homespace.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-emerald-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} HomeSpace. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <span className="text-emerald-100/50">Verified Hostel Booking Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
