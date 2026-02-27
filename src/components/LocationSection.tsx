import { MapPin, Phone, Clock, Navigation, Car, Train } from 'lucide-react';
import { Button } from '@/components/ui/button';
import storageCellImage from '@/assets/storage-cell-1.jpg';

const LocationSection = () => {
  return (
    <section id="location" className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Расположение <span className="text-gradient-primary">склада</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Удобное расположение с круглосуточным доступом к вашим вещам
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Map */}
          <div className="order-2 lg:order-1">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-lg">
              <iframe 
                src="https://yandex.ru/map-widget/v1/?um=constructor%3A0&amp;source=constructor&amp;ll=30.4%2C59.9&amp;z=15&amp;pt=30.4%2C59.9%2Cpm2rdm"
                width="100%" 
                height="100%" 
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Расположение склада Кладовка78 на карте"
              />
            </div>
            
            {/* Transport info */}
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Train className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">На метро</h4>
                  <p className="text-xs text-muted-foreground">
                    Ст. Ладожская — 10 мин пешком
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">На машине</h4>
                  <p className="text-xs text-muted-foreground">
                    Бесплатная парковка у входа
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address info card */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
              {/* Header with image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={storageCellImage} 
                  alt="Склад Кладовка78"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-semibold">
                      Санкт-Петербург
                    </span>
                    <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                      1 склад
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Details */}
              <div className="p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Адрес склада</h3>
                    <p className="text-muted-foreground">
                      Санкт-Петербург, ул. Алтайская, д. 21
                    </p>
                    <p className="text-muted-foreground">
                      Помещение 22-Н
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Телефон</h3>
                    <a 
                      href="tel:+79118108383" 
                      className="text-xl font-bold text-primary hover:underline"
                    >
                      8 (911) 810-83-83
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">Звоните нам</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Режим работы</h3>
                    <p className="text-muted-foreground">Офис: Пн-Пт 9:00-18:00</p>
                    <p className="text-primary font-semibold">Доступ к ячейкам: 24/7</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1" size="lg">
                      <Navigation className="w-4 h-4" />
                      Построить маршрут
                    </Button>
                    <Button variant="outline" className="flex-1" size="lg" asChild>
                      <a href="tel:+79118108383">
                        <Phone className="w-4 h-4" />
                        Позвонить
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Price badge */}
            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Цена</p>
                <p className="text-2xl font-bold text-primary">1500 ₽/м³</p>
              </div>
              <div className="flex-1 text-sm text-muted-foreground">
                Ячейки от 0,5 м³ до 10 м³ с круглосуточным доступом и видеонаблюдением
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
