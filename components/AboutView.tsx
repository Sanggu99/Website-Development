import React, { useState, useRef, useEffect } from 'react';
import People from './People';
import Service from './Service';
import ContactSection from './ContactSection';
import NewsPopup from './NewsPopup';
import { newsData } from '../newsData';

interface AboutViewProps {
    isIntroFinished: boolean;
}

const AboutView: React.FC<AboutViewProps> = ({ isIntroFinished }) => {
    // Video Playlist Logic
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [videoError, setVideoError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Explicitly define filenames
    const filenames = [
        'home video (1).mp4',
        'home video (2).mp4',
        'home video (3).mp4',
        'home video (4).mp4'
    ];

    // Construct paths with proper encoding
    // Check if we need to encode everything or just spaces
    // Browser usually handles /Video/home video (1).mp4 fine, but let's be safe
    const getVideoPath = (filename: string) => `/Video/${filename}`;

    const handleVideoEnded = () => {
        console.log("Video ended, playing next.");
        const nextIndex = (currentVideoIndex + 1) % filenames.length;
        setCurrentVideoIndex(nextIndex);
        setVideoError(null);
    };

    // Auto-play effect when index changes
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Autoplay prevented:", error);
                    // attempt muted play if not already
                    if (videoRef.current) {
                        videoRef.current.muted = true;
                        videoRef.current.play().catch(e => console.error("Muted autoplay also failed", e));
                    }
                });
            }
        }
    }, [currentVideoIndex]);

    return (
        <div className="w-full relative h-screen overflow-hidden bg-black">
            {/* Hero Video Section */}
            <div className="w-full h-full relative">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleVideoEnded}
                    onError={(e) => {
                        const err = (e.target as HTMLVideoElement).error;
                        console.error(`Video load error for ${filenames[currentVideoIndex]}:`, err);
                        setVideoError(`Error loading ${filenames[currentVideoIndex]}: ${err?.message || 'Unknown error'}. code: ${err?.code}`);

                        // Wait 3 seconds then try next to avoid rapid loops if all fail
                        setTimeout(handleVideoEnded, 3000);
                    }}
                >
                    <source src={getVideoPath(filenames[currentVideoIndex])} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Optional: Overlay if needed (e.g. Logo or Title) */}
                <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

                {/* Minimal Navigation Dots */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-30">
                    {filenames.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentVideoIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentVideoIndex === index
                                    ? 'bg-white scale-125'
                                    : 'bg-white/40 hover:bg-white/80 hover:scale-110'
                                }`}
                            aria-label={`Select video ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutView;

