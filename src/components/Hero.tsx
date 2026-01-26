import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Clock, Video, Key } from 'lucide-react';
import storageHero1 from '@/assets/storage-hero-1.jpg';
import storageHero2 from '@/assets/storage-hero-2.jpg';
import storageHero3 from '@/assets/storage-hero-3.jpg';

const sizeOptions = [
  { label: 'Маленький', range: '0,5 - 6 м²' },
  { label: 'Средний', range: '6 - 15 м²' },
  { label: 'Большой', range: 'от 15 м²' },
];

const locations = [
  { city: 'Санкт-Петербург', count: '1 склад' },
];

const heroSlides = [
  {
    image: storageHero1,
    title: 'Надёжная защита ваших вещей',
    subtitle: 'Современная система безопасности и круглосуточное видеонаблюдение',
  },
  {
    image: storageHero2,
    title: 'Доступ в любое время',
    subtitle: 'Приходите когда удобно — склад работает 24 часа в сутки, 7 дней в неделю',
  },
  {
    image: storageHero3,
    title: 'Ваш личный код доступа',
    subtitle: 'Только вы имеете доступ к своей кладовке с уникальным PIN-кодом',
  },
];

const Hero = () => {
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: Shield, text: 'Безопасность' },
    { icon: Video, text: 'Видеонаблюдение' },
    { icon: Clock, text: 'Доступ 24/7' },
    { icon: Key, text: 'Личный код' },
  ];

  return (
    <section className="relative min-h-screen pt-32 lg:pt-36 overflow-hidden bg-background">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground">
                Кладовка78 - хранение
                <span className="block text-primary">вещей</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                Снять место недорого можно у нас!
              </p>
            </div>

            {/* Size selector card */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-lg">
              <h3 className="font-semibold text-foreground mb-4">Размер склада</h3>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {sizeOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(index)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      selectedSize === index 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="block text-xs text-muted-foreground">{option.range}</span>
                  </button>
                ))}
              </div>

              {/* Location */}
              <div className="flex flex-wrap gap-4 mb-6">
                {locations.map((loc, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-semibold text-primary">{loc.city}</span>
                    <span className="text-muted-foreground ml-2">{loc.count}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/catalog" className="flex-1">
                  <Button variant="default" size="lg" className="w-full">
                    Забронировать склад
                  </Button>
                </Link>
                <Button variant="accent" size="lg" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                  Скидка 50%*
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-3">
                * Подробности уточняйте у менеджеров
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center gap-2 p-3 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Image Carousel */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Carousel images */}
              {heroSlides.map((slide, index) => (
                <img
                  key={index}
                  src={slide.image}
                  alt={slide.title}
                  className={`w-full h-[400px] lg:h-[600px] object-cover absolute inset-0 transition-opacity duration-700 ${
                    currentSlide === index ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              {/* First image as base for layout */}
              <img
                src={heroSlides[0].image}
                alt=""
                className="w-full h-[400px] lg:h-[600px] object-cover invisible"
              />
              
              {/* Text overlay with semi-transparent purple background */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-primary/80 backdrop-blur-sm px-6 py-4 rounded-2xl transition-all duration-500">
                  <p className="text-primary-foreground text-lg lg:text-xl font-bold mb-1">
                    {heroSlides[currentSlide].title}
                  </p>
                  <p className="text-primary-foreground/90 text-sm lg:text-base">
                    {heroSlides[currentSlide].subtitle}
                  </p>
                </div>
              </div>

              {/* Slide indicators */}
              <div className="absolute bottom-6 right-6 flex gap-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentSlide === index 
                        ? 'bg-accent w-6' 
                        : 'bg-primary-foreground/50 hover:bg-primary-foreground/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
