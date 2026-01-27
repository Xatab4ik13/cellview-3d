import { StorageCell, calculatePrice } from '@/types/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, ArrowRight } from 'lucide-react';

interface CellCardProps {
  cell: StorageCell;
  onSelect: (cell: StorageCell) => void;
}

// Диаметрическая проекция с размерными линиями
const CellCardVariantB = ({ cell, onSelect }: CellCardProps) => {
  // Определяем размер ячейки по площади
  const isSmall = cell.area < 2;       // маленькие (0.5-2 м²)
  const isMedium = cell.area >= 2 && cell.area < 6;  // средние (2-6 м²)
  const isLarge = cell.area >= 6;      // большие (6+ м²)
  
  // SVG контейнер
  const svgWidth = 300;
  const svgHeight = 280;
  
  // Разные правила для разных размеров
  let scale: number;
  let marginLeft: number;
  let marginRight: number;
  let marginTop: number;
  let marginBottom: number;
  let labelSize: number;
  let labelPadding: { width: number; height: number };
  
  if (isSmall) {
    // Маленькие кубические ячейки — максимальный размер
    scale = 85;
    marginLeft = 50;
    marginRight = 55;
    marginTop = 45;
    marginBottom = 40;
    labelSize = 13;
    labelPadding = { width: 44, height: 20 };
  } else if (isMedium) {
    // Средние ячейки — сбалансированный размер
    scale = 70;
    marginLeft = 50;
    marginRight = 55;
    marginTop = 45;
    marginBottom = 40;
    labelSize = 12;
    labelPadding = { width: 40, height: 18 };
  } else {
    // Большие/прямоугольные ячейки — уменьшенные плашки для большей проекции
    scale = 55;
    marginLeft = 45;
    marginRight = 50;
    marginTop = 40;
    marginBottom = 38;
    labelSize = 11;
    labelPadding = { width: 36, height: 16 };
  }
  
  // Рассчитываем размеры бокса
  const depthRatio = 0.5;
  const boxWidth = cell.width * scale;
  const boxHeight = cell.height * scale;
  const boxDepth = cell.depth * scale * depthRatio;
  
  // Проверяем, помещается ли в контейнер, если нет — адаптируем масштаб
  const availableWidth = svgWidth - marginLeft - marginRight;
  const availableHeight = svgHeight - marginTop - marginBottom;
  const projectedWidth = boxWidth + boxDepth;
  const projectedHeight = boxHeight + boxDepth;
  
  let finalScale = scale;
  if (projectedWidth > availableWidth || projectedHeight > availableHeight) {
    const scaleX = availableWidth / (cell.width + cell.depth * depthRatio);
    const scaleY = availableHeight / (cell.height + cell.depth * depthRatio);
    finalScale = Math.min(scaleX, scaleY);
  }
  
  const finalBoxWidth = cell.width * finalScale;
  const finalBoxHeight = cell.height * finalScale;
  const finalBoxDepth = cell.depth * finalScale * depthRatio;
  
  // Центрирование
  const totalWidth = finalBoxWidth + finalBoxDepth;
  const totalHeight = finalBoxHeight + finalBoxDepth;
  const offsetX = marginLeft + (availableWidth - totalWidth) / 2;
  const offsetY = marginTop + (availableHeight - totalHeight) / 2 + finalBoxDepth;
  
  return (
    <div 
      className={`group relative bg-card border-2 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl ${
        cell.isAvailable 
          ? 'border-primary/30 hover:border-primary hover:shadow-primary/20 cursor-pointer' 
          : 'border-border opacity-70'
      }`}
      onClick={() => cell.isAvailable && onSelect(cell)}
    >
      {/* Header with accent stripe */}
      <div className={`flex items-center justify-between px-4 py-3 border-b-2 ${
        cell.isAvailable ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
            cell.isAvailable ? 'gradient-primary shadow-primary' : 'bg-muted'
          }`}>
            <span className={`font-extrabold text-xl ${
              cell.isAvailable ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}>
              {cell.number}
            </span>
          </div>
          <div>
            <p className="font-bold text-foreground">Ячейка №{cell.number}</p>
            <p className="text-xs text-muted-foreground font-medium">
              {cell.tier > 1 ? `${cell.tier} ярус` : '1 ярус'}
            </p>
          </div>
        </div>
        <Badge variant={cell.isAvailable ? 'success' : 'secondary'} className="font-semibold">
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
                points={`0,${finalBoxHeight} ${finalBoxDepth},${finalBoxHeight - finalBoxDepth * 0.5} ${finalBoxWidth + finalBoxDepth},${finalBoxHeight - finalBoxDepth * 0.5} ${finalBoxWidth},${finalBoxHeight}`}
                fill="hsl(var(--muted))"
                stroke="hsl(var(--border))"
                strokeWidth="1.5"
              />
              {/* Надпись ПОЛ */}
              <text 
                x={finalBoxWidth / 2 + finalBoxDepth / 2} 
                y={finalBoxHeight - finalBoxDepth * 0.25 + 5} 
                textAnchor="middle" 
                className="text-[10px] fill-muted-foreground font-medium"
              >
                ПОЛ
              </text>
            </g>
            
            {/* ===== БОКС (диаметрическая проекция) ===== */}
            
            {/* Задняя грань (видна сверху-справа) */}
            <polygon 
              points={`${finalBoxDepth},${-finalBoxDepth * 0.5} ${finalBoxWidth + finalBoxDepth},${-finalBoxDepth * 0.5} ${finalBoxWidth + finalBoxDepth},${finalBoxHeight - finalBoxDepth * 0.5} ${finalBoxDepth},${finalBoxHeight - finalBoxDepth * 0.5}`}
              className={cell.isAvailable ? 'fill-primary/20' : 'fill-muted/60'}
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              strokeOpacity="0.3"
            />
            
            {/* Верхняя грань */}
            <polygon 
              points={`0,0 ${finalBoxDepth},${-finalBoxDepth * 0.5} ${finalBoxWidth + finalBoxDepth},${-finalBoxDepth * 0.5} ${finalBoxWidth},0`}
              className={cell.isAvailable ? 'fill-accent' : 'fill-muted'}
              stroke="hsl(var(--accent-foreground))"
              strokeWidth="1"
              strokeOpacity="0.5"
            />
            
            {/* Боковая грань (правая) */}
            <polygon 
              points={`${finalBoxWidth},0 ${finalBoxWidth + finalBoxDepth},${-finalBoxDepth * 0.5} ${finalBoxWidth + finalBoxDepth},${finalBoxHeight - finalBoxDepth * 0.5} ${finalBoxWidth},${finalBoxHeight}`}
              className={cell.isAvailable ? 'fill-primary/60' : 'fill-muted-foreground/30'}
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
            />
            
            {/* Передняя грань */}
            <polygon 
              points={`0,0 ${finalBoxWidth},0 ${finalBoxWidth},${finalBoxHeight} 0,${finalBoxHeight}`}
              className={cell.isAvailable ? 'fill-primary' : 'fill-muted-foreground/40'}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
            
            {/* Линии двери на передней грани */}
            {[0.2, 0.4, 0.6, 0.8].map((pos, i) => (
              <line 
                key={i}
                x1={finalBoxWidth * 0.1} 
                y1={finalBoxHeight * pos} 
                x2={finalBoxWidth * 0.9} 
                y2={finalBoxHeight * pos} 
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="1.5"
                strokeOpacity="0.2"
              />
            ))}
            
            {/* Ручка двери */}
            <circle 
              cx={finalBoxWidth * 0.85} 
              cy={finalBoxHeight * 0.5} 
              r={Math.max(4, finalScale * 0.08)}
              className={cell.isAvailable ? 'fill-accent' : 'fill-muted'}
              stroke="hsl(var(--accent-foreground))"
              strokeWidth="1.5"
            />
            
            {/* ===== РАЗМЕРНЫЕ ЛИНИИ ===== */}
            
            {/* Высота (слева) */}
            <g className="dimension-line">
              {/* Выносные линии */}
              <line x1="-5" y1="0" x2="-30" y2="0" stroke="hsl(var(--foreground))" strokeWidth="1" />
              <line x1="-5" y1={finalBoxHeight} x2="-30" y2={finalBoxHeight} stroke="hsl(var(--foreground))" strokeWidth="1" />
              {/* Размерная линия */}
              <line x1="-22" y1="5" x2="-22" y2={finalBoxHeight - 5} stroke="hsl(var(--foreground))" strokeWidth="1.5" />
              {/* Стрелки */}
              <polygon points="-22,5 -19,11 -25,11" fill="hsl(var(--foreground))" />
              <polygon points={`-22,${finalBoxHeight - 5} -19,${finalBoxHeight - 11} -25,${finalBoxHeight - 11}`} fill="hsl(var(--foreground))" />
              {/* Значение */}
              <rect x={-22 - labelPadding.width / 2} y={finalBoxHeight / 2 - labelPadding.height / 2} width={labelPadding.width} height={labelPadding.height} rx="3" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
              <text x="-22" y={finalBoxHeight / 2 + labelSize / 3} textAnchor="middle" className={`text-[${labelSize}px] fill-foreground font-bold`} style={{ fontSize: labelSize }}>
                {cell.height}м
              </text>
            </g>
            
            {/* Ширина (снизу) */}
            <g className="dimension-line">
              {/* Выносные линии */}
              <line x1="0" y1={finalBoxHeight + 5} x2="0" y2={finalBoxHeight + 30} stroke="hsl(var(--foreground))" strokeWidth="1" />
              <line x1={finalBoxWidth} y1={finalBoxHeight + 5} x2={finalBoxWidth} y2={finalBoxHeight + 30} stroke="hsl(var(--foreground))" strokeWidth="1" />
              {/* Размерная линия */}
              <line x1="5" y1={finalBoxHeight + 22} x2={finalBoxWidth - 5} y2={finalBoxHeight + 22} stroke="hsl(var(--foreground))" strokeWidth="1.5" />
              {/* Стрелки */}
              <polygon points={`5,${finalBoxHeight + 22} 11,${finalBoxHeight + 19} 11,${finalBoxHeight + 25}`} fill="hsl(var(--foreground))" />
              <polygon points={`${finalBoxWidth - 5},${finalBoxHeight + 22} ${finalBoxWidth - 11},${finalBoxHeight + 19} ${finalBoxWidth - 11},${finalBoxHeight + 25}`} fill="hsl(var(--foreground))" />
              {/* Значение */}
              <rect x={finalBoxWidth / 2 - labelPadding.width / 2} y={finalBoxHeight + 22 - labelPadding.height / 2} width={labelPadding.width} height={labelPadding.height} rx="3" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
              <text x={finalBoxWidth / 2} y={finalBoxHeight + 22 + labelSize / 3} textAnchor="middle" className={`text-[${labelSize}px] fill-foreground font-bold`} style={{ fontSize: labelSize }}>
                {cell.width}м
              </text>
            </g>
            
            {/* Глубина (сверху справа, по диагонали) */}
            <g className="dimension-line">
              {/* Выносные линии */}
              <line x1={finalBoxWidth + 3} y1="-3" x2={finalBoxWidth + 12} y2="-12" stroke="hsl(var(--foreground))" strokeWidth="1" />
              <line x1={finalBoxWidth + finalBoxDepth + 3} y1={-finalBoxDepth * 0.5 - 3} x2={finalBoxWidth + finalBoxDepth + 12} y2={-finalBoxDepth * 0.5 - 12} stroke="hsl(var(--foreground))" strokeWidth="1" />
              {/* Размерная линия */}
              <line 
                x1={finalBoxWidth + 10} y1="-10" 
                x2={finalBoxWidth + finalBoxDepth + 6} y2={-finalBoxDepth * 0.5 - 8} 
                stroke="hsl(var(--foreground))" 
                strokeWidth="1.5" 
              />
              {/* Стрелки */}
              <polygon points={`${finalBoxWidth + 10},-10 ${finalBoxWidth + 15},-7 ${finalBoxWidth + 13},-14`} fill="hsl(var(--foreground))" />
              <polygon points={`${finalBoxWidth + finalBoxDepth + 6},${-finalBoxDepth * 0.5 - 8} ${finalBoxWidth + finalBoxDepth + 1},${-finalBoxDepth * 0.5 - 5} ${finalBoxWidth + finalBoxDepth + 3},${-finalBoxDepth * 0.5 - 12}`} fill="hsl(var(--foreground))" />
              {/* Значение */}
              <rect x={finalBoxWidth + finalBoxDepth / 2} y={-finalBoxDepth * 0.25 - 24} width={labelPadding.width} height={labelPadding.height} rx="3" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
              <text x={finalBoxWidth + finalBoxDepth / 2 + labelPadding.width / 2} y={-finalBoxDepth * 0.25 - 24 + labelPadding.height / 2 + labelSize / 3} textAnchor="middle" className={`text-[${labelSize}px] fill-foreground font-bold`} style={{ fontSize: labelSize }}>
                {cell.depth}м
              </text>
            </g>
            
          </g>
        </svg>
      </div>

      {/* Features & Price */}
      <div className="p-4 space-y-3 border-t-2 border-border bg-gradient-to-b from-background to-secondary/30">
        {/* Features */}
        {cell.hasShelves && (
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-accent-foreground bg-accent/40 px-3 py-1.5 rounded-full shadow-sm">
              <Grid3X3 className="w-3.5 h-3.5" />
              Полки
            </div>
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold text-foreground">
              {calculatePrice(cell.volume).toLocaleString('ru-RU')}
              <span className="text-base font-medium text-muted-foreground ml-1">₽/мес</span>
            </p>
          </div>
          
          {cell.isAvailable ? (
            <Button className="gap-2 gradient-primary shadow-primary font-bold">
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
