import { StorageCell } from '@/types/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Grid3X3, ArrowRight } from 'lucide-react';

interface CellCardProps {
  cell: StorageCell;
  onSelect: (cell: StorageCell) => void;
}

// Диаметрическая проекция с размерными линиями
const CellCardVariantB = ({ cell, onSelect }: CellCardProps) => {
  // Определяем пропорции ячейки
  const aspectRatio = cell.height / cell.width;
  const isTall = aspectRatio > 1.3;
  
  // Масштабирование с учетом пропорций ячейки
  const svgWidth = 300;
  const svgHeight = 280;
  const marginLeft = 55;  // место для размерной линии высоты
  const marginRight = 60; // место для размерной линии глубины
  const marginTop = 50;   // место для размерной линии глубины сверху
  const marginBottom = 45; // место для размерной линии ширины
  
  const availableWidth = svgWidth - marginLeft - marginRight;
  const availableHeight = svgHeight - marginTop - marginBottom;
  
  // Рассчитываем масштаб чтобы проекция поместилась с учетом глубины
  const depthRatio = 0.5; // отношение видимой глубины к реальной
  const projectedWidth = cell.width + cell.depth * depthRatio;
  const projectedHeight = cell.height + cell.depth * depthRatio;
  
  const scaleX = availableWidth / projectedWidth;
  const scaleY = availableHeight / projectedHeight;
  const scale = Math.min(scaleX, scaleY, 70); // не больше 70px на метр
  
  const boxWidth = cell.width * scale;
  const boxHeight = cell.height * scale;
  const boxDepth = cell.depth * scale * depthRatio;
  
  // Центрирование проекции в доступной области
  const totalProjectionWidth = boxWidth + boxDepth;
  const totalProjectionHeight = boxHeight + boxDepth;
  const offsetX = marginLeft + (availableWidth - totalProjectionWidth) / 2;
  const offsetY = marginTop + (availableHeight - totalProjectionHeight) / 2 + boxDepth;
  
  return (
    <div 
      className={`group relative bg-card border-2 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${
        cell.isAvailable 
          ? 'border-primary/20 hover:border-primary cursor-pointer' 
          : 'border-border opacity-70'
      }`}
      onClick={() => cell.isAvailable && onSelect(cell)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
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
              {cell.tier > 1 ? `${cell.tier} ярус` : '1 ярус'}
            </p>
          </div>
        </div>
        <Badge variant={cell.isAvailable ? 'success' : 'secondary'}>
          {cell.isAvailable ? 'Свободна' : 'Занята'}
        </Badge>
      </div>

      {/* Диаметрическая проекция - МАКСИМАЛЬНЫЙ РАЗМЕР */}
      <div className="relative bg-gradient-to-br from-background via-secondary/20 to-muted/40">
        <svg 
          viewBox="0 0 300 280" 
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Сетка фона */}
          <defs>
            <pattern id={`grid-${cell.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="300" height="280" fill={`url(#grid-${cell.id})`} />
          
          {/* Центрируем проекцию - с отступами для размерных линий */}
          <g transform={`translate(${offsetX}, ${offsetY})`}>
            
            {/* ===== ПОЛ ===== */}
            <g>
              {/* Плоскость пола */}
              <polygon 
                points={`0,${boxHeight} ${boxDepth},${boxHeight - boxDepth * 0.5} ${boxWidth + boxDepth},${boxHeight - boxDepth * 0.5} ${boxWidth},${boxHeight}`}
                fill="hsl(var(--muted))"
                stroke="hsl(var(--border))"
                strokeWidth="1.5"
              />
              {/* Надпись ПОЛ */}
              <text 
                x={boxWidth / 2 + boxDepth / 2} 
                y={boxHeight - boxDepth * 0.25 + 5} 
                textAnchor="middle" 
                className="text-[11px] fill-muted-foreground font-medium"
              >
                ПОЛ
              </text>
            </g>
            
            {/* ===== БОКС (диаметрическая проекция) ===== */}
            
            {/* Задняя грань (видна сверху-справа) */}
            <polygon 
              points={`${boxDepth},${-boxDepth * 0.5} ${boxWidth + boxDepth},${-boxDepth * 0.5} ${boxWidth + boxDepth},${boxHeight - boxDepth * 0.5} ${boxDepth},${boxHeight - boxDepth * 0.5}`}
              className={cell.isAvailable ? 'fill-primary/20' : 'fill-muted/60'}
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              strokeOpacity="0.3"
            />
            
            {/* Верхняя грань */}
            <polygon 
              points={`0,0 ${boxDepth},${-boxDepth * 0.5} ${boxWidth + boxDepth},${-boxDepth * 0.5} ${boxWidth},0`}
              className={cell.isAvailable ? 'fill-accent' : 'fill-muted'}
              stroke="hsl(var(--accent-foreground))"
              strokeWidth="1"
              strokeOpacity="0.5"
            />
            
            {/* Боковая грань (правая) */}
            <polygon 
              points={`${boxWidth},0 ${boxWidth + boxDepth},${-boxDepth * 0.5} ${boxWidth + boxDepth},${boxHeight - boxDepth * 0.5} ${boxWidth},${boxHeight}`}
              className={cell.isAvailable ? 'fill-primary/60' : 'fill-muted-foreground/30'}
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
            />
            
            {/* Передняя грань */}
            <polygon 
              points={`0,0 ${boxWidth},0 ${boxWidth},${boxHeight} 0,${boxHeight}`}
              className={cell.isAvailable ? 'fill-primary' : 'fill-muted-foreground/40'}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
            
            {/* Линии двери на передней грани */}
            {[0.2, 0.4, 0.6, 0.8].map((pos, i) => (
              <line 
                key={i}
                x1={boxWidth * 0.1} 
                y1={boxHeight * pos} 
                x2={boxWidth * 0.9} 
                y2={boxHeight * pos} 
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="1.5"
                strokeOpacity="0.2"
              />
            ))}
            
            {/* Ручка двери */}
            <circle 
              cx={boxWidth * 0.85} 
              cy={boxHeight * 0.5} 
              r="6"
              className={cell.isAvailable ? 'fill-accent' : 'fill-muted'}
              stroke="hsl(var(--accent-foreground))"
              strokeWidth="1.5"
            />
            
            {/* ===== РАЗМЕРНЫЕ ЛИНИИ ===== */}
            
            {/* Высота (слева) */}
            <g className="dimension-line">
              {/* Выносные линии */}
              <line x1="-5" y1="0" x2="-35" y2="0" stroke="hsl(var(--foreground))" strokeWidth="1" />
              <line x1="-5" y1={boxHeight} x2="-35" y2={boxHeight} stroke="hsl(var(--foreground))" strokeWidth="1" />
              {/* Размерная линия */}
              <line x1="-25" y1="5" x2="-25" y2={boxHeight - 5} stroke="hsl(var(--foreground))" strokeWidth="1.5" />
              {/* Стрелки */}
              <polygon points="-25,5 -22,12 -28,12" fill="hsl(var(--foreground))" />
              <polygon points={`-25,${boxHeight - 5} -22,${boxHeight - 12} -28,${boxHeight - 12}`} fill="hsl(var(--foreground))" />
              {/* Значение */}
              <rect x="-45" y={boxHeight / 2 - 12} width="40" height="20" rx="4" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
              <text x="-25" y={boxHeight / 2 + 2} textAnchor="middle" className="text-[13px] fill-foreground font-bold">
                {cell.height}м
              </text>
            </g>
            
            {/* Ширина (снизу) */}
            <g className="dimension-line">
              {/* Выносные линии */}
              <line x1="0" y1={boxHeight + 5} x2="0" y2={boxHeight + 35} stroke="hsl(var(--foreground))" strokeWidth="1" />
              <line x1={boxWidth} y1={boxHeight + 5} x2={boxWidth} y2={boxHeight + 35} stroke="hsl(var(--foreground))" strokeWidth="1" />
              {/* Размерная линия */}
              <line x1="5" y1={boxHeight + 25} x2={boxWidth - 5} y2={boxHeight + 25} stroke="hsl(var(--foreground))" strokeWidth="1.5" />
              {/* Стрелки */}
              <polygon points={`5,${boxHeight + 25} 12,${boxHeight + 22} 12,${boxHeight + 28}`} fill="hsl(var(--foreground))" />
              <polygon points={`${boxWidth - 5},${boxHeight + 25} ${boxWidth - 12},${boxHeight + 22} ${boxWidth - 12},${boxHeight + 28}`} fill="hsl(var(--foreground))" />
              {/* Значение */}
              <rect x={boxWidth / 2 - 22} y={boxHeight + 15} width="44" height="20" rx="4" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
              <text x={boxWidth / 2} y={boxHeight + 29} textAnchor="middle" className="text-[13px] fill-foreground font-bold">
                {cell.width}м
              </text>
            </g>
            
            {/* Глубина (сверху справа, по диагонали) */}
            <g className="dimension-line">
              {/* Выносные линии */}
              <line x1={boxWidth + 3} y1="-3" x2={boxWidth + 15} y2="-15" stroke="hsl(var(--foreground))" strokeWidth="1" />
              <line x1={boxWidth + boxDepth + 3} y1={-boxDepth * 0.5 - 3} x2={boxWidth + boxDepth + 15} y2={-boxDepth * 0.5 - 15} stroke="hsl(var(--foreground))" strokeWidth="1" />
              {/* Размерная линия */}
              <line 
                x1={boxWidth + 12} y1="-12" 
                x2={boxWidth + boxDepth + 8} y2={-boxDepth * 0.5 - 10} 
                stroke="hsl(var(--foreground))" 
                strokeWidth="1.5" 
              />
              {/* Стрелки */}
              <polygon points={`${boxWidth + 12},-12 ${boxWidth + 18},-8 ${boxWidth + 16},-16`} fill="hsl(var(--foreground))" />
              <polygon points={`${boxWidth + boxDepth + 8},${-boxDepth * 0.5 - 10} ${boxWidth + boxDepth + 2},${-boxDepth * 0.5 - 6} ${boxWidth + boxDepth + 4},${-boxDepth * 0.5 - 14}`} fill="hsl(var(--foreground))" />
              {/* Значение */}
              <rect x={boxWidth + boxDepth / 2} y={-boxDepth * 0.25 - 28} width="44" height="20" rx="4" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
              <text x={boxWidth + boxDepth / 2 + 22} y={-boxDepth * 0.25 - 14} textAnchor="middle" className="text-[13px] fill-foreground font-bold">
                {cell.depth}м
              </text>
            </g>
            
          </g>
        </svg>
      </div>

      {/* Features & Price */}
      <div className="p-4 space-y-3 border-t border-border">
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
            <p className="text-2xl font-bold text-foreground">
              {cell.pricePerMonth.toLocaleString('ru-RU')}
              <span className="text-base font-normal text-muted-foreground ml-1">₽/мес</span>
            </p>
          </div>
          
          {cell.isAvailable ? (
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              Выбрать
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="secondary" disabled>
              Занята
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CellCardVariantB;
