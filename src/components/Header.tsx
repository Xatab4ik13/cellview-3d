import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, MapPin } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '#catalog', label: 'Каталог ячеек' },
    { href: '#3d-view', label: '3D-просмотр' },
    { href: '#pricing', label: 'Цены' },
    { href: '#features', label: 'Преимущества' },
    { href: '#contacts', label: 'Контакты' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl text-foreground">Storage</span>
              <span className="font-bold text-xl text-primary">Box</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Contact & CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a 
              href="tel:+78121234567" 
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              +7 (812) 123-45-67
            </a>
            <Button variant="default" size="sm">
              Забронировать
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="px-4 py-3 space-y-3">
                <a 
                  href="tel:+78121234567" 
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <Phone className="w-4 h-4" />
                  +7 (812) 123-45-67
                </a>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  СПб, ул. Алтайская, 21
                </div>
                <Button variant="default" className="w-full">
                  Забронировать
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
