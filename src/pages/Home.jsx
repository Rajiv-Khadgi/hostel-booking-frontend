import React from "react";
import { Link } from "react-router-dom";
import HeroImage from "../assets/images/image.png";
import { FaCheckCircle, FaCalendarAlt, FaCreditCard, FaComments } from "react-icons/fa";
import { Typewriter } from "react-simple-typewriter";

export default function Home() {
  return (
    <div className="pt-24">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-indigo-50 via-purple-50 to-emerald-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-32 flex flex-col-reverse md:flex-row items-center gap-12 relative z-10">
          
          {/* Left Side: Text */}
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-indigo-900 tracking-tight leading-tight drop-shadow-lg">
              <Typewriter
                words={["Find Your Perfect Student Home", "Book With Confidence", "Discover Verified Hostels"]}
                loop={0} // 0 = infinite
                cursor
                cursorStyle="|"
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={2000}
              />
            </h1>
            <p className="mt-6 text-lg text-indigo-700 max-w-lg drop-shadow-sm">
              Discover verified hostels, schedule visits, and book your room with confidence using HomeSpace.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                    to="/register/student"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transform transition"
                >
                    Sign Up
                </Link>

                <Link
                    to="/register/owner"
                    className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transform transition"
                >
                    List a Hostel
                </Link>
                </div>

          </div>

          {/* Right Side: Hero Image with floating badges */}
          <div className="md:w-1/2 flex justify-center md:justify-end relative">
            <div className="relative w-full max-w-md md:max-w-xl">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform -rotate-3 hover:rotate-0 transition duration-500">
                <img
                  src={HeroImage}
                  alt="Student Hostel"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-5 bg-white rounded-xl shadow-md px-3 py-2 text-xs font-semibold text-indigo-600 animate-fade-in delay-200">
                Verified 100+ Hostels
              </div>
            </div>
          </div>

        </div>

        {/* Decorative Background Shapes */}
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply opacity-30 filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply opacity-20 filter blur-3xl animate-pulse"></div>
      </section>

      

      <section className="bg-gray-50 py-20">
  <div className="max-w-7xl mx-auto px-6 text-center">
    <h2 className="text-3xl font-bold mb-12">How It Works</h2>
    <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-8">
      {[
        { step: "1", title: "Search", desc: "Find hostels near your college or university.", icon: <FaCheckCircle className="text-indigo-600 text-3xl mb-2 mx-auto" /> },
        { step: "2", title: "Visit", desc: "Schedule a visit digitally and confirm availability.", icon: <FaCalendarAlt className="text-indigo-600 text-3xl mb-2 mx-auto" /> },
        { step: "3", title: "Book", desc: "Select a room and make a secure online payment.", icon: <FaCreditCard className="text-indigo-600 text-3xl mb-2 mx-auto" /> },
        { step: "4", title: "Move In", desc: "Enjoy your stay in your new student home.", icon: <FaComments className="text-indigo-600 text-3xl mb-2 mx-auto" /> },
      ].map((item, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-lg p-6 flex-1 hover:shadow-xl transform hover:scale-105 transition relative">
          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 hidden sm:block">
            {idx !== 0 && <div className="w-8 h-1 bg-indigo-300"></div>}
          </div>
          <div className="text-indigo-600 font-bold text-xl mb-2">{item.step}</div>
          {item.icon}
          <h3 className="font-semibold mb-2">{item.title}</h3>
          <p className="text-gray-600">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>



<section className="bg-indigo-50 py-20">
  <div className="max-w-7xl mx-auto px-6 text-center">
    <h2 className="text-3xl font-bold mb-12">What Our Students Say</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        { name: "Priya K.", review: "HomeSpace helped me find the perfect hostel close to my university!", rating: 5 },
        { name: "Rahul S.", review: "Booking and payment was super easy and secure.", rating: 4.8 },
        { name: "Aanya M.", review: "I love the verified listings – no surprises!", rating: 5 },
      ].map((item, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition transform hover:scale-105">
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-yellow-400 ${i >= item.rating ? "opacity-50" : ""}`}>★</span>
            ))}
          </div>
          <p className="text-gray-700 mb-4">"{item.review}"</p>
          <h4 className="font-semibold text-indigo-600">{item.name}</h4>
        </div>
      ))}
    </div>
  </div>
</section>

<section className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-400 py-20 text-white">
  <div className="max-w-7xl mx-auto px-6 text-center">
    <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 drop-shadow-lg">Ready to find your student home?</h2>
    <p className="text-lg mb-8 drop-shadow-sm">Join thousands of students who trust HomeSpace to find their perfect hostel.</p>
    <Link to="/hostels" className="bg-white text-indigo-700 px-8 py-4 rounded-lg font-semibold shadow-lg hover:scale-105 transform transition">
      Get Started
    </Link>
  </div>
  <div className="absolute -top-16 -left-16 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply opacity-30 filter blur-3xl animate-pulse"></div>
  <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply opacity-20 filter blur-3xl animate-pulse"></div>
</section>


    </div>
  );
}
