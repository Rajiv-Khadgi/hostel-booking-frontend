import React from 'react';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

export default function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 sm:p-10 border border-white/10 relative group hover:bg-white/15 transition-all duration-300">
      <FaQuoteLeft className="text-4xl text-emerald-400/20 text-emerald-400 opacity-20 absolute top-8 right-8 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500" />
      
      <div className="flex gap-1 mb-6 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < testimonial.rating ? "" : "text-gray-400/30"} />
        ))}
      </div>
      
      <p className="text-gray-100 text-lg mb-8 leading-relaxed relative z-10 font-light min-h-[5rem]">
        "{testimonial.quote}"
      </p>
      
      <div className="flex items-center gap-4 mt-auto">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-800 border-2 border-emerald-500/50">
          <img 
            src={testimonial.avatar} 
            alt={testimonial.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-bold text-white text-base">{testimonial.name}</h4>
          <p className="text-sm text-emerald-400 font-medium">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}
