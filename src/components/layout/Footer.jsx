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
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                <FiFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                <FiTwitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                <FiInstagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors inline-block relative group">Home<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-400 transition-all group-hover:w-full"></span></Link></li>
              <li><Link to="/explore" className="hover:text-emerald-400 transition-colors inline-block relative group">Explore<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-400 transition-all group-hover:w-full"></span></Link></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors inline-block relative group">About Us<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-400 transition-all group-hover:w-full"></span></a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors inline-block relative group">Contact<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-400 transition-all group-hover:w-full"></span></a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              Support
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-emerald-400 transition-colors inline-block relative group">Help Center<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-400 transition-all group-hover:w-full"></span></a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors inline-block relative group">Safety Information<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-400 transition-all group-hover:w-full"></span></a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors inline-block relative group">Cancellation Options<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-400 transition-all group-hover:w-full"></span></a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors inline-block relative group">Terms of Service<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-400 transition-all group-hover:w-full"></span></a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              Contact Us
            </h4>
            <ul className="space-y-4">
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
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span className="text-emerald-800/60">•</span>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <span className="text-emerald-800/60">•</span>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
