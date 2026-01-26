import { StorageCell } from '@/types/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Grid3X3 } from 'lucide-react';

interface CellCardProps {
  cell: StorageCell;
  onSelect: (cell: StorageCell) => void;
}

// Вариант A: Минималистичная проекция с тонкими линиями размеров
const CellCardVariantA = ({ cell, onSelect }: CellCardProps) => {
  // Определяем тип ячейки: куб или высокий прямоугольник
  const aspectRatio = cell.height / cell.width;
  const isTall = aspectRatio > 1.3;
  
  return (
    <div 
      className={`group relative bg-card border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        cell.isAvailable 
          ? 'border-border hover:border-primary/50 cursor-pointer' 
          : 'border-border/50 opacity-75'
      }`}
      onClick={() => cell.isAvailable && onSelect(cell)}
    >
      {/* Status badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge variant={cell.isAvailable ? 'success' : 'secondary'}>
          {cell.isAvailable ? 'Свободна' : 'Занята'}
        </Badge>
      </div>
      
      {/* Cell number badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
          <span className="text-accent-foreground font-bold text-lg">
            {cell.number}
          </span>
        </div>
      </div>

      {/* Projection visualization */}
      <div className="relative pt-16 pb-6 px-6 bg-gradient-to-br from-secondary to-muted/50">
        <div className="flex justify-center items-end h-[180px]">
          {/* Cell projection with dimension lines */}
          <div className="relative">
            {/* Width dimension line (top) */}
            <div className="absolute -top-8 left-0 right-0 flex items-center justify-center">
              <div className="flex items-center gap-1">
                <div className="w-1 h-3 bg-muted-foreground/60"></div>
                <div className="h-[1px] flex-1 bg-muted-foreground/60 min-w-[40px]"></div>
                <span className="text-xs font-medium text-muted-foreground px-1 bg-secondary rounded">
                  {cell.width}м
                </span>
                <div className="h-[1px] flex-1 bg-muted-foreground/60 min-w-[40px]"></div>
                <div className="w-1 h-3 bg-muted-foreground/60"></div>
              </div>
            </div>

            {/* Height dimension line (right) */}
            <div className="absolute -right-12 top-0 bottom-0 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center gap-1 h-full">
                <div className="h-1 w-3 bg-muted-foreground/60"></div>
                <div className="w-[1px] flex-1 bg-muted-foreground/60"></div>
                <span className="text-xs font-medium text-muted-foreground py-1 px-1 bg-secondary rounded -rotate-90">
                  {cell.height}м
                </span>
                <div className="w-[1px] flex-1 bg-muted-foreground/60"></div>
                <div className="h-1 w-3 bg-muted-foreground/60"></div>
              </div>
            </div>

            {/* The cell shape */}
            <div 
              className={`relative transition-transform duration-300 group-hover:scale-105 ${
                cell.isAvailable ? 'bg-primary' : 'bg-muted-foreground/40'
              }`}
              style={{
                width: isTall ? '80px' : '100px',
                height: isTall ? '140px' : '100px',
                borderRadius: '8px',
              }}
            >
              {/* Door lines */}
              <div className="absolute inset-2 flex flex-col justify-around">
                {[1, 2, 3].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-0.5 rounded-full ${
                      cell.isAvailable ? 'bg-primary-foreground/20' : 'bg-background/20'
                    }`} 
                  />
                ))}
              </div>
              
              {/* Lock/Handle indicator */}
              <div className={`absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full ${
                cell.isAvailable ? 'bg-accent' : 'bg-muted'
              }`}></div>
            </div>

            {/* Depth indicator (perspective line) */}
            <div 
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded"
            >
              глуб. {cell.depth}м
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Area & Volume */}
        <div className="flex items-center justify-between text-sm border-b border-border pb-3">
          <div className="text-muted-foreground">
            Площадь: <span className="font-semibold text-foreground">{cell.area} м²</span>
          </div>
          <div className="text-muted-foreground">
            Объём: <span className="font-semibold text-foreground">{cell.volume} м³</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex gap-2">
          {cell.hasSocket && (
            <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">
              <Zap className="w-3 h-3" />
              Розетка
            </div>
          )}
          {cell.hasShelves && (
            <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">
              <Grid3X3 className="w-3 h-3" />
              Полки
            </div>
          )}
          {cell.tier > 1 && (
            <div className="flex items-center gap-1 text-xs text-accent-foreground bg-accent/20 px-2 py-1 rounded-md">
              {cell.tier} ярус
            </div>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {cell.pricePerMonth.toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-xs text-muted-foreground">в месяц</p>
          </div>
          
          {cell.isAvailable ? (
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Забронировать
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              Занята
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CellCardVariantA;
