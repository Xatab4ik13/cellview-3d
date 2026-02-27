import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactsSection from '@/components/ContactsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';

const Contacts = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 lg:pt-36">
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Связаться <span className="text-gradient-primary">с нами</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Есть вопросы? Мы всегда на связи и готовы помочь с выбором ячейки
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Адрес</h3>
                      <p className="text-muted-foreground">
                        Санкт-Петербург, ул. Алтайская, д. 21<br />
                        Помещение 22-Н
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Телефон</h3>
                      <a href="tel:+79118108383" className="text-muted-foreground hover:text-primary transition-colors">
                        8 (911) 810-83-83
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <a href="mailto:info@kladovka78.ru" className="text-muted-foreground hover:text-primary transition-colors">
                        info@kladovka78.ru
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Telegram</h3>
                      <a href="https://t.me/kladovka78" className="text-muted-foreground hover:text-primary transition-colors">
                        @kladovka78
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Режим работы</h3>
                      <p className="text-muted-foreground">
                        Офис: Пн-Пт 9:00-18:00<br />
                        Доступ к ячейкам: 24/7
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="aspect-video rounded-2xl bg-muted overflow-hidden border border-border/50">
                  <iframe 
                    src="https://yandex.ru/map-widget/v1/?ll=30.421389%2C59.858333&z=16&pt=30.421389%2C59.858333%2Cpm2rdm&lang=ru_RU" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-card rounded-2xl border border-border/50 p-6 lg:p-8">
                <h2 className="text-2xl font-bold mb-6">Отправить сообщение</h2>
                
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Имя *</label>
                      <Input placeholder="Иван" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Телефон *</label>
                      <Input placeholder="+7 (999) 123-45-67" type="tel" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input placeholder="email@example.com" type="email" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Сообщение *</label>
                    <Textarea 
                      placeholder="Опишите ваш вопрос или укажите желаемый размер ячейки..."
                      rows={5}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Send className="w-4 h-4" />
                    Отправить
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contacts;
