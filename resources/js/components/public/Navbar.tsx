import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang', href: '/about' },
  { label: 'Struktur', href: '/struktur' },
  { label: 'Program Kerja', href: '/prokers' },
  { label: 'Galeri', href: '/gallery' },
  { label: 'Kontak', href: '/contact' },
];

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const logoClicks = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > 20;
      setScrolled(isScrolled);

      if (currentScrollY < 20) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
        setOpen(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', onScroll);
    setActiveLink(window.location.pathname);
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  const isActive = (href: string) => activeLink === href;

  // Logic: Show "Scrolled" (White/Dark) style if:
  // 1. We are scrolled down
  // 2. The menu is open
  // 3. We are NOT on the home page (other pages usually have light backgrounds)
  const isHome = activeLink === '/';
  const showScrolledState = scrolled || open || !isHome;

  // Dynamic Styles
  const navBackground = showScrolledState ? 'bg-white/90 border-[#E8DCC3]/50' : 'bg-[#050505]/10 border-white/5';
  const textColor = showScrolledState ? 'text-[#3B4D3A]' : 'text-[#E8DCC3]';

  // Adjusted text colors for better visibility
  const linkColor = (href: string) => {
    if (isActive(href)) return showScrolledState ? '#3B4D3A' : '#E8DCC3';
    return showScrolledState ? '#6E8BA3' : 'rgba(232, 220, 195, 0.8)';
  };

  const logoText = showScrolledState ? 'text-[#3B4D3A]' : 'text-[#E8DCC3]';
  const activeIndicator = showScrolledState ? 'bg-[#3B4D3A]' : 'bg-[#E8DCC3]';
  const hoverBg = showScrolledState ? 'bg-[#3B4D3A]/5' : 'bg-[#E8DCC3]/10';

  return (
    <div className={`fixed inset-x-0 top-4 z-50 flex justify-center transition-transform duration-500 ${isVisible ? 'translate-y-0' : '-translate-y-32'}`}>
      <nav
        className={`relative w-[92%] max-w-5xl backdrop-blur-md border shadow-lg transition-all duration-500 ease-out overflow-hidden ${open ? 'rounded-[2.5rem]' : 'rounded-[2rem]'
          } ${navBackground}`}
        style={{
          boxShadow: showScrolledState
            ? '0 20px 40px -10px rgba(59, 77, 58, 0.1), 0 0 0 1px rgba(232, 220, 195, 0.2)'
            : '0 10px 20px -5px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)'
        }}
      >
        <div className="flex flex-col">
          {/* Top Bar: Logo, Desktop Links, Toggle */}
          <div className="px-6 py-3 flex items-center justify-between">
            {/* Logo */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                if (clickTimer.current) clearTimeout(clickTimer.current);

                logoClicks.current += 1;

                if (logoClicks.current === 6) {
                  window.location.href = '/dashboard';
                  logoClicks.current = 0;
                } else {
                  clickTimer.current = setTimeout(() => {
                    // Force navigation to home if not already there, else just reset
                    // Logic allows staying on page if < 6 clicks
                    if (window.location.pathname !== '/') {
                      window.location.href = '/';
                    }
                    logoClicks.current = 0;
                  }, 350);
                }
              }}
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-tr ${showScrolledState ? 'from-[#3B4D3A] to-[#E8DCC3]' : 'from-[#E8DCC3] to-white'} opacity-20 blur-lg rounded-full group-hover:opacity-40 transition-all`} />
                <img src="/build/assets/osis-logo-mBAtwUV-.png" alt="OSIS" className="relative w-9 h-9 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
              </div>
              <span className={`font-bold text-lg tracking-tight transition-colors duration-300 ${logoText}`}>OSVIS</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {links.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 relative group`}
                  style={{
                    color: linkColor(link.href),
                  }}
                >
                  <span className="relative z-10">{link.label}</span>
                  {/* Hover Effect */}
                  <div className={`absolute inset-0 rounded-xl scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 origin-center ${hoverBg}`} />
                  {/* Active Dot */}
                  {isActive(link.href) && (
                    <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full shadow-sm ${activeIndicator}`} />
                  )}
                </a>
              ))}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setOpen(!open)}
              className={`lg:hidden p-2 rounded-xl transition-colors ${textColor} hover:bg-black/5`}
            >
              <div className={`transition-transform duration-300 ${open ? 'rotate-90' : 'rotate-0'}`}>
                {open ? <X size={24} /> : <Menu size={24} />}
              </div>
            </button>
          </div>

          {/* Mobile Menu (Expandable Content) */}
          <div
            className={`lg:hidden flex flex-col gap-2 px-6 transition-all duration-500 ease-in-out ${open ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0'
              }`}
          >
            <div className={`h-px w-full mb-2 ${showScrolledState ? 'bg-[#3B4D3A]/10' : 'bg-[#E8DCC3]/10'}`} />
            {links.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className={`p-3 rounded-xl font-semibold transition-all text-left pl-4 ${showScrolledState ? 'hover:bg-[#3B4D3A]/5' : 'hover:bg-[#E8DCC3]/10'}`}
                style={{
                  color: linkColor(link.href),
                  backgroundColor: isActive(link.href)
                    ? (showScrolledState ? 'rgba(59, 77, 58, 0.08)' : 'rgba(232, 220, 195, 0.1)')
                    : undefined,
                  transitionDelay: open ? `${i * 50}ms` : '0ms'
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;