import { StorageCell } from '@/types/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Grid3X3, ArrowRight } from 'lucide-react';

interface CellCardProps {
  cell: StorageCell;
  onSelect: (cell: StorageCell) => void;
}

// Вариант B: Изометрическая проекция с яркими акцентами
const CellCardVariantB = ({ cell, onSelect }: CellCardProps) => {
  // Определяем тип ячейки: куб или высокий прямоугольник
  const aspectRatio = cell.height / cell.width;
  const isTall = aspectRatio > 1.3;
  
  const cellWidth = isTall ? 70 : 90;
  const cellHeight = isTall ? 120 : 90;
  
  return (
    <div 
      className={`group relative bg-card border-2 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
        cell.isAvailable 
          ? 'border-primary/20 hover:border-primary cursor-pointer' 
          : 'border-border opacity-70'
      }`}
      onClick={() => cell.isAvailable && onSelect(cell)}
    >
      {/* Header with cell number */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            cell.isAvailable ? 'bg-primary' : 'bg-muted'
          }`}>
            <span className={`font-bold text-xl ${
              cell.isAvailable ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}>
              {cell.number}
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground">Ячейка №{cell.number}</p>
            <p className="text-xs text-muted-foreground">
              {isTall ? 'Высокая' : 'Стандартная'} • {cell.tier > 1 ? `${cell.tier} ярус` : '1 ярус'}
            </p>
          </div>
        </div>
        <Badge variant={cell.isAvailable ? 'success' : 'secondary'}>
          {cell.isAvailable ? 'Свободна' : 'Занята'}
        </Badge>
      </div>

      {/* Isometric projection with dimensions */}
      <div className="relative py-8 px-6 bg-gradient-to-b from-secondary/50 to-muted/30">
        <div className="flex justify-center items-center">
          <div className="relative">
            {/* Isometric cell shape */}
            <svg 
              viewBox="0 0 160 180" 
              className="w-[140px] h-[160px] transition-transform duration-300 group-hover:scale-110"
            >
              {/* Back face (depth) */}
              <polygon 
                points={isTall 
                  ? "80,10 130,30 130,130 80,150 30,130 30,30" 
                  : "80,30 130,50 130,120 80,140 30,120 30,50"
                }
                className={cell.isAvailable ? 'fill-primary/30' : 'fill-muted'}
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
              
              {/* Front face */}
              <polygon 
                points={isTall 
                  ? "30,30 80,10 80,110 30,130" 
                  : "30,50 80,30 80,110 30,130"
                }
                className={cell.isAvailable ? 'fill-primary' : 'fill-muted-foreground/40'}
              />
              
              {/* Side face */}
              <polygon 
                points={isTall 
                  ? "80,10 130,30 130,130 80,110" 
                  : "80,30 130,50 130,130 80,110"
                }
                className={cell.isAvailable ? 'fill-primary/80' : 'fill-muted-foreground/30'}
              />
              
              {/* Top face */}
              <polygon 
                points={isTall 
                  ? "30,30 80,10 130,30 80,50" 
                  : "30,50 80,30 130,50 80,70"
                }
                className={cell.isAvailable ? 'fill-accent' : 'fill-muted/80'}
              />
              
              {/* Door lines on front face */}
              <line 
                x1="45" y1={isTall ? "50" : "65"} 
                x2="65" y2={isTall ? "40" : "55"} 
                stroke={cell.isAvailable ? "hsl(var(--primary-foreground))" : "hsl(var(--background))"}
                strokeWidth="2"
                strokeOpacity="0.3"
              />
              <line 
                x1="45" y1={isTall ? "70" : "80"} 
                x2="65" y2={isTall ? "60" : "70"} 
                stroke={cell.isAvailable ? "hsl(var(--primary-foreground))" : "hsl(var(--background))"}
                strokeWidth="2"
                strokeOpacity="0.3"
              />
              <line 
                x1="45" y1={isTall ? "90" : "95"} 
                x2="65" y2={isTall ? "80" : "85"} 
                stroke={cell.isAvailable ? "hsl(var(--primary-foreground))" : "hsl(var(--background))"}
                strokeWidth="2"
                strokeOpacity="0.3"
              />
              
              {/* Handle */}
              <circle 
                cx="70" cy={isTall ? "75" : "85"} r="4"
                className={cell.isAvailable ? 'fill-accent' : 'fill-muted'}
              />
            </svg>

            {/* Dimension labels */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full">
              <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                {cell.height}м
              </div>
            </div>
            
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full">
              <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                {cell.width}×{cell.depth}м
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 border-t border-border">
        <div className="p-4 border-r border-border text-center">
          <p className="text-2xl font-bold text-primary">{cell.area}</p>
          <p className="text-xs text-muted-foreground">м² площадь</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{cell.volume}</p>
          <p className="text-xs text-muted-foreground">м³ объём</p>
        </div>
      </div>

      {/* Features & Price */}
      <div className="p-4 space-y-4">
        {/* Features */}
        {(cell.hasSocket || cell.hasShelves) && (
          <div className="flex gap-2 flex-wrap">
            {cell.hasSocket && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground bg-accent/30 px-3 py-1.5 rounded-full">
                <Zap className="w-3.5 h-3.5" />
                Розетка
              </div>
            )}
            {cell.hasShelves && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground bg-accent/30 px-3 py-1.5 rounded-full">
                <Grid3X3 className="w-3.5 h-3.5" />
                Полки
              </div>
            )}
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground">
              {cell.pricePerMonth.toLocaleString('ru-RU')}
              <span className="text-lg font-normal text-muted-foreground ml-1">₽/мес</span>
            </p>
          </div>
          
          {cell.isAvailable ? (
            <Button className="gap-2 bg-primary hover:bg-primary/90 rounded-full px-6">
              Выбрать
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="secondary" disabled className="rounded-full px-6">
              Занята
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CellCardVariantB;
