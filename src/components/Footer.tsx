import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <div>
                <span className="font-bold text-xl text-background">Storage</span>
                <span className="font-bold text-xl text-primary">Box</span>
              </div>
            </a>
            <p className="text-background/70 text-sm">
              Современные кладовые помещения для хранения ваших вещей с круглосуточным доступом и онлайн-видеонаблюдением.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2">
              {[
                { href: '#catalog', label: 'Каталог ячеек' },
                { href: '#pricing', label: 'Цены' },
                { href: '#features', label: 'Преимущества' },
                { href: '#contacts', label: 'Контакты' },
              ].map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href}
                    className="text-background/70 hover:text-background transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Услуги</h3>
            <ul className="space-y-2 text-sm text-background/70">
              <li>Аренда кладовых</li>
              <li>Хранение мебели</li>
              <li>Сезонное хранение</li>
              <li>Склад для бизнеса</li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="font-semibold mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-background/70">
                <Phone className="w-4 h-4" />
                <a href="tel:+78121234567" className="hover:text-background transition-colors">
                  +7 (812) 123-45-67
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-background/70">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@storagebox.ru" className="hover:text-background transition-colors">
                  info@storagebox.ru
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-background/70">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>СПб, ул. Алтайская, 21</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/50">
            © {currentYear} StorageBox. Все права защищены.
          </p>
          <div className="flex gap-6">
            <a href="/privacy" className="text-sm text-background/50 hover:text-background transition-colors">
              Политика конфиденциальности
            </a>
            <a href="/terms" className="text-sm text-background/50 hover:text-background transition-colors">
              Условия использования
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
