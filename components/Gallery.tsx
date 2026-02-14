import React from 'react';
import { ProjectImage } from '../types';

interface GalleryProps {
  images: ProjectImage[];
}

const Gallery: React.FC<GalleryProps> = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <section className="px-6 md:px-24 pb-48 pt-0 bg-white">
      <div className="flex flex-col gap-24">
        {images.map((image, idx) => {
          // Determine layout pattern from explicit layoutType or fallback to automatic alternating
          // left = pattern 0, full = pattern 1, right = pattern 2
          let pattern: number;
          if (image.layoutType) {
            if (image.layoutType === 'left') pattern = 0;
            else if (image.layoutType === 'full') pattern = 1;
            else pattern = 2;
          } else {
            pattern = idx % 3;
          }

          if (pattern === 0) {
            // Pattern 0: Image (Left) + Text (Right)
            return (
              <div key={idx} className="snap-start scroll-mt-0 min-h-[100dvh] flex flex-col justify-center">
                <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                  <div className="w-full md:w-3/4 group overflow-hidden relative aspect-video">
                    <img
                      src={image.src}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out cursor-crosshair hover:scale-[1.02]"
                      alt="Gallery item"
                    />
                  </div>
                  <div className="w-full md:w-1/4 pt-4 md:pt-12">
                    <p className="text-xs md:text-sm text-[#232A53]/60 font-light leading-relaxed break-keep">
                      {image.caption || '건축물의 공간적 긴장감과 재료의 질감이 조화를 이루는 지점을 포착했습니다. 조절된 빛은 공간에 깊이를 더하며 고유한 분위기를 자아냅니다.'}
                    </p>
                  </div>
                </div>
              </div>
            );
          } else if (pattern === 1) {
            // Pattern 1: Massive Full Width
            return (
              <div key={idx} className="snap-start scroll-mt-0 min-h-[100dvh] flex flex-col justify-center">
                <div className={`w-full space-y-8 ${image.fullWidth ? '-mx-6 md:-mx-24 w-[calc(100%+3rem)] md:w-[calc(100%+12rem)] max-w-none' : ''}`}>
                  <div className="w-full group overflow-hidden flex justify-center relative aspect-[21/9]">
                    <img
                      src={image.src}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out cursor-crosshair hover:scale-[1.01]"
                      alt="Gallery item"
                    />
                  </div>
                  {image.caption && (
                    <div className={`max-w-2xl ${image.fullWidth ? 'px-6 md:px-24' : ''}`}>
                      <p className="text-xs md:text-sm text-[#232A53]/60 font-light leading-relaxed break-keep">
                        {image.caption}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          } else {
            // Pattern 2: Text (Left) + Image (Right)
            return (
              <div key={idx} className="snap-start scroll-mt-0 min-h-[100dvh] flex flex-col justify-center">
                <div className="flex flex-col md:flex-row-reverse gap-8 md:gap-16 items-start">
                  <div className="w-full md:w-3/4 group overflow-hidden relative aspect-video">
                    <img
                      src={image.src}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out cursor-crosshair hover:scale-[1.02]"
                      alt="Gallery item"
                    />
                  </div>
                  <div className="w-full md:w-1/4 pt-4 md:pt-12 md:text-right flex flex-col md:items-end">
                    <p className="text-xs md:text-sm text-[#232A53]/60 font-light leading-relaxed break-keep">
                      {image.caption || '도시의 맥락과 연결되는 시각적 축을 고려하여 배치되었습니다. 보행자의 경험을 최우선으로 하며 주변 환경과 공존하는 형태를 제안합니다.'}
                    </p>
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
    </section>
  );
};

export default Gallery;