import { 
  Shield, 
  Video, 
  Key, 
  Clock, 
  Smartphone, 
  CreditCard,
  ThermometerSnowflake,
  MapPin
} from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'Видеонаблюдение 24/7',
    description: 'Онлайн-доступ к камерам вашей ячейки в личном кабинете',
  },
  {
    icon: Key,
    title: 'Персональный код',
    description: 'Индивидуальный PIN-код для доступа в помещение',
  },
  {
    icon: Clock,
    title: 'Круглосуточный доступ',
    description: 'Посещайте склад в любое удобное время без ограничений',
  },
  {
    icon: Shield,
    title: 'Надежная безопасность',
    description: 'Охранная сигнализация и контроль доступа',
  },
  {
    icon: Smartphone,
    title: 'Управление онлайн',
    description: 'Бронируйте и оплачивайте через личный кабинет',
  },
  {
    icon: CreditCard,
    title: 'Гибкая оплата',
    description: 'Разовый платеж, подписка или рассрочка',
  },
  {
    icon: ThermometerSnowflake,
    title: 'Климат-контроль',
    description: 'Оптимальная температура и влажность круглый год',
  },
  {
    icon: MapPin,
    title: 'Удобное расположение',
    description: 'СПб, ул. Алтайская, 21 — рядом с метро',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Почему выбирают нас
          </h2>
          <p className="text-lg text-muted-foreground">
            Современные кладовые с полным контролем и удобным управлением
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
