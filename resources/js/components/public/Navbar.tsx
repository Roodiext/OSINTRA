import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';

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
  const [logoClickCount, setLogoClickCount] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;

      setSolid(currentScrollY > 50);

      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
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
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: solid ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${solid ? 'rgba(232,220,195,0.4)' : 'rgba(232,220,195,0.2)'}`,
          boxShadow: solid ? '0 4px 20px rgba(59, 77, 58, 0.08)' : '0 2px 10px rgba(0, 0, 0, 0.05)',
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                const newCount = logoClickCount + 1;
                setLogoClickCount(newCount);
                if (newCount === 6) {
                  window.location.href = '/dashboard';
                }
              }}
              className="group flex items-center gap-2 font-bold text-xl md:text-2xl transition-transform duration-300 hover:scale-105"
            >
              <img
                src="/build/assets/osis-logo-mBAtwUV-.png"
                alt="OSIS Logo"
                className="w-12 h-12 object-contain"
              />
              <span style={{ color: '#3B4D3A', letterSpacing: '-0.02em' }}>OSVIS</span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setActiveLink(l.href)}
                  className="relative px-4 py-2 rounded-xl transition-all duration-300 font-medium group"
                  style={{
                    color: isActive(l.href) ? '#3B4D3A' : '#6E8BA3',
                    fontWeight: isActive(l.href) ? '600' : '500'
                  }}
                >
                  {l.label}

                  {/* Hover Effect */}
                  <span
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                    style={{
                      backgroundColor: 'rgba(232,220,195,0.2)'
                    }}
                  />

                  {/* Active Indicator */}
                  {isActive(l.href) && (
                    <span
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 rounded-full"
                      style={{ backgroundColor: '#3B4D3A' }}
                    />
                  )}
                </a>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">


              {/* Mobile Menu Button */}
              <button
                aria-label="Toggle menu"
                onClick={() => setOpen((v) => !v)}
                className="lg:hidden p-2 rounded-xl transition-all duration-300 hover:bg-gray-100"
                style={{ color: '#3B4D3A' }}
              >
                {open ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div
            className="lg:hidden border-t animate-slide-down"
            style={{
              backgroundColor: 'rgba(255,255,255,0.98)',
              borderColor: 'rgba(232,220,195,0.3)'
            }}
          >
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-1">
              {links.map((l, index) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => {
                    setActiveLink(l.href);
                    setOpen(false);
                  }}
                  className="group relative block px-4 py-3 rounded-xl font-medium transition-all duration-300"
                  style={{
                    color: '#3B4D3A',
                    backgroundColor: isActive(l.href) ? 'rgba(232,220,195,0.3)' : 'transparent',
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <span
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                    style={{ backgroundColor: 'rgba(232,220,195,0.2)' }}
                  />

                  <div className="flex items-center justify-between">
                    <span>{l.label}</span>
                    {isActive(l.href) && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#3B4D3A' }}
                      />
                    )}
                  </div>
                </a>
              ))}


            </div>
          </div>
        )}
      </header>

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Navbar;