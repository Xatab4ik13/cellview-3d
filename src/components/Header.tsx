import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, MapPin, HelpCircle, User, MessageCircle, Package, Wallet, FileText, CircleHelp, Mail, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import logo from '@/assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, [location]);

  useEffect(() => {
    // Close menu on route change
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleAccountClick = () => {
    setIsMenuOpen(false);
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const navLinks = [
    { href: '/catalog', label: 'Кладовки', icon: Package },
    { href: '/pricing', label: 'Цены', icon: Wallet },
    { href: '/docs', label: 'Документация', icon: FileText },
    { href: '/faq', label: 'Вопрос-ответ', icon: CircleHelp },
    { href: '/contacts', label: 'Контакты', icon: Mail },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      {/* Top row */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-2 lg:px-4">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center -ml-2 lg:-ml-4">
              <img src={logo} alt="Кладовка78" className="h-40 lg:h-52 w-auto" />
            </Link>

            {/* City selector - Desktop */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Выберите город</span>
              <span className="font-semibold text-primary">Санкт-Петербург</span>
            </div>

            {/* Phone - Desktop */}
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs text-muted-foreground">Звоните нам</span>
              <a 
                href="tel:+79118108383" 
                className="flex items-center gap-1 font-bold text-lg text-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                8 (911) 810-83-83
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
                <button 
                  onClick={handleAccountClick}
                  className="w-10 h-10 rounded-full border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors"
                  title={isAuthenticated ? 'Личный кабинет' : 'Войти'}
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Открыть меню"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-full sm:w-[380px] p-0 bg-background border-l border-border">
                <SheetHeader className="p-4 pb-0">
                  <SheetTitle className="sr-only">Меню навигации</SheetTitle>
                </SheetHeader>
                
                {/* Mobile Menu Content */}
                <div className="flex flex-col h-full">
                  {/* User Account Block */}
                  <div className="p-4">
                    <button
                      onClick={handleAccountClick}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-lg">
                          {isAuthenticated ? 'Личный кабинет' : 'Войти'}
                        </p>
                        <p className="text-sm opacity-80">
                          {isAuthenticated ? 'Управление арендой' : 'Регистрация и вход'}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 opacity-80" />
                    </button>
                  </div>

                  {/* City Selector */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Ваш город</p>
                        <p className="font-semibold text-primary">Санкт-Петербург</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex-1 px-4">
                    <div className="space-y-1">
                      {navLinks.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.href);
                        return (
                          <Link
                            key={link.href}
                            to={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-4 px-4 py-4 rounded-xl font-medium transition-all ${
                              active
                                ? 'bg-primary/10 text-primary border-l-4 border-primary'
                                : 'text-foreground hover:bg-muted/50 hover:text-primary border-l-4 border-transparent'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="text-base">{link.label}</span>
                            <ChevronRight className={`w-4 h-4 ml-auto ${active ? 'text-primary' : 'text-muted-foreground/50'}`} />
                          </Link>
                        );
                      })}
                    </div>
                  </nav>

                  {/* Bottom Section - Contact Info */}
                  <div className="mt-auto p-4 space-y-4 border-t border-border bg-muted/30">
                    {/* Phone */}
                    <a 
                      href="tel:+79118108383" 
                      className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border hover:border-primary transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">8 (911) 810-83-83</p>
                        <p className="text-xs text-muted-foreground">Звоните нам</p>
                      </div>
                    </a>

                    {/* CTA Button */}
                    <Button 
                      variant="default" 
                      className="w-full h-14 text-base font-bold rounded-xl bg-gradient-to-r from-accent to-accent/80 hover:opacity-90"
                    >
                      Заказать звонок
                    </Button>

                    {/* Social Links */}
                    <div className="flex items-center justify-center gap-3">
                      <a 
                        href="https://t.me/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-background border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </a>
                      <a 
                        href="https://wa.me/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-background border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                      <button className="w-12 h-12 rounded-full bg-background border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors">
                        <HelpCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Bottom row - Navigation - Desktop */}
      <div className="hidden lg:block bg-background">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative h-full flex items-center text-sm font-semibold tracking-wide uppercase text-foreground
                  after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:-bottom-[1px] after:left-0 
                  after:bg-primary after:origin-center after:transition-transform after:duration-300 
                  hover:after:scale-x-100 ${
                  isActive(link.href) ? 'after:scale-x-100' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
