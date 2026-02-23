import React from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaCalendarAlt, FaCreditCard, FaComments, FaBuilding, FaShieldAlt } from "react-icons/fa";

export default function Home() {
  return (
    <div className="font-sans text-gray-800">

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-white to-gray-50 opacity-70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8">
              Find Your Perfect <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Student Residence</span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed mb-10">
              A premium, verified network of student accommodations. Schedule digital visits, process secure payments, and manage your stay seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register/student"
                className="w-full sm:w-auto bg-emerald-600 text-white font-medium px-8 py-4 rounded-xl shadow-[0_8px_30px_rgb(5,150,105,0.2)] hover:bg-emerald-700 hover:-translate-y-0.5 transition-all duration-200"
              >
                Find Accomodation
              </Link>
              <Link
                to="/register/owner"
                className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 font-medium px-8 py-4 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                List Your Property
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-emerald-500 text-lg" /> 100% Verified Properties
              </div>
              <div className="flex items-center gap-2">
                <FaCreditCard className="text-emerald-500 text-lg" /> Secure Digital Payments
              </div>
              <div className="flex items-center gap-2">
                <FaComments className="text-emerald-500 text-lg" /> Direct Owner Chat
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3">Streamlined Process</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">How HomeSpace Works</h3>
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
                <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 text-5xl font-extrabold text-gray-50 opacity-50 group-hover:text-emerald-50 transition-colors">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600 relative z-10">
                    <Icon className="text-xl" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 relative z-10">{item.title}</h4>
                  <p className="text-gray-600 font-light leading-relaxed relative z-10">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent"></div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 relative z-10">Elevate Your Living Experience</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 relative z-10 font-light">
              Join thousands of students and property owners who trust HomeSpace for their accommodation needs. Experience the new standard in student housing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link to="/register/student" className="bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-emerald-400 transition-colors">
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
