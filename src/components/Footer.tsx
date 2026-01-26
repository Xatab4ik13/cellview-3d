import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import logo from '@/assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { href: '/catalog', label: 'Адреса складов' },
    { href: '/pricing', label: 'Стоимость' },
    { href: '/faq', label: 'Вопрос-ответ' },
    { href: '/contacts', label: 'Контакты' },
  ];

  const services = [
    'Аренда кладовых',
    'Хранение мебели',
    'Сезонное хранение',
    'Склад для бизнеса',
    'Хранение товаров',
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Кладовка78" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              Склад для дома и бизнеса. Современные кладовые помещения для хранения ваших вещей с круглосуточным доступом.
            </p>
            
            {/* Social */}
            <div className="flex gap-3 pt-2">
              <a 
                href="https://t.me/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a 
                href="https://wa.me/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4 text-background">Навигация</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-background/70 hover:text-background hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-background">Услуги</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index} className="text-sm text-background/70">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="font-semibold mb-4 text-background">Контакты</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-background/50 text-xs">Бесплатно по РФ</p>
                  <a href="tel:+78121234567" className="text-background hover:text-primary transition-colors font-medium">
                    +7 (812) 123-45-67
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <a href="mailto:info@kladovka78.ru" className="text-background hover:text-primary transition-colors">
                  info@kladovka78.ru
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="text-background/70">
                  Санкт-Петербург,<br />
                  ул. Алтайская, 21
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div className="text-background/70">
                  <p>Офис: Пн-Пт 9:00-18:00</p>
                  <p className="text-accent font-medium">Склад: 24/7</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-background/50">
              © {currentYear} Кладовка78. Все права защищены.
            </p>
            <div className="flex gap-6">
              <Link to="/faq" className="text-sm text-background/50 hover:text-background transition-colors">
                FAQ
              </Link>
              <a href="/privacy" className="text-sm text-background/50 hover:text-background transition-colors">
                Политика конфиденциальности
              </a>
              <a href="/consent" className="text-sm text-background/50 hover:text-background transition-colors">
                Согласие на обработку данных
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
