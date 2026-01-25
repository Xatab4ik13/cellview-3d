import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';

const pricingTiers = [
  {
    name: 'Маленькая',
    area: '0.5 - 2 м²',
    description: 'Для сезонных вещей, документов, спортивного инвентаря',
    price: 1200,
    features: [
      'Высота до 1.5 м',
      'Видеонаблюдение',
      'Круглосуточный доступ',
      'Личный кабинет',
    ],
    popular: false,
  },
  {
    name: 'Средняя',
    area: '2 - 6 м²',
    description: 'Для мебели при переезде, бытовой техники, велосипедов',
    price: 2800,
    features: [
      'Высота до 2.5 м',
      'Видеонаблюдение',
      'Круглосуточный доступ',
      'Личный кабинет',
      'Возможность установки полок',
    ],
    popular: true,
  },
  {
    name: 'Большая',
    area: '6 - 15 м²',
    description: 'Для полного содержимого квартиры, коммерческих товаров',
    price: 6500,
    features: [
      'Высота до 3 м',
      'Видеонаблюдение',
      'Круглосуточный доступ',
      'Личный кабинет',
      'Полки включены',
      'Электрическая розетка',
    ],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Тарифы и цены
          </h2>
          <p className="text-lg text-muted-foreground">
            Выберите размер ячейки под ваши потребности. Скидки при оплате за длительный период.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div 
              key={index}
              className={`relative p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 ${
                tier.popular 
                  ? 'border-primary bg-primary/5 shadow-primary scale-105' 
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Популярный
                </Badge>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.area}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">от {tier.price.toLocaleString('ru-RU')}</span>
                  <span className="text-muted-foreground">₽/мес</span>
                </div>
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
                className="w-full" 
                variant={tier.popular ? 'default' : 'outline'}
                size="lg"
              >
                Выбрать
              </Button>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-12 lg:mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Нужна ячейка особого размера? Свяжитесь с нами для индивидуального расчета
          </p>
          <Button variant="outline" size="lg">
            Рассчитать стоимость
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
