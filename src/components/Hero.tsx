import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Box, Shield, Clock, Eye, Maximize } from 'lucide-react';
import StorageUnit3D from './StorageUnit3D';

const Hero = () => {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  
  const features = [
    { icon: Box, text: 'От 0.5 до 15 м²' },
    { icon: Shield, text: 'Видеонаблюдение 24/7' },
    { icon: Clock, text: 'Доступ круглосуточно' },
    { icon: Eye, text: 'Онлайн просмотр' },
  ];

  return (
    <section className="relative min-h-screen pt-20 lg:pt-24 overflow-hidden gradient-hero">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-sm font-medium text-primary">Санкт-Петербург, ул. Алтайская, 21</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Индивидуальные
                <span className="text-gradient-primary block">кладовые ячейки</span>
                для хранения
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                Арендуйте персональную ячейку для хранения вещей с круглосуточным доступом и видеонаблюдением онлайн
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/3d-map">
                <Button variant="hero" size="lg">
                  Открыть 3D-карту
                  <Maximize className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/catalog">
                <Button variant="heroSecondary" size="lg">
                  Каталог ячеек
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Price hint */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">от 1 200 ₽</span>
              <span className="text-muted-foreground">/ месяц</span>
            </div>
          </div>

          {/* Right side - 3D View */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-border/50">
              <StorageUnit3D 
                selectedCell={selectedCell} 
                onSelectCell={setSelectedCell} 
              />
              
              {/* 3D Controls hint */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                <div className="glass px-4 py-2 rounded-full text-sm text-muted-foreground">
                  🖱️ Вращайте и приближайте для просмотра
                </div>
              </div>
              
              {/* Link to full 3D map */}
              <Link 
                to="/3d-map" 
                className="absolute top-4 right-4 glass px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-2"
              >
                <Maximize className="w-4 h-4" />
                Полная карта
              </Link>
            </div>
            
            {/* Selected cell info */}
            {selectedCell && (
              <div className="absolute top-4 left-4 glass p-4 rounded-xl shadow-lg animate-scale-in">
                <p className="text-sm text-muted-foreground">Выбрана ячейка</p>
                <p className="text-2xl font-bold text-primary">№{selectedCell}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
