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
  const [solid, setSolid] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const logoClicks = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setSolid(currentScrollY > 20);

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

  return (
    <div className={`fixed inset-x-0 top-4 z-50 flex justify-center transition-transform duration-500 ${isVisible ? 'translate-y-0' : '-translate-y-32'}`}>
      <nav
        className={`relative w-[92%] max-w-5xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg shadow-black/5 transition-all duration-500 ease-out overflow-hidden ${open ? 'rounded-[2.5rem]' : 'rounded-[2rem]'
          }`}
        style={{
          // Dynamic shadows for depth
          boxShadow: solid || open
            ? '0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5)'
            : '0 10px 20px -5px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.3)'
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
                <div className="absolute inset-0 bg-gradient-to-tr from-[#E8DCC3] to-[#3B4D3A] opacity-20 blur-lg rounded-full group-hover:opacity-40 transition-opacity" />
                <img src="/build/assets/osis-logo-mBAtwUV-.png" alt="OSIS" className="relative w-9 h-9 object-contain group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-bold text-lg tracking-tight text-[#3B4D3A]">OSVIS</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {links.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 relative group`}
                  style={{
                    color: isActive(link.href) ? '#3B4D3A' : '#6E8BA3',
                  }}
                >
                  <span className="relative z-10">{link.label}</span>
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-[#3B4D3A]/5 rounded-xl scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 origin-center" />
                  {/* Active Dot */}
                  {isActive(link.href) && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#3B4D3A] rounded-full" />
                  )}
                </a>
              ))}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-xl hover:bg-black/5 transition-colors text-[#3B4D3A]"
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
            <div className="h-px w-full bg-[#3B4D3A]/10 mb-2" />
            {links.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className="p-3 rounded-xl font-semibold text-[#6E8BA3] hover:text-[#3B4D3A] hover:bg-[#3B4D3A]/5 transition-all text-left pl-4"
                style={{
                  color: isActive(link.href) ? '#3B4D3A' : undefined,
                  backgroundColor: isActive(link.href) ? 'rgba(232,220,195,0.3)' : undefined,
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