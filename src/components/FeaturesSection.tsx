import { 
  Shield, 
  Video, 
  Key, 
  Clock, 
  Wifi,
  Car,
  Coffee,
  Lightbulb
} from 'lucide-react';

const freeServices = [
  { icon: Wifi, title: 'Быстрый интернет' },
  { icon: Lightbulb, title: 'Розетки' },
  { icon: Car, title: 'Парковка' },
  { icon: Coffee, title: 'Горячие напитки' },
];

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
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 lg:py-24 bg-background">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Free services */}
        <div className="bg-primary rounded-3xl p-8 lg:p-12">
          <h3 className="text-2xl lg:text-3xl font-bold text-primary-foreground text-center mb-8">
            Бесплатные услуги
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {freeServices.map((service, index) => (
              <div 
                key={index}
                className="flex flex-col items-center gap-3 p-4 bg-primary-foreground/10 rounded-2xl"
              >
                <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <service.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-primary-foreground text-center">
                  {service.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
