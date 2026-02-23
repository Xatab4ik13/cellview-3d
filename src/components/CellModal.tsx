import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageCell, calculatePrice, RESERVATION_HOURS } from '@/types/storage';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Grid3X3, 
  Video, 
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CellModalProps {
  cell: StorageCell | null;
  isOpen: boolean;
  onClose: () => void;
}

type DurationOption = 1 | 3 | 6 | 12;

const CellModal = ({ cell, isOpen, onClose }: CellModalProps) => {
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(1);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Сброс индекса фото при смене ячейки
  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [cell?.id]);
  
  if (!cell) return null;
  
  const photos = cell.photos;
  
  const monthlyPrice = calculatePrice(cell.volume);
  
  // Скидки по длительности
  const discounts: Record<DurationOption, number> = {
    1: 0,
    3: 5,
    6: 10,
    12: 15,
  };
  
  const durationLabels: Record<DurationOption, string> = {
    1: '1 месяц',
    3: '3 месяца',
    6: '6 месяцев',
    12: '12 месяцев',
  };
  
  const calculateTotalPrice = (months: DurationOption) => {
    const discount = discounts[months];
    const totalBeforeDiscount = monthlyPrice * months;
    const discountAmount = Math.floor(totalBeforeDiscount * discount / 100);
    return Math.ceil((totalBeforeDiscount - discountAmount) / 10) * 10;
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">Ячейка №{cell.number}</span>
            <Badge variant="success">Свободна</Badge>
          </DialogTitle>
          <DialogDescription>
            Площадь {cell.area} м² • Объем {cell.volume} м³ • Ярус {cell.tier}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Photo Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border">
              <img 
                src={photos[currentPhotoIndex]} 
                alt={`Ячейка №${cell.number} - фото ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors border border-border"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors border border-border"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              
              {/* Photo counter */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-sm border border-border">
                {currentPhotoIndex + 1} / {photos.length}
              </div>
            </div>
            
            {/* Thumbnail gallery */}
            <div className="flex gap-2 justify-center">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    currentPhotoIndex === index 
                      ? 'border-primary' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img 
                    src={photo} 
                    alt={`Миниатюра ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details & Booking */}
          <div className="space-y-6">
            {/* Dimensions */}
            <div className="p-4 bg-muted rounded-xl">
              <h3 className="font-semibold mb-3">Размеры</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{cell.width}</p>
                  <p className="text-sm text-muted-foreground">Ширина, м</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{cell.height}</p>
                  <p className="text-sm text-muted-foreground">Высота, м</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{cell.depth}</p>
                  <p className="text-sm text-muted-foreground">Глубина, м</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="p-4 bg-muted rounded-xl">
              <h3 className="font-semibold mb-3">Особенности</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {cell.hasShelves ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground" />
                  )}
                  <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                  <span className={cell.hasShelves ? '' : 'text-muted-foreground'}>
                    Полки для хранения
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <Video className="w-4 h-4 text-muted-foreground" />
                  <span>Видеонаблюдение 24/7</span>
                </div>
              </div>
            </div>

            {/* Duration selector */}
            <div>
              <h3 className="font-semibold mb-3">Срок аренды</h3>
              <div className="grid grid-cols-2 gap-2">
                {([1, 3, 6, 12] as const).map((duration) => {
                  const discount = discounts[duration];
                  const totalPrice = calculateTotalPrice(duration);
                  
                  return (
                    <button
                      key={duration}
                      onClick={() => setSelectedDuration(duration)}
                      className={`p-3 rounded-xl border-2 transition-all relative ${
                        selectedDuration === duration
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {discount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      )}
                      <p className="font-semibold">{durationLabels[duration]}</p>
                      <p className="text-lg font-bold text-primary">
                        {totalPrice.toLocaleString('ru-RU')} ₽
                      </p>
                      {discount > 0 && (
                        <p className="text-xs text-muted-foreground line-through">
                          {(monthlyPrice * duration).toLocaleString('ru-RU')} ₽
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => {
                  onClose();
                  navigate('/auth', { 
                    state: { 
                      cellId: cell.id, 
                      cellNumber: cell.number, 
                      duration: selectedDuration, 
                      totalPrice: calculateTotalPrice(selectedDuration) 
                    } 
                  });
                }}
              >
                Забронировать за {calculateTotalPrice(selectedDuration).toLocaleString('ru-RU')} ₽
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Ячейка будет зарезервирована на {RESERVATION_HOURS} часа для оплаты
              </p>
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => window.open('https://t.me/kladovka78_bot', '_blank')}
              >
                Связаться с менеджером
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CellModal;