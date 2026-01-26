import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, MapPin, HelpCircle, User, MessageCircle } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: '/catalog', label: 'Адреса складов' },
    { href: '/pricing', label: 'Стоимость' },
    { href: '/faq', label: 'Вопрос-ответ' },
    { href: '/contacts', label: 'Контакты' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      {/* Top row */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">К</span>
              </div>
              <div className="flex flex-col">
                <div>
                  <span className="font-bold text-xl text-foreground">Кладовка</span>
                  <span className="font-bold text-xl text-primary">78</span>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">Склад для дома и бизнеса</span>
              </div>
            </Link>

            {/* City selector - Desktop */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Выберите город</span>
              <span className="font-semibold text-primary">Санкт-Петербург</span>
            </div>

            {/* Phone - Desktop */}
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs text-muted-foreground">Бесплатно по РФ</span>
              <a 
                href="tel:+78121234567" 
                className="flex items-center gap-1 font-bold text-lg text-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                8 812 123-45-67
              </a>
            </div>

            {/* CTA Button - Desktop */}
            <div className="hidden lg:flex items-center gap-4">
              <Button variant="outline" className="rounded-full px-6">
                Заказать звонок
              </Button>
              
              {/* Social & Menu icons */}
              <div className="flex items-center gap-2">
                <a 
                  href="https://t.me/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <button className="w-10 h-10 rounded-full border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors">
                  <HelpCircle className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors">
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row - Navigation - Desktop */}
      <div className="hidden lg:block bg-background">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center gap-8 h-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden py-4 border-t border-border bg-background animate-fade-in">
          <div className="container mx-auto px-4">
            {/* City */}
            <div className="flex items-center gap-2 text-sm mb-4 pb-4 border-b border-border">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Город:</span>
              <span className="font-semibold text-primary">Санкт-Петербург</span>
            </div>

            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground hover:text-primary hover:bg-muted/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <a 
                  href="tel:+78121234567" 
                  className="flex items-center gap-2 text-lg font-bold text-foreground"
                >
                  <Phone className="w-5 h-5 text-primary" />
                  8 812 123-45-67
                </a>
                <p className="text-xs text-muted-foreground">Бесплатно по РФ</p>
                
                <Button variant="default" className="w-full">
                  Заказать звонок
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
