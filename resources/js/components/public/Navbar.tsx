import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const borderColor = 'rgba(232,220,195,0.45)';

  return (
    <header className="fixed inset-x-0 top-0 z-50 pointer-events-none bg-white">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div
          className="mx-auto pointer-events-auto flex items-center justify-between max-w-[1100px] px-6 py-2 rounded-3xl transition-all duration-300 backdrop-blur-md border shadow-sm"
          style={{
            backgroundColor: solid ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.08)',
            borderColor,
            color: solid ? '#3B4D3A' : '#FFFFFF',
          }}
        >

          <a href="/" className="font-bold text-lg md:text-2xl" style={{ color: '#3B4D3A' }}>
            OSINTRA
          </a>

          <nav className="hidden lg:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="transition-colors duration-200 font-medium"
                style={{ color: '#3B4D3A' }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Button Masuk dihilangkan */}

          <div className="lg:hidden">
            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="p-2"
              style={{ color: solid ? '#3B4D3A' : '#FFFFFF' }}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="max-w-7xl mx-auto px-4 mt-3 pointer-events-auto">
          <div className="mx-auto max-w-[1100px] bg-white/98 backdrop-blur-md border rounded-2xl" style={{ borderColor }}>
            <div className="px-6 py-4 space-y-2">
              {links.map((l) => (
                <a key={l.href} href={l.href} className="block px-4 py-3 rounded-lg text-[#3B4D3A]">
                  {l.label}
                </a>
              ))}
              <a
                href="/login"
                className="block px-4 py-3 rounded-lg font-semibold text-center"
                style={{ backgroundColor: '#E8DCC3', color: '#1E1E1E', marginTop: 8 }}
              >
                Masuk
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
