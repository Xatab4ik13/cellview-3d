import { StorageCell } from '@/types/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Box, Zap, Grid3X3, Eye } from 'lucide-react';

interface CellCardProps {
  cell: StorageCell;
  onSelect: (cell: StorageCell) => void;
}

const CellCard = ({ cell, onSelect }: CellCardProps) => {
  return (
    <div 
      className={`group relative bg-card border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        cell.isAvailable 
          ? 'border-border hover:border-primary/50 cursor-pointer' 
          : 'border-border/50 opacity-75'
      }`}
      onClick={() => cell.isAvailable && onSelect(cell)}
    >
      {/* Cell visualization */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-secondary to-muted overflow-hidden">
        {/* 3D-like cell representation */}
        <div className="absolute inset-4 flex items-center justify-center">
          <div 
            className={`relative w-full h-full max-w-[120px] max-h-[120px] rounded-lg transition-transform duration-300 group-hover:scale-105 ${
              cell.isAvailable ? 'bg-primary' : 'bg-muted-foreground/50'
            }`}
            style={{
              boxShadow: cell.isAvailable 
                ? '8px 8px 0 0 hsl(var(--accent))' 
                : '8px 8px 0 0 hsl(var(--muted))',
            }}
          >
            {/* Door lines */}
            <div className="absolute inset-0 flex flex-col justify-around py-3 px-2">
              {[1, 2, 3].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full ${
                    cell.isAvailable ? 'bg-primary-foreground/20' : 'bg-background/20'
                  }`} 
                />
              ))}
            </div>
            
            {/* Cell number */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-bold ${
                cell.isAvailable ? 'text-accent' : 'text-muted'
              }`}>
                {cell.number}
              </span>
            </div>
          </div>
        </div>
        
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={cell.isAvailable ? 'success' : 'secondary'}>
            {cell.isAvailable ? 'Свободна' : 'Занята'}
          </Badge>
        </div>
        
        {/* Tier badge */}
        {cell.tier > 1 && (
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-background/80">
              {cell.tier} ярус
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Dimensions */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Ширина</p>
            <p className="font-semibold">{cell.width} м</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Высота</p>
            <p className="font-semibold">{cell.height} м</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Глубина</p>
            <p className="font-semibold">{cell.depth} м</p>
          </div>
        </div>

        {/* Area & Volume */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Box className="w-4 h-4" />
            <span>{cell.area} м²</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{cell.volume} м³</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex gap-2">
          {cell.hasSocket && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              <Zap className="w-3 h-3" />
              Розетка
            </div>
          )}
          {cell.hasShelves && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              <Grid3X3 className="w-3 h-3" />
              Полки
            </div>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {cell.pricePerMonth.toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-xs text-muted-foreground">в месяц</p>
          </div>
          
          {cell.isAvailable ? (
            <Button size="sm" className="gap-1">
              <Eye className="w-4 h-4" />
              Подробнее
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

export default CellCard;
