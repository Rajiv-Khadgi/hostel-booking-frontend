import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaCalendarAlt, FaCreditCard, FaComments, FaBuilding, FaShieldAlt, FaArrowRight } from "react-icons/fa";
import { Typewriter } from 'react-simple-typewriter';
import HostelCard from "../components/common/HostelCard";
import TestimonialCard from "../components/TestimonialCard";
import api from "../api/axios";
import { avgRating } from "../utils/hostelUtils";

// Realistically looking dummy data for UI display
const dummyHostels = [];


const dummyTestimonials = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Computer Science Student",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    quote: "HomeSpace made finding my senior year apartment so effortless. The virtual tours were accurate, and setting up payments through the platform gave me such peace of mind."
  },
  {
    id: 2,
    name: "David Chen",
    role: "Exchange Student",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    quote: "Moving to a new country was stressful, but booking my room here wasn't. The platform verified the property, so I knew I wouldn't be scammed. Highly recommend!"
  },
  {
    id: 3,
    name: "Amanda Rivera",
    role: "Property Manager",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    rating: 4,
    quote: "Listing our student blocks on this platform completely streamlined our onboarding. The chat feature lets us connect directly with interested students fast."
  }
];

export default function Home() {
  const [featuredHostels, setFeaturedHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopHostels = async () => {
      try {
        const res = await api.get('/hostels?sortBy=rating&limit=3');
        const hostels = res.data.hostels || [];

        setFeaturedHostels(hostels);
      } catch (err) {
        console.error("Failed to fetch hostels for home page", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopHostels();
  }, []);

  return (
    <div className="font-sans text-gray-800 bg-white selection:bg-emerald-100 selection:text-emerald-900">

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-gray-100">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-emerald-50 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-teal-50 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 via-white/80 to-white/95 backdrop-blur-[1px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Hero Content */}
            <div className="text-center lg:text-left max-w-3xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-sm font-medium text-emerald-600 mb-8 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                The New Standard of Student Housing
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8">
                Discover Your <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 h-[1.3em] inline-block">
                  <Typewriter
                    words={['Residence', 'Safe Haven', 'Next Home', 'Perfect Space']}
                    loop={true}
                    cursor
                    cursorStyle='|'
                    typeSpeed={70}
                    deleteSpeed={50}
                    delaySpeed={2000}
                  />
                </span>
              </h1>

              <p className="mt-4 text-lg sm:text-xl text-gray-600 font-light leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
                Join an exclusive network of verified student accommodations. Schedule automated visits, process secure payments, and connect directly with property owners.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Link
                  to="/register/student"
                  className="w-full sm:w-auto bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl shadow-[0_8px_30px_rgb(5,150,105,0.25)] hover:bg-emerald-700 hover:shadow-[0_8px_30px_rgb(5,150,105,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Find Accommodation
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register/owner"
                  className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 font-semibold px-8 py-4 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                >
                  List Your Property
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-500"><FaShieldAlt /></div> 100% Verified
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-500"><FaCreditCard /></div> Secure Payments
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-500"><FaComments /></div> Direct Connect
                </div>
              </div>
            </div>

            {/* Hero Image/Visual (Professional & Modern presentation) */}
            <div className="relative max-w-lg md:max-w-xl lg:max-w-none mx-auto w-full hidden md:block">
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="flex flex-col gap-4 pt-12">
                  <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                    <img
                      src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600"
                      alt="Modern student room"
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                    <img
                      src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600"
                      alt="Study area"
                      className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-4 pb-12">
                  <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100 relative">
                    <img
                      src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"
                      alt="Students in common area"
                      className="w-full h-[22rem] object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/50 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold text-gray-800">120+ Active listings</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section (New) */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3 drop-shadow-sm">Premium Selection</h2>
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">Featured Accommodations</h3>
            </div>
            <Link to="/explore" className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-2 group">
              View All Properties <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-3xl h-[464px] w-full border border-gray-200"></div>
              ))
            ) : featuredHostels.length > 0 ? (
              featuredHostels.map(hostel => (
                <HostelCard key={hostel.hostel_id} hostel={hostel} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-10 text-lg font-medium">No properties available yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-24 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3 drop-shadow-sm">Streamlined Process</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How HomeSpace Works</h3>
            <p className="text-gray-600 text-lg">We've eliminated the friction in finding student housing. From discovery to move-in, everything happens in four simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Discover", desc: "Filter through premium, verified student residences near your campus.", icon: FaBuilding },
              { step: "02", title: "Tour", desc: "Schedule digital or physical visits directly through our platform.", icon: FaCalendarAlt },
              { step: "03", title: "Reserve", desc: "Secure your room instantly with our encrypted payment gateway.", icon: FaCreditCard },
              { step: "04", title: "Connect", desc: "Manage your stay and chat with property managers in real-time.", icon: FaComments },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-[0_20px_50px_-12px_rgba(5,150,105,0.15)] transition-all duration-300 relative overflow-hidden group hover:-translate-y-2 cursor-default">
                  <div className="absolute top-0 right-0 p-6 text-6xl font-extrabold text-gray-50 opacity-60 group-hover:text-emerald-50/50 transition-colors pointer-events-none">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 relative z-10 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm group-hover:shadow-[0_8px_30px_rgb(5,150,105,0.3)] group-hover:scale-110 transform">
                    <Icon className="text-2xl" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 relative z-10 group-hover:text-emerald-700 transition-colors">{item.title}</h4>
                  <p className="text-gray-600 font-light leading-relaxed relative z-10 group-hover:text-gray-800 transition-colors">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section (New) */}
      <section className="py-24 bg-emerald-950 relative overflow-hidden text-white">
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-800 rounded-l-[200px] opacity-30 transform translate-x-1/3 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500 rounded-full opacity-20 transform -translate-x-1/2 translate-y-1/2 blur-[80px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-sm font-bold tracking-widest text-emerald-400 uppercase mb-3 shadow-sm">Community Trust</h2>
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">What Our Users Say</h3>
            <p className="text-emerald-100/80 text-lg">Don't just take our word for it. Here's what students and property owners think about their HomeSpace experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dummyTestimonials.map(testimonial => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[2.5rem] p-10 sm:p-16 lg:p-20 text-center relative overflow-hidden shadow-2xl border border-gray-800 group">
            {/* Soft geometric background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent group-hover:scale-105 transition-transform duration-1000"></div>
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">Elevate Your Living Experience</h2>
              <p className="text-gray-300 text-lg sm:text-xl font-light mb-10 leading-relaxed">
                Join thousands of students and property owners who trust HomeSpace for their accommodation needs. Experience the new standard in student housing today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register/student" className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                  Get Started For Free
                  <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                <Link to="/contact" className="bg-white/10 text-white backdrop-blur-md border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all duration-300">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
