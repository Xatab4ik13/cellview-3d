import { 
  Shield, 
  Video, 
  Phone, 
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
    icon: Phone,
    title: 'Доступ по звонку',
    description: 'Позвоните на номер — дверь откроется автоматически',
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
          <h2 className="heading-section mb-4">
            Почему выбирают <span className="text-primary">нас</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Современные кладовые с полным контролем и удобным управлением
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 bg-card border-2 border-border rounded-2xl hover:border-primary hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl gradient-primary shadow-primary flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Free services */}
        <div className="gradient-primary rounded-3xl p-8 lg:p-12 shadow-primary">
          <h3 className="text-2xl lg:text-3xl font-bold text-primary-foreground text-center mb-8">
            Бесплатные услуги
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {freeServices.map((service, index) => (
              <div 
                key={index}
                className="flex flex-col items-center gap-3 p-5 bg-primary-foreground/15 rounded-2xl border border-primary-foreground/20 hover:bg-primary-foreground/25 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-accent">
                  <service.icon className="w-8 h-8 text-accent-foreground" />
                </div>
                <span className="text-sm font-bold text-primary-foreground text-center">
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
