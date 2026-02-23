import { StorageCell } from '@/types/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Box, 
  Ruler, 
  Zap, 
  Grid3X3, 
  X, 
  Calendar, 
  Eye,
  ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CellInfoPanelProps {
  cell: StorageCell | null;
  onClose: () => void;
}

const CellInfoPanel = ({ cell, onClose }: CellInfoPanelProps) => {
  if (!cell) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center">
        <Box className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium mb-2">Выберите ячейку</h3>
        <p className="text-sm text-muted-foreground">
          Кликните на любую ячейку на 3D-карте чтобы увидеть подробную информацию
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl font-bold text-primary">№{cell.number}</span>
            <Badge variant={cell.isAvailable ? 'success' : 'secondary'}>
              {cell.isAvailable ? 'Свободна' : 'Занята'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Ярус {cell.tier}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Specs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Ruler className="w-4 h-4" />
            <span className="text-xs">Размеры (ШxВxГ)</span>
          </div>
          <p className="font-semibold">
            {cell.width} × {cell.height} × {cell.depth} м
          </p>
        </div>
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Box className="w-4 h-4" />
            <span className="text-xs">Площадь</span>
          </div>
          <p className="font-semibold">{cell.area} м²</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Box className="w-4 h-4" />
            <span className="text-xs">Объём</span>
          </div>
          <p className="font-semibold">{cell.volume.toFixed(1)} м³</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="text-muted-foreground text-xs mb-1">Цена</div>
          <p className="font-bold text-primary">{cell.pricePerMonth.toLocaleString()} ₽<span className="text-xs font-normal text-muted-foreground">/мес</span></p>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Особенности</h4>
        <div className="flex flex-wrap gap-2">
          {cell.hasSocket && (
            <Badge variant="outline" className="gap-1">
              <Zap className="w-3 h-3" />
              Розетка
            </Badge>
          )}
          {cell.hasShelves && (
            <Badge variant="outline" className="gap-1">
              <Grid3X3 className="w-3 h-3" />
              Полки
            </Badge>
          )}
          <Badge variant="outline" className="gap-1">
            <Eye className="w-3 h-3" />
            Видеонаблюдение
          </Badge>
        </div>
      </div>

      {/* Actions */}
      {cell.isAvailable ? (
        <div className="space-y-3">
          <Button className="w-full" size="lg">
            <Calendar className="w-4 h-4" />
            Забронировать
          </Button>
          <Link to="/catalog" className="block">
            <Button variant="outline" className="w-full">
              Подробнее о ячейке
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Эта ячейка сейчас занята
          </p>
          <Link to="/catalog">
            <Button variant="outline" size="sm">
              Посмотреть свободные
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CellInfoPanel;
