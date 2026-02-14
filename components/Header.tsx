import React, { useState, useEffect } from 'react';
import { Menu, X, Search, ChevronDown, Check, Square, List } from 'lucide-react';
import SearchOverlay from './SearchOverlay';

interface HeaderProps {
  onNavigate: (view: 'home' | 'projects' | 'detail' | 'news' | 'recent-works' | 'people' | 'service' | 'contact', withIntro?: boolean) => void;
  onNavigateProject: (id: number) => void;
  onNavigateNews: (id: number) => void;
  currentView: 'home' | 'projects' | 'detail' | 'news' | 'recent-works' | 'recent-work-detail' | 'news-detail' | 'people' | 'service' | 'contact' | 'admin-v2' | 'admin-v2-editor' | 'admin-v2-manager';
  selectedCategories?: string[];
  onToggleCategory?: (category: string) => void;
  newsViewMode?: 'checkerboard' | 'list';
  setNewsViewMode?: (mode: 'checkerboard' | 'list') => void;
  headerTheme?: 'light' | 'dark';
}

const CATEGORIES = [
  'Office',
  'Education & Research',
  'Cultural',
  'Healthcare & Mixed-use',
  'Residential & Masterplan',
  'Hotel & Resort',
  'Special',
  'Masterplan'
];

const Header: React.FC<HeaderProps> = ({ onNavigate, onNavigateProject, onNavigateNews, currentView, selectedCategories, onToggleCategory, newsViewMode, setNewsViewMode, headerTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const [menuTextShouldBeDark, setMenuTextShouldBeDark] = useState(true); // true = dark text, false = light text

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      setIsScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Detect background brightness when menu opens
  useEffect(() => {
    if (!isMenuOpen) return;

    // Sample the background color behind the menu
    const sampleBackgroundColor = () => {
      // Get the element at the menu position (right side of screen, vertically centered)
      const x = window.innerWidth - 200; // Sample from right side where menu appears
      const y = window.innerHeight / 2;

      // Use elementsFromPoint to inspect the stack of elements
      const elements = document.elementsFromPoint(x, y);

      let foundColor = false;

      for (const element of elements) {
        // Skip the menu itself and its children
        if (element.closest('#flyout-menu-container')) continue;

        // Skip transparent elements
        const style = window.getComputedStyle(element);
        const bgColor = style.backgroundColor;

        // Check for transparency
        const rgba = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
        if (rgba) {
          const alpha = rgba[4] !== undefined ? parseFloat(rgba[4]) : 1;
          // If fully transparent, skip to next element
          if (alpha < 0.1) continue;

          // Found a background color!
          const r = parseInt(rgba[1]);
          const g = parseInt(rgba[2]);
          const b = parseInt(rgba[3]);

          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          // If luminance > 0.5, bkg is light -> Dark Text
          setMenuTextShouldBeDark(luminance > 0.5);
          foundColor = true;
          break;
        }
      }

      // Fallback if no specific background found (e.g. white body)
      if (!foundColor) {
        // Assume white background if nothing else found (standard web behavior)
        setMenuTextShouldBeDark(true);
      }
    };

    // Small delay to ensure menu is rendered
    setTimeout(sampleBackgroundColor, 50);
  }, [isMenuOpen]);

  // Default logic (fallback)
  const isDarkFallback = currentView === 'home' || currentView === 'people';

  // Use passed headerTheme or fallback
  // If headerTheme is 'dark', it means the background is dark, so text should be white.
  // If headerTheme is 'light', it means the background is light, so text should be navy.
  const isDark = headerTheme ? headerTheme === 'dark' : isDarkFallback;

  const shouldShowBg = isScrolled && visible;

  const textColorClass = (shouldShowBg && !isMenuOpen)
    ? 'text-[#232A53]'
    : isDark
      ? 'text-white'
      : 'text-[#232A53]';

  // Menu text color should match the header controls (logo, toggle button)
  // If the toggle button is white (dark theme), the menu text should be white.
  // If the toggle button is navy (light theme or scrolled), the menu text should be navy.
  const menuTextColor = isDark ? 'text-white' : 'text-[#232A53]';

  const scrollToSection = (id: string) => {
    if (currentView !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[80] transition-all duration-500 ease-in-out px-6 md:px-12 py-[20px] flex justify-between items-center ${visible || isMenuOpen ? 'translate-y-0' : '-translate-y-full'
          } ${shouldShowBg && !isMenuOpen ? 'bg-white shadow-sm' : 'bg-transparent'}`}
      >
        <button
          onClick={() => window.location.href = '/'}
          className={`h-10 md:h-12 w-auto transition-all duration-500 ease-in-out ${textColorClass}`}
        >
          <img
            src="/logo/SEOP LOGO.png"
            alt="SEOP"
            className="h-full w-auto object-contain"
            style={{
              filter: (shouldShowBg && !isMenuOpen)
                ? 'brightness(0) saturate(100%) invert(14%) sepia(21%) saturate(2311%) hue-rotate(203deg) brightness(91%) contrast(92%)'
                : isDark
                  ? 'brightness(0) invert(1)'
                  : 'brightness(0) saturate(100%) invert(14%) sepia(21%) saturate(2311%) hue-rotate(203deg) brightness(91%) contrast(92%)'
            }}
          />
        </button>

        <div className="relative flex items-center">
          {/* Contextual Controls (News View/Filter): Sit to the left of the search icon */}
          <div className={`flex items-center gap-4 mr-12 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {/* News View Controls (Only Visible on News Page) */}
            {currentView === 'news' && setNewsViewMode && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setNewsViewMode('checkerboard')}
                  className={`p-1.5 transition-all ${newsViewMode === 'checkerboard' ? textColorClass : 'text-gray-300 hover:text-[#232A53]'}`}
                  title="Gallery View"
                >
                  <Square size={20} />
                </button>
                <button
                  onClick={() => setNewsViewMode('list')}
                  className={`p-1.5 transition-all ${newsViewMode === 'list' ? textColorClass : 'text-gray-300 hover:text-[#232A53]'}`}
                  title="List View"
                >
                  <List size={20} />
                </button>
              </div>
            )}

            {/* Filter Button (Only Visible on Works Page) */}
            {currentView === 'projects' && onToggleCategory && (
              <div
                className="relative"
              >
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center justify-center gap-2 w-72 py-1.5 border border-current rounded-none transition-all text-sm font-bold tracking-widest font-poppins ${textColorClass}`}
                >
                  Filter
                </button>

                <div
                  className={`absolute top-full right-0 pt-4 w-72 z-[90] transition-all duration-1000 transform-gpu will-change-[transform,opacity] ease-[cubic-bezier(0.23,1,0.32,1)] ${isFilterOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                >
                  <div className={`${isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-[#232A53]/10'} backdrop-blur-2xl shadow-2xl p-8 flex flex-col gap-4 rounded-none border transition-colors duration-300`}>
                    {CATEGORIES.map(cat => {
                      const isSelected = selectedCategories?.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => onToggleCategory(cat)}
                          className="flex items-center gap-4 w-full text-left group/item"
                        >
                          <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isSelected
                            ? (isDark ? 'bg-white border-white' : 'bg-[#232A53] border-[#232A53]')
                            : (isDark ? 'border-white/30 bg-white/5 group-hover/item:border-white' : 'border-[#232A53]/30 bg-white/5 group-hover/item:border-[#232A53]')
                            }`}>
                            {isSelected && <Check size={13} strokeWidth={4} className={isDark ? "text-[#232A53]" : "text-white"} />}
                          </div>
                          <span className={`text-[17px] tracking-wide font-poppins transition-colors ${isDark ? 'text-white' : 'text-[#232A53]'
                            } ${isSelected ? 'font-bold' : 'font-medium opacity-70 group-hover/item:opacity-100'}`}>{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Unified Magnifying Glass: Always 40px (mr-10) from the toggle button */}
          <button
            onClick={() => {
              setIsSearchOpen(true);
              setIsMenuOpen(false);
            }}
            className={`absolute right-[88px] z-[70] transition-all duration-500 transform ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'} ${isDark ? 'text-white' : 'text-[#002B57]'} h-10 w-10 flex items-center justify-center hover:opacity-70`}
          >
            <Search size={36} strokeWidth={1.5} />
          </button>

          <div className="relative">
            {/* Toggle Button: Click to Open/Close */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`relative z-[70] transition-colors duration-500 h-10 w-10 p-0 outline-none flex flex-col justify-center items-end ${textColorClass}`}
            >
              <div className={`absolute w-[40px] h-[6px] bg-current transition-all duration-300 ease-in-out right-0 ${isMenuOpen ? 'rotate-45 top-1/2 -translate-y-1/2' : 'top-0'}`} />
              <div className={`absolute w-[40px] h-[6px] bg-current transition-all duration-300 ease-in-out top-1/2 -translate-y-1/2 right-0 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <div className={`absolute w-[40px] h-[6px] bg-current transition-all duration-300 ease-in-out right-0 ${isMenuOpen ? '-rotate-45 top-1/2 -translate-y-1/2' : 'bottom-0'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Flyout Menu Container - Moved outside header to prevent moving with scroll hide */}
      <div
        id="flyout-menu-container"
        className={`fixed top-0 right-0 h-screen w-full md:w-[380px] z-[75] ${isDark ? 'bg-white/10' : 'bg-[#232A53]/5'} backdrop-blur-xl shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${isMenuOpen ? 'translate-x-0 ml-0' : 'translate-x-full ml-12'}`}
      >
        <div className="h-full flex flex-col justify-center px-16 md:px-24 pt-32 pb-16">

          <nav className="flex flex-col items-end gap-[52px] w-full">
            {/* WHO */}
            <div
              className="flex flex-col items-end group/menu leading-none w-full"
              onMouseEnter={() => setExpandedCategory('about')}
            >
              <button
                onClick={() => { onNavigate('home'); setIsMenuOpen(false); }}
                className={`text-[52px] font-poppins font-medium ${menuTextColor} hover:opacity-50 transition-all uppercase tracking-normal text-right`}
              >
                Who
              </button>
              <div className={`flex flex-col gap-3 items-end overflow-hidden transition-all duration-500 ${expandedCategory === 'about' ? 'max-h-40 opacity-100 mt-2 py-4' : 'max-h-0 opacity-0 mt-0 py-0'}`}>
                <button onClick={() => { onNavigate('people'); setIsMenuOpen(false); }} className={`text-[24px] font-poppins font-medium ${isDark ? 'text-white/80 hover:text-white' : 'text-[#232A53]/70 hover:text-[#232A53]'} uppercase tracking-widest text-right`}>People</button>
                <button onClick={() => { onNavigate('service'); setIsMenuOpen(false); }} className={`text-[24px] font-poppins font-medium ${isDark ? 'text-white/80 hover:text-white' : 'text-[#232A53]/70 hover:text-[#232A53]'} uppercase tracking-widest text-right`}>Service</button>
                <button onClick={() => { onNavigate('contact'); setIsMenuOpen(false); }} className={`text-[24px] font-poppins font-medium ${isDark ? 'text-white/80 hover:text-white' : 'text-[#232A53]/70 hover:text-[#232A53]'} uppercase tracking-widest text-right`}>Contact</button>
              </div>
            </div>

            {/* WHAT */}
            <div
              className="flex flex-col items-end group/menu leading-none w-full"
              onMouseEnter={() => setExpandedCategory('works')}
            >
              <button
                onClick={() => { onNavigate('projects'); setIsMenuOpen(false); }}
                className={`text-[52px] font-poppins font-medium ${menuTextColor} hover:opacity-50 transition-all uppercase tracking-normal text-right`}
              >
                What
              </button>
              {/* Placeholder to match structure */}
              <div className="max-h-0 overflow-hidden mt-0 py-0"></div>
            </div>

            {/* HOW */}
            <div
              className="flex flex-col items-end group/menu leading-none w-full"
              onMouseEnter={() => setExpandedCategory('recents')}
            >
              <button
                className={`text-[52px] font-poppins font-medium ${menuTextColor} hover:opacity-50 transition-all uppercase tracking-normal text-right`}
              >
                How
              </button>
              <div className={`flex flex-col gap-3 items-end overflow-hidden transition-all duration-500 ${expandedCategory === 'recents' ? 'max-h-40 opacity-100 mt-2 py-4' : 'max-h-0 opacity-0 mt-0 py-0'}`}>
                <button onClick={() => { onNavigate('news'); setIsMenuOpen(false); }} className={`text-[24px] font-poppins font-medium ${isDark ? 'text-white/80 hover:text-white' : 'text-[#232A53]/70 hover:text-[#232A53]'} uppercase tracking-widest text-right`}>News</button>
                <button onClick={() => { onNavigate('recent-works'); setIsMenuOpen(false); }} className={`text-[24px] font-poppins font-medium ${isDark ? 'text-white/80 hover:text-white' : 'text-[#232A53]/70 hover:text-[#232A53]'} uppercase tracking-widest text-right`}>Recent Works</button>
              </div>
            </div>

          </nav>
        </div>
      </div>

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateProject={onNavigateProject}
        onNavigateNews={onNavigateNews}
      />
    </>
  );
};

export default Header;