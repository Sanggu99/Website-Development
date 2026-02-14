import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#232A53] text-white px-6 md:px-12 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
        <div className="flex flex-col gap-2">
          <h3 className="text-3xl font-calisto font-normal text-white tracking-tighter uppercase mb-2">SEOP</h3>
          <p className="text-[13px] font-poppins font-light text-white/50 leading-relaxed max-w-sm">
            서울 강남구 역삼로8길 15 2, 3층
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 text-[13px] font-poppins">
          <div>
            <span className="text-white/30 uppercase tracking-widest text-[10px] block mb-1">Email</span>
            <a href="mailto:seoparchi@seoparchi.com" className="hover:text-white/70 transition-colors">seoparchi@seoparchi.com</a>
          </div>
          <div>
            <span className="text-white/30 uppercase tracking-widest text-[10px] block mb-1">Tel</span>
            <a href="tel:+82262058688" className="hover:text-white/70 transition-colors">+82-2-6205-8688</a>
          </div>
          <div>
            <span className="text-white/30 uppercase tracking-widest text-[10px] block mb-1">Fax</span>
            <span className="text-white/80">+82-070-8708-9541</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center text-[10px] font-poppins font-light text-white/30 pt-6 border-t border-white/10 uppercase tracking-[0.2em]">
        <p>&copy; {new Date().getFullYear()} SEOP. All rights reserved.</p>
        <div className="flex gap-8 mt-4 md:mt-0">
          <button onClick={() => window.location.hash = '#/admin-v2'} className="hover:text-white transition-colors">Admin</button>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;