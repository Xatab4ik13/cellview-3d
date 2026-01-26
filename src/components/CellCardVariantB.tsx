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
      <div className="relative py-6 px-4 bg-gradient-to-b from-secondary/50 to-muted/30">
        <div className="flex justify-center items-end">
          <div className="relative">
            {/* Isometric cell shape - larger size */}
            <svg 
              viewBox="0 0 200 220" 
              className="w-[200px] h-[220px] transition-transform duration-300 group-hover:scale-105"
            >
              {/* Floor/Ground plane */}
              <polygon 
                points="20,180 100,210 180,180 100,150"
                fill="hsl(var(--muted))"
                stroke="hsl(var(--border))"
                strokeWidth="1"
              />
              <text x="100" y="195" textAnchor="middle" className="text-[10px] fill-muted-foreground font-medium">
                ПОЛ
              </text>
              
              {/* Back face (depth) - shadow */}
              <polygon 
                points={isTall 
                  ? "100,20 160,45 160,155 100,180 40,155 40,45" 
                  : "100,40 160,65 160,145 100,170 40,145 40,65"
                }
                className="fill-muted/50"
              />
              
              {/* Left face */}
              <polygon 
                points={isTall 
                  ? "40,45 100,20 100,130 40,155" 
                  : "40,65 100,40 100,130 40,155"
                }
                className={cell.isAvailable ? 'fill-primary' : 'fill-muted-foreground/40'}
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="0.5"
                strokeOpacity="0.3"
              />
              
              {/* Right face */}
              <polygon 
                points={isTall 
                  ? "100,20 160,45 160,155 100,130" 
                  : "100,40 160,65 160,155 100,130"
                }
                className={cell.isAvailable ? 'fill-primary/70' : 'fill-muted-foreground/30'}
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="0.5"
                strokeOpacity="0.3"
              />
              
              {/* Top face */}
              <polygon 
                points={isTall 
                  ? "40,45 100,20 160,45 100,70" 
                  : "40,65 100,40 160,65 100,90"
                }
                className={cell.isAvailable ? 'fill-accent' : 'fill-muted/80'}
                stroke="hsl(var(--accent-foreground))"
                strokeWidth="0.5"
                strokeOpacity="0.3"
              />
              
              {/* Door lines on left face */}
              <line 
                x1="55" y1={isTall ? "65" : "80"} 
                x2="85" y2={isTall ? "50" : "65"} 
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="1.5"
                strokeOpacity="0.25"
              />
              <line 
                x1="55" y1={isTall ? "90" : "100"} 
                x2="85" y2={isTall ? "75" : "85"} 
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="1.5"
                strokeOpacity="0.25"
              />
              <line 
                x1="55" y1={isTall ? "115" : "120"} 
                x2="85" y2={isTall ? "100" : "105"} 
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="1.5"
                strokeOpacity="0.25"
              />
              
              {/* Handle */}
              <circle 
                cx="88" cy={isTall ? "95" : "100"} r="5"
                className={cell.isAvailable ? 'fill-accent' : 'fill-muted'}
                stroke="hsl(var(--accent-foreground))"
                strokeWidth="1"
              />
              
              {/* ===== DIMENSION LINES INSIDE ===== */}
              
              {/* Height dimension line (on left face, vertical) */}
              <line 
                x1="48" y1={isTall ? "50" : "70"} 
                x2="48" y2="152" 
                stroke="hsl(var(--foreground))"
                strokeWidth="1"
                strokeDasharray="3,2"
              />
              <line x1="45" y1={isTall ? "50" : "70"} x2="51" y2={isTall ? "50" : "70"} stroke="hsl(var(--foreground))" strokeWidth="1"/>
              <line x1="45" y1="152" x2="51" y2="152" stroke="hsl(var(--foreground))" strokeWidth="1"/>
              <rect x="35" y={isTall ? "95" : "105"} width="26" height="16" rx="3" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="0.5"/>
              <text x="48" y={isTall ? "107" : "117"} textAnchor="middle" className="text-[11px] fill-foreground font-bold">
                {cell.height}м
              </text>
              
              {/* Width dimension line (on top face) */}
              <line 
                x1={isTall ? "50" : "50"} y1={isTall ? "38" : "55"} 
                x2={isTall ? "95" : "95"} y2={isTall ? "25" : "45"} 
                stroke="hsl(var(--foreground))"
                strokeWidth="1"
                strokeDasharray="3,2"
              />
              <line x1="47" y1={isTall ? "40" : "57"} x2="53" y2={isTall ? "36" : "53"} stroke="hsl(var(--foreground))" strokeWidth="1"/>
              <line x1="92" y1={isTall ? "27" : "47"} x2="98" y2={isTall ? "23" : "43"} stroke="hsl(var(--foreground))" strokeWidth="1"/>
              <rect x="58" y={isTall ? "22" : "40"} width="28" height="14" rx="3" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="0.5"/>
              <text x="72" y={isTall ? "33" : "51"} textAnchor="middle" className="text-[10px] fill-foreground font-bold">
                {cell.width}м
              </text>
              
              {/* Depth dimension line (on top face, right side) */}
              <line 
                x1={isTall ? "105" : "105"} y1={isTall ? "25" : "45"} 
                x2={isTall ? "150" : "150"} y2={isTall ? "38" : "58"} 
                stroke="hsl(var(--foreground))"
                strokeWidth="1"
                strokeDasharray="3,2"
              />
              <line x1="102" y1={isTall ? "23" : "43"} x2="108" y2={isTall ? "27" : "47"} stroke="hsl(var(--foreground))" strokeWidth="1"/>
              <line x1="147" y1={isTall ? "36" : "56"} x2="153" y2={isTall ? "40" : "60"} stroke="hsl(var(--foreground))" strokeWidth="1"/>
              <rect x="114" y={isTall ? "22" : "42"} width="28" height="14" rx="3" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="0.5"/>
              <text x="128" y={isTall ? "33" : "53"} textAnchor="middle" className="text-[10px] fill-foreground font-bold">
                {cell.depth}м
              </text>
            </svg>
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
