import { useState, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calculator, Percent, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculatePrice } from '@/types/storage';

type DurationOption = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Скидки по длительности
const getDiscount = (months: number): number => {
  if (months >= 12) return 15;
  if (months >= 6) return 10;
  if (months >= 3) return 5;
  return 0;
};

const PriceCalculator = () => {
  const [volume, setVolume] = useState<number>(2);
  const [duration, setDuration] = useState<number>(1);

  const calculations = useMemo(() => {
    const monthlyPrice = calculatePrice(volume);
    const discount = getDiscount(duration);
    const totalBeforeDiscount = monthlyPrice * duration;
    const discountAmount = Math.floor(totalBeforeDiscount * discount / 100);
    const totalPrice = Math.ceil((totalBeforeDiscount - discountAmount) / 10) * 10;
    const pricePerMonth = Math.ceil(totalPrice / duration / 10) * 10;

    return {
      monthlyPrice,
      discount,
      totalBeforeDiscount,
      discountAmount,
      totalPrice,
      pricePerMonth,
    };
  }, [volume, duration]);

  const getDurationLabel = (months: number): string => {
    if (months === 1) return '1 месяц';
    if (months >= 2 && months <= 4) return `${months} месяца`;
    return `${months} месяцев`;
  };

  return (
    <div className="bg-card border-2 border-primary/20 rounded-3xl p-6 lg:p-10 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-14 h-14 rounded-2xl gradient-primary shadow-primary flex items-center justify-center">
          <Calculator className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold">Калькулятор стоимости</h2>
          <p className="text-muted-foreground">Рассчитайте стоимость аренды</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Sliders */}
        <div className="space-y-8">
          {/* Volume slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg">Объём хранения</span>
              </div>
              <div className="bg-primary/10 px-4 py-2 rounded-xl">
                <span className="text-2xl font-bold text-primary">{volume.toFixed(1)}</span>
                <span className="text-muted-foreground ml-1">м³</span>
              </div>
            </div>
            <Slider
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              min={0.5}
              max={10}
              step={0.1}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0.5 м³</span>
              <span>5 м³</span>
              <span>10 м³</span>
            </div>
          </div>

          {/* Duration slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg">Срок аренды</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 px-4 py-2 rounded-xl">
                  <span className="text-2xl font-bold text-primary">{duration}</span>
                  <span className="text-muted-foreground ml-1">мес</span>
                </div>
                {calculations.discount > 0 && (
                  <Badge variant="accent" className="bg-accent text-accent-foreground font-bold text-sm px-3 py-1">
                    -{calculations.discount}%
                  </Badge>
                )}
              </div>
            </div>
            <Slider
              value={[duration]}
              onValueChange={([d]) => setDuration(d)}
              min={1}
              max={12}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1 мес</span>
              <span className="text-primary font-medium">3 мес (-5%)</span>
              <span className="text-primary font-medium">6 мес (-10%)</span>
              <span className="text-primary font-medium">12 мес (-15%)</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Price breakdown */}
          <div className="bg-secondary/50 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <span className="text-muted-foreground">Стоимость в месяц</span>
              <span className="text-lg font-semibold">
                {calculations.monthlyPrice.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <span className="text-muted-foreground">Срок аренды</span>
              <span className="text-lg font-semibold">{getDurationLabel(duration)}</span>
            </div>

            {calculations.discount > 0 && (
              <>
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground">Сумма без скидки</span>
                  <span className="text-lg text-muted-foreground line-through">
                    {calculations.totalBeforeDiscount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground flex items-center gap-2">
                    Скидка
                    <Badge variant="accent" className="bg-accent text-accent-foreground font-bold">
                      {calculations.discount}%
                    </Badge>
                  </span>
                  <span className="text-lg font-semibold text-emerald-600">
                    -{calculations.discountAmount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Total */}
          <div className="gradient-primary rounded-2xl p-6 shadow-primary">
            <div className="flex justify-between items-center mb-2">
              <span className="text-primary-foreground/80">Итого за {getDurationLabel(duration)}:</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl lg:text-5xl font-extrabold text-primary-foreground">
                {calculations.totalPrice.toLocaleString('ru-RU')}
              </span>
              <span className="text-xl text-primary-foreground/80">₽</span>
            </div>
            {calculations.discount > 0 && (
              <p className="text-primary-foreground/70 text-sm mt-2">
                Экономия {calculations.discountAmount.toLocaleString('ru-RU')} ₽
              </p>
            )}
          </div>

          {/* CTA */}
          <Link to="/catalog">
            <Button size="xl" className="w-full gap-2 text-lg font-bold shadow-primary">
              Выбрать ячейку
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;
