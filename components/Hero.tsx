import React from 'react';
import { ProjectFact } from '../types';

interface HeroProps {
  title: string;
  titleKo?: string;
  location: string;
  image: string;
  layout?: 'overlay' | 'bottom-bar' | 'no-overlay' | 'minimal-overlay';
  facts?: ProjectFact[];
}

const Hero: React.FC<HeroProps> = ({ title, titleKo, location, image, layout = 'overlay', facts = [] }) => {
  const area = facts?.find(f => f.label === '면적' || f.label === 'Size')?.value || ' - ';
  const scale = facts?.find(f => f.label === '규모' || f.label === 'Program')?.value || ' - ';

  // Case 4: Minimal Overlay (Text directly on image, no bar)
  if (layout === 'minimal-overlay') {
    return (
      <div className="relative w-full h-screen">
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        <div className="absolute bottom-12 left-0 w-full flex items-end justify-between px-10 md:px-24 text-white z-10">
          <div className="flex flex-col">
            <h1 className="text-base md:text-lg font-bold tracking-tight">{title}</h1>
            {titleKo && <span className="text-xs md:text-sm font-medium opacity-80 mt-0.5">{titleKo}</span>}
          </div>
          <div className="flex items-center gap-6 md:gap-12 font-light tracking-wider opacity-90 text-right">
            <div className="flex flex-col items-end">
              <span className="opacity-50 text-[10px] md:text-[13px]">위치</span>
              <span className="text-[12px] md:text-[15px]">{location}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="opacity-50 text-[10px] md:text-[13px]">면적</span>
              <span className="text-[12px] md:text-[15px]">{area}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="opacity-50 text-[10px] md:text-[13px]">규모</span>
              <span className="text-[12px] md:text-[15px]">{scale}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: No Overlay (Full Image, Text in Body)
  if (layout === 'no-overlay') {
    return (
      <div className="relative w-full h-screen">
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  // Case 2: Bottom Bar (Perfect fit to viewport height)
  if (layout === 'bottom-bar') {
    return (
      <div className="w-full h-screen flex flex-col bg-white overflow-hidden">
        <div className="flex-grow w-full relative">
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <div className="flex-none w-full h-16 md:h-20 bg-white flex items-center justify-between px-10 md:px-24 text-black">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-bold tracking-tight">{title}</h1>
            {titleKo && <span className="text-sm font-medium text-gray-500 mt-0.5">{titleKo}</span>}
          </div>

          <div className="flex items-center gap-8 md:gap-16 font-medium tracking-wider text-right">
            <div className="flex flex-col items-end">
              <span className="text-gray-400 font-light mb-1 text-[10px] md:text-[13px]">위치</span>
              <span className="text-[12px] md:text-[15px]">{location}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-gray-400 font-light mb-1 text-[10px] md:text-[13px]">면적</span>
              <span className="text-[12px] md:text-[15px]">{area}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-gray-400 font-light mb-1 text-[10px] md:text-[13px]">규모</span>
              <span className="text-[12px] md:text-[15px]">{scale}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 1: Standard Overlay (Semi-transparent bar)
  return (
    <div className="relative w-full h-screen">
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

      <div className="absolute bottom-0 left-0 w-full h-20 bg-black/20 backdrop-blur-[2px] flex items-center justify-between px-6 md:px-12 text-white border-t border-white/10 z-10">
        <div className="flex flex-col">
          <h1 className="text-base md:text-lg font-bold tracking-tight">{title}</h1>
          {titleKo && <span className="text-xs md:text-sm font-medium opacity-80 mt-0.5">{titleKo}</span>}
        </div>

        <div className="flex items-center gap-6 md:gap-12 font-light tracking-wider opacity-90">
          <div className="flex flex-col items-end">
            <span className="opacity-50 mb-[2px] text-[10px] md:text-[13px]">위치</span>
            <span className="text-[12px] md:text-[15px]">{location}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="opacity-50 mb-[2px] text-[10px] md:text-[13px]">면적</span>
            <span className="text-[12px] md:text-[15px]">{area}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="opacity-50 mb-[2px] text-[10px] md:text-[13px]">규모</span>
            <span className="text-[12px] md:text-[15px]">{scale}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;