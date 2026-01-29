import { useMemo } from 'react';

interface CellProjectionPreviewProps {
  width: number;
  height: number;
  depth: number;
}

const CellProjectionPreview = ({ width, height, depth }: CellProjectionPreviewProps) => {
  const projectionData = useMemo(() => {
    if (width <= 0 || height <= 0 || depth <= 0) return null;

    const area = width * depth;
    const isSmall = area < 2;
    const isMedium = area >= 2 && area < 6;

    // SVG контейнер
    const svgWidth = 280;
    const svgHeight = 200;

    // Разные правила для разных размеров
    let scale: number;
    let labelSize: number;
    let labelPadding: { width: number; height: number };

    if (isSmall) {
      scale = 60;
      labelSize = 11;
      labelPadding = { width: 36, height: 16 };
    } else if (isMedium) {
      scale = 50;
      labelSize = 10;
      labelPadding = { width: 32, height: 15 };
    } else {
      scale = 40;
      labelSize = 10;
      labelPadding = { width: 30, height: 14 };
    }

    const marginLeft = 45;
    const marginRight = 50;
    const marginTop = 35;
    const marginBottom = 35;

    // Рассчитываем размеры бокса
    const depthRatio = 0.5;
    const boxWidth = width * scale;
    const boxHeight = height * scale;
    const boxDepth = depth * scale * depthRatio;

    // Проверяем, помещается ли в контейнер
    const availableWidth = svgWidth - marginLeft - marginRight;
    const availableHeight = svgHeight - marginTop - marginBottom;
    const projectedWidth = boxWidth + boxDepth;
    const projectedHeight = boxHeight + boxDepth;

    let finalScale = scale;
    if (projectedWidth > availableWidth || projectedHeight > availableHeight) {
      const scaleX = availableWidth / (width + depth * depthRatio);
      const scaleY = availableHeight / (height + depth * depthRatio);
      finalScale = Math.min(scaleX, scaleY);
    }

    const finalBoxWidth = width * finalScale;
    const finalBoxHeight = height * finalScale;
    const finalBoxDepth = depth * finalScale * depthRatio;

    // Центрирование
    const totalWidth = finalBoxWidth + finalBoxDepth;
    const totalHeight = finalBoxHeight + finalBoxDepth;
    const offsetX = marginLeft + (availableWidth - totalWidth) / 2;
    const offsetY = marginTop + (availableHeight - totalHeight) / 2 + finalBoxDepth;

    return {
      svgWidth,
      svgHeight,
      finalBoxWidth,
      finalBoxHeight,
      finalBoxDepth,
      offsetX,
      offsetY,
      labelSize,
      labelPadding,
      width,
      height,
      depth,
    };
  }, [width, height, depth]);

  if (!projectionData) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
        <p className="text-sm text-muted-foreground">Введите размеры для превью</p>
      </div>
    );
  }

  const {
    svgWidth,
    svgHeight,
    finalBoxWidth,
    finalBoxHeight,
    finalBoxDepth,
    offsetX,
    offsetY,
    labelSize,
    labelPadding,
  } = projectionData;

  return (
    <div className="bg-gradient-to-br from-background via-secondary/20 to-muted/40 rounded-lg border overflow-hidden">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-[200px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Сетка фона */}
        <defs>
          <pattern id="preview-grid" width="15" height="15" patternUnits="userSpaceOnUse">
            <path d="M 15 0 L 0 0 0 15" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width={svgWidth} height={svgHeight} fill="url(#preview-grid)" />

        <g transform={`translate(${offsetX}, ${offsetY})`}>
          {/* Верхняя грань */}
          <polygon
            points={`0,0 ${finalBoxDepth},${-finalBoxDepth * 0.5} ${finalBoxWidth + finalBoxDepth},${-finalBoxDepth * 0.5} ${finalBoxWidth},0`}
            className="fill-accent"
            stroke="hsl(var(--accent-foreground))"
            strokeWidth="1"
            strokeOpacity="0.5"
          />

          {/* Боковая грань (правая) */}
          <polygon
            points={`${finalBoxWidth},0 ${finalBoxWidth + finalBoxDepth},${-finalBoxDepth * 0.5} ${finalBoxWidth + finalBoxDepth},${finalBoxHeight - finalBoxDepth * 0.5} ${finalBoxWidth},${finalBoxHeight}`}
            className="fill-primary/60"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
          />

          {/* Передняя грань */}
          <polygon
            points={`0,0 ${finalBoxWidth},0 ${finalBoxWidth},${finalBoxHeight} 0,${finalBoxHeight}`}
            className="fill-primary"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />

          {/* Линии двери */}
          {[0.2, 0.4, 0.6, 0.8].map((pos, i) => (
            <line
              key={i}
              x1={finalBoxWidth * 0.1}
              y1={finalBoxHeight * pos}
              x2={finalBoxWidth * 0.9}
              y2={finalBoxHeight * pos}
              stroke="hsl(var(--primary-foreground))"
              strokeWidth="1"
              strokeOpacity="0.2"
            />
          ))}

          {/* Ручка двери */}
          <circle
            cx={finalBoxWidth * 0.85}
            cy={finalBoxHeight * 0.5}
            r={4}
            className="fill-accent"
            stroke="hsl(var(--accent-foreground))"
            strokeWidth="1.5"
          />

          {/* === РАЗМЕРНЫЕ ЛИНИИ === */}

          {/* Высота (слева) */}
          <g>
            <line x1="-5" y1="0" x2="-25" y2="0" stroke="hsl(var(--foreground))" strokeWidth="1" />
            <line x1="-5" y1={finalBoxHeight} x2="-25" y2={finalBoxHeight} stroke="hsl(var(--foreground))" strokeWidth="1" />
            <line x1="-18" y1="5" x2="-18" y2={finalBoxHeight - 5} stroke="hsl(var(--foreground))" strokeWidth="1.5" />
            <polygon points="-18,5 -15,10 -21,10" fill="hsl(var(--foreground))" />
            <polygon points={`-18,${finalBoxHeight - 5} -15,${finalBoxHeight - 10} -21,${finalBoxHeight - 10}`} fill="hsl(var(--foreground))" />
            <rect x={-18 - labelPadding.width / 2} y={finalBoxHeight / 2 - labelPadding.height / 2} width={labelPadding.width} height={labelPadding.height} rx="3" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <text x="-18" y={finalBoxHeight / 2 + labelSize / 3} textAnchor="middle" className="fill-foreground font-bold" style={{ fontSize: labelSize }}>
              {height}м
            </text>
          </g>

          {/* Ширина (снизу) */}
          <g>
            <line x1="0" y1={finalBoxHeight + 5} x2="0" y2={finalBoxHeight + 25} stroke="hsl(var(--foreground))" strokeWidth="1" />
            <line x1={finalBoxWidth} y1={finalBoxHeight + 5} x2={finalBoxWidth} y2={finalBoxHeight + 25} stroke="hsl(var(--foreground))" strokeWidth="1" />
            <line x1="5" y1={finalBoxHeight + 18} x2={finalBoxWidth - 5} y2={finalBoxHeight + 18} stroke="hsl(var(--foreground))" strokeWidth="1.5" />
            <polygon points={`5,${finalBoxHeight + 18} 10,${finalBoxHeight + 15} 10,${finalBoxHeight + 21}`} fill="hsl(var(--foreground))" />
            <polygon points={`${finalBoxWidth - 5},${finalBoxHeight + 18} ${finalBoxWidth - 10},${finalBoxHeight + 15} ${finalBoxWidth - 10},${finalBoxHeight + 21}`} fill="hsl(var(--foreground))" />
            <rect x={finalBoxWidth / 2 - labelPadding.width / 2} y={finalBoxHeight + 18 - labelPadding.height / 2} width={labelPadding.width} height={labelPadding.height} rx="3" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <text x={finalBoxWidth / 2} y={finalBoxHeight + 18 + labelSize / 3} textAnchor="middle" className="fill-foreground font-bold" style={{ fontSize: labelSize }}>
              {width}м
            </text>
          </g>

          {/* Глубина (сверху справа) */}
          <g>
            <line x1={finalBoxWidth + 3} y1="-3" x2={finalBoxWidth + 10} y2="-10" stroke="hsl(var(--foreground))" strokeWidth="1" />
            <line x1={finalBoxWidth + finalBoxDepth + 3} y1={-finalBoxDepth * 0.5 - 3} x2={finalBoxWidth + finalBoxDepth + 10} y2={-finalBoxDepth * 0.5 - 10} stroke="hsl(var(--foreground))" strokeWidth="1" />
            <line
              x1={finalBoxWidth + 8}
              y1="-8"
              x2={finalBoxWidth + finalBoxDepth + 5}
              y2={-finalBoxDepth * 0.5 - 6}
              stroke="hsl(var(--foreground))"
              strokeWidth="1.5"
            />
            <rect x={finalBoxWidth + finalBoxDepth / 2 - 5} y={-finalBoxDepth * 0.25 - 20} width={labelPadding.width} height={labelPadding.height} rx="3" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <text x={finalBoxWidth + finalBoxDepth / 2 + labelPadding.width / 2 - 5} y={-finalBoxDepth * 0.25 - 20 + labelPadding.height / 2 + labelSize / 3} textAnchor="middle" className="fill-foreground font-bold" style={{ fontSize: labelSize }}>
              {depth}м
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default CellProjectionPreview;
