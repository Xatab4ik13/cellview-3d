import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import storageCellImage from '@/assets/storage-cell-1.jpg';

const ContactsSection = () => {
  return (
    <section id="contacts" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Контакты
              </h2>
              <p className="text-lg text-muted-foreground">
                Свяжитесь с нами для бронирования или получения консультации
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Адрес склада</h3>
                  <p className="text-muted-foreground">
                    Санкт-Петербург, ул. Алтайская, д. 21<br />
                    Помещение 22-Н
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Телефон</h3>
                  <a 
                    href="tel:+79118108383" 
                    className="text-lg font-semibold text-primary hover:underline"
                  >
                    8 (911) 810-83-83
                  </a>
                  <p className="text-xs text-muted-foreground">Звоните нам</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a 
                    href="mailto:info@kladovka78.ru" 
                    className="text-primary hover:underline"
                  >
                    info@kladovka78.ru
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Режим работы</h3>
                  <p className="text-muted-foreground">
                    Офис: Пн-Пт 9:00-18:00<br />
                    <span className="text-accent font-semibold">Склад: Круглосуточно 24/7</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Photo of storage */}
            <div className="rounded-2xl overflow-hidden border border-border">
              <img 
                src={storageCellImage}
                alt="Кладовые помещения Кладовка78"
                className="w-full h-64 object-cover"
              />
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
            <h3 className="text-2xl font-bold mb-2">Оставить заявку</h3>
            <p className="text-muted-foreground mb-6">Мы перезвоним в течение 15 минут</p>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Имя *
                  </label>
                  <Input 
                    id="name" 
                    placeholder="Ваше имя" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Телефон *
                  </label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+7 (___) ___-__-__" 
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="size" className="text-sm font-medium">
                  Желаемый размер склада
                </label>
                <Input 
                  id="size" 
                  placeholder="Например: 2-3 м²" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Комментарий
                </label>
                <Textarea 
                  id="message" 
                  placeholder="Дополнительные пожелания..."
                  rows={4}
                />
              </div>
              
              <Button type="submit" className="w-full" size="lg">
                <Send className="w-5 h-5 mr-2" />
                Отправить заявку
              </Button>
              
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p>
                  Нажимая кнопку, вы даете согласие на обработку персональных данных и соглашаетесь с политикой конфиденциальности
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="mt-12 aspect-[21/9] bg-muted rounded-2xl overflow-hidden border border-border">
          <iframe 
            src="https://yandex.ru/map-widget/v1/?ll=30.421389%2C59.858333&z=16&pt=30.421389%2C59.858333%2Cpm2rdm&lang=ru_RU"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="Карта расположения склада Кладовка78"
          />
        </div>
      </div>
    </section>
  );
};

export default ContactsSection;
