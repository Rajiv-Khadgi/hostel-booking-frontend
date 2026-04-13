import React from 'react';
import { FiTarget, FiShield, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-600 overflow-hidden py-32 text-center text-white">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-teal-400 rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-300 rounded-full blur-3xl opacity-15 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Redefining Student Accommodation</h1>
          <p className="text-lg md:text-xl text-emerald-100/90 font-medium">
            We exist to make finding the perfect hostel reliable, transparent, and absolutely stress-free.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        
        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              At HomeSpace, we recognize the challenges students face when relocating to new cities. Finding safe, affordable, and comfortable accommodation often involves endless searching, unverified listings, and hidden costs.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Our mission is to bridge this gap by offering a fully verified, transparent digital platform. We empower students to browse, compare, and connect with reputable hostel owners directly, ensuring peace of mind for both students and out-of-town parents.
            </p>
          </div>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80" alt="Students studying" className="w-full object-cover h-[450px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Why Choose Us?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We operate on four core pillars to deliver the best experience for our community.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiShield size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Verified</h3>
              <p className="text-gray-500 text-sm">Every property undergoes strict manual verification before being listed.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiTarget size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Transparent Pricing</h3>
              <p className="text-gray-500 text-sm">No hidden fees or surprise charges. What you see is exactly what you pay.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiUsers size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
              <p className="text-gray-500 text-sm">Real reviews from genuine students to help you make informed decisions.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Booking</h3>
              <p className="text-gray-500 text-sm">Streamlined online reservation processes to secure your stay instantly.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-emerald-900 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to find your new home?</h2>
            <p className="text-emerald-100/80 mb-10 text-lg">Join thousands of students who have already found their perfect space using our platform.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/explore" className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg">
                Explore Hostels
              </Link>
              <Link to="/register/student" className="bg-white hover:bg-gray-50 text-emerald-900 font-bold py-3 px-8 rounded-xl transition-colors shadow-lg">
                Create an Account
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
