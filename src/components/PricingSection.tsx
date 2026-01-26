import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight } from 'lucide-react';

const pricingTiers = [
  {
    name: 'Маленький',
    area: '0.5 - 6 м²',
    description: 'Для сезонных вещей, документов, спортивного инвентаря',
    price: 1200,
    pricePerMeter: 2400,
    features: [
      'Видеонаблюдение 24/7',
      'Круглосуточный доступ',
      'Личный PIN-код',
      'Онлайн-контроль',
    ],
    popular: false,
  },
  {
    name: 'Средний',
    area: '6 - 15 м²',
    description: 'Для мебели при переезде, бытовой техники, велосипедов',
    price: 2800,
    pricePerMeter: 2100,
    features: [
      'Видеонаблюдение 24/7',
      'Круглосуточный доступ',
      'Личный PIN-код',
      'Онлайн-контроль',
      'Возможность установки полок',
    ],
    popular: true,
  },
  {
    name: 'Большой',
    area: 'от 15 м²',
    description: 'Для полного содержимого квартиры, коммерческих товаров',
    price: 6500,
    pricePerMeter: 1900,
    features: [
      'Видеонаблюдение 24/7',
      'Круглосуточный доступ',
      'Личный PIN-код',
      'Онлайн-контроль',
      'Полки включены',
      'Электрическая розетка',
    ],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Стоимость аренды
          </h2>
          <p className="text-lg text-muted-foreground">
            Выберите размер склада под ваши потребности. Скидки при длительной аренде.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div 
              key={index}
              className={`relative p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 ${
                tier.popular 
                  ? 'border-primary bg-card shadow-primary scale-105' 
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                  Популярный выбор
                </Badge>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.area}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-primary">от {tier.price.toLocaleString('ru-RU')}</span>
                  <span className="text-muted-foreground">₽/мес</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  от {tier.pricePerMeter.toLocaleString('ru-RU')} ₽/м²/мес
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground text-center mb-6">
                {tier.description}
              </p>
              
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full gap-2" 
                variant={tier.popular ? 'default' : 'outline'}
                size="lg"
              >
                Забронировать
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Discount banner */}
        <div className="mt-12 lg:mt-16 bg-accent/10 border border-accent/20 rounded-2xl p-6 lg:p-8 text-center max-w-3xl mx-auto">
          <h3 className="text-xl font-bold mb-2">Скидка до 50% для новых клиентов!</h3>
          <p className="text-muted-foreground mb-4">
            Подробности акции уточняйте у менеджеров
          </p>
          <Button variant="default" size="lg">
            Узнать подробности
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
