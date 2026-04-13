import React from 'react';
import { FiMapPin, FiPhone, FiMail, FiSend } from 'react-icons/fi';

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, submit this data to backend
    alert("Thank you for your message! Our team will get back to you shortly.");
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* ── Page Header ── */}
      <div className="bg-emerald-900 pt-32 pb-20 px-6 text-center border-b-[8px] border-emerald-500">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">Get in Touch</h1>
        <p className="text-lg text-emerald-100/80 max-w-2xl mx-auto font-medium">
          Have questions about a booking, need technical support, or want to list your property? We'd love to hear from you.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Contact Information Cards */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <FiMapPin size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Our Office</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Come visit us at our headquarters. We are open from Monday to Friday, 9:00 AM to 6:00 PM.
              </p>
              <p className="text-gray-800 font-semibold text-sm">
                Kathmandu, Bagmati Province<br />
                Nepal, 44600
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <FiPhone size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Have an urgent inquiry? Call our dedicated support line.
              </p>
              <p className="text-gray-800 font-semibold text-lg">+977 123 456 789</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <FiMail size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Send us an email and we'll respond within 24 hours.
              </p>
              <a href="mailto:support@homespace.com" className="text-emerald-600 hover:text-emerald-700 font-semibold text-base transition-colors">
                support@homespace.com
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100 h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">First Name</label>
                    <input 
                      type="text" 
                      placeholder="John" 
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder-gray-400 bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Last Name</label>
                    <input 
                      type="text" 
                      placeholder="Doe" 
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder-gray-400 bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder-gray-400 bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Subject</label>
                  <select 
                    required
                    defaultValue=""
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-gray-700 bg-gray-50 appearance-none bg-no-repeat bg-[right_1rem_center]"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2310b981%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundSize: '12px' }}
                  >
                    <option value="" disabled>Select an inquiry type...</option>
                    <option value="booking">Booking Assistance</option>
                    <option value="technical">Technical Support</option>
                    <option value="owner">Partner / List Property</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Message</label>
                  <textarea 
                    placeholder="How can we help you?" 
                    rows="5"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder-gray-400 bg-gray-50 resize-y"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2">
                    <FiSend size={18} />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
