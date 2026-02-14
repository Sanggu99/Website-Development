import React, { useEffect, useState } from 'react';

interface CustomCursorProps {
    isDark?: boolean;
}

const CustomCursor: React.FC<CustomCursorProps> = ({ isDark = false }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isPointer, setIsPointer] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isInFooter, setIsInFooter] = useState(false);

    useEffect(() => {
        const updatePosition = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);

            const target = e.target as HTMLElement;

            // Detect footer hover for white cursor
            const isFooter = target.closest('footer');
            setIsInFooter(!!isFooter);

            const isClickable =
                window.getComputedStyle(target).cursor === 'pointer' ||
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.classList.contains('cursor-pointer') ||
                target.closest('a') ||
                target.closest('button') ||
                target.closest('.cursor-pointer');

            setIsPointer(!!isClickable);
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        window.addEventListener('mousemove', updatePosition);
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', updatePosition);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    if (!isVisible) return null;

    // Use white cursor if page is dark or if we are in the navy footer
    const cursorColor = (isDark || isInFooter) ? '#FFFFFF' : '#232A53';

    return (
        <div
            id="custom-cursor-main"
            className="fixed top-0 left-0 pointer-events-none z-[9999]"
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                transition: 'none'
            }}
        >
            {isPointer ? (
                // Plus Shape
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                    <div className="absolute w-[32px] h-[2.5px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: cursorColor }} />
                    <div className="absolute w-[2.5px] h-[32px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: cursorColor }} />
                </div>
            ) : (
                // Circle Shape
                <div
                    className="w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2"
                    style={{ backgroundColor: cursorColor }}
                />
            )}
        </div>
    );
};

export default CustomCursor;
