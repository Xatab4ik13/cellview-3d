import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PriceCalculator from '@/components/PriceCalculator';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const pricingTiers = [
    {
      name: 'Маленькая',
      size: '0.5 - 2 м²',
      price: 'от 1 200 ₽',
      period: '/месяц',
      description: 'Для документов, сезонных вещей, спортинвентаря',
      features: [
        'Площадь 0.5 - 2 м²',
        'Высота до 2 м',
        'Круглосуточный доступ',
        'Видеонаблюдение',
      ],
      popular: false,
    },
    {
      name: 'Средняя',
      size: '2 - 6 м²',
      price: 'от 2 500 ₽',
      period: '/месяц',
      description: 'Для мебели, бытовой техники, товаров бизнеса',
      features: [
        'Площадь 2 - 6 м²',
        'Высота до 2.5 м',
        'Круглосуточный доступ',
        'Видеонаблюдение',
        'Возможна розетка',
      ],
      popular: true,
    },
    {
      name: 'Большая',
      size: '6 - 15 м²',
      price: 'от 6 000 ₽',
      period: '/месяц',
      description: 'Для содержимого квартиры, крупных товаров',
      features: [
        'Площадь 6 - 15 м²',
        'Высота до 3 м',
        'Круглосуточный доступ',
        'Видеонаблюдение',
        'Розетка включена',
        'Полки опционально',
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 lg:pt-36">
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="heading-display mb-4">
                Тарифы и <span className="text-primary">цены</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                Выберите размер ячейки под ваши нужды. Все цены включают охрану и видеонаблюдение
              </p>
            </div>

            {/* Price Calculator */}
            <div className="max-w-5xl mx-auto mb-20">
              <PriceCalculator />
            </div>
            {/* Pricing Cards - now below calculator */}
            <div className="text-center mb-10">
              <h2 className="heading-section mb-3">
                Категории <span className="text-primary">ячеек</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Три размера для любых потребностей
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
              {pricingTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`relative rounded-2xl border-2 p-6 lg:p-8 transition-all ${
                    tier.popular
                      ? 'border-primary bg-card shadow-xl scale-105'
                      : 'border-border bg-card hover:border-primary/50 hover:shadow-lg'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 gradient-primary text-primary-foreground text-sm font-bold rounded-full shadow-primary">
                      Популярный
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{tier.size}</p>
                  </div>
                  
                  <div className="text-center mb-6">
                    <span className="text-3xl font-extrabold text-primary">{tier.price}</span>
                    <span className="text-muted-foreground font-medium">{tier.period}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    {tier.description}
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm font-medium">
                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/catalog">
                    <Button 
                      className="w-full font-bold" 
                      variant={tier.popular ? 'default' : 'outline'}
                    >
                      Выбрать ячейку
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="bg-secondary/50 rounded-2xl p-8 max-w-4xl mx-auto border-2 border-border">
              <h2 className="text-2xl font-bold mb-6 text-center">Дополнительные услуги</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                    <span className="font-medium">Установка полок</span>
                    <span className="font-bold text-primary">500 ₽/полка</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                    <span className="font-medium">Розетка в ячейке</span>
                    <span className="font-bold text-primary">+ 300 ₽/мес</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                    <span className="font-medium">Помощь с разгрузкой</span>
                    <span className="font-bold text-primary">от 1 000 ₽</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                    <span className="font-medium">Страхование вещей</span>
                    <span className="font-bold text-primary">от 200 ₽/мес</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                    <span className="font-medium">Упаковочные материалы</span>
                    <span className="font-bold text-primary">от 100 ₽</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                    <span className="font-medium">Выставление счета ЮЛ</span>
                    <span className="font-bold text-emerald-600">бесплатно</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
