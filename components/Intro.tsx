import React, { useEffect, useState } from 'react';

interface IntroProps {
    onFinish?: () => void;
}

const Intro: React.FC<IntroProps> = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        // Stage 1: Wait for a moment to show the logo
        const timer1 = setTimeout(() => {
            setIsFading(true);
        }, 1500);

        // Stage 2: Completely remove the intro after fade animation
        const timer2 = setTimeout(() => {
            setIsVisible(false);
            if (onFinish) onFinish();
        }, 2500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onFinish]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-all duration-[1000ms] ease-in-out ${isFading ? 'opacity-0 scale-[1.5] pointer-events-none' : 'opacity-100 scale-100'
                }`}
        >
            <div className="flex flex-col items-center">
                <img
                    src="/logo/SEOP LOGO.png"
                    alt="SEOP"
                    className="w-48 md:w-80 h-auto animate-intro-double"
                    style={{ filter: 'brightness(0) saturate(100%) invert(14%) sepia(21%) saturate(2311%) hue-rotate(203deg) brightness(91%) contrast(92%)' }}
                />
            </div>

            <style>{`
        @keyframes doubleHeartbeatScale {
          0% { transform: scale(1); opacity: 0; }
          10% { transform: scale(1.05); opacity: 1; }
          20% { transform: scale(1); }
          30% { transform: scale(1.05); }
          40% { transform: scale(1); }
          55% { transform: scale(1); }
          100% { transform: scale(1.4); opacity: 1; }
        }
        .animate-intro-double {
          animation: doubleHeartbeatScale 3s ease-in-out forwards;
        }
      `}</style>
        </div>
    );
};

export default Intro;
