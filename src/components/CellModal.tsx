import { useState } from 'react';
import { StorageCell } from '@/types/storage';
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
  Box, 
  Zap, 
  Grid3X3, 
  Video, 
  Calendar, 
  Check,
  X 
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';

interface CellModalProps {
  cell: StorageCell | null;
  isOpen: boolean;
  onClose: () => void;
}

const SingleCellView = ({ cell }: { cell: StorageCell }) => {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.9} />
      </mesh>
      
      {/* Cell frame */}
      <mesh position={[0, cell.height / 2, 0]}>
        <boxGeometry args={[cell.width, cell.height, cell.depth]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.3} roughness={0.7} transparent opacity={0.5} />
      </mesh>
      
      {/* Door */}
      <mesh position={[0, cell.height / 2, cell.depth / 2]}>
        <boxGeometry args={[cell.width - 0.1, cell.height - 0.1, 0.05]} />
        <meshStandardMaterial color="#8B5CF6" metalness={0.2} roughness={0.5} />
      </mesh>
      
      {/* Door handle */}
      <mesh position={[cell.width / 2 - 0.15, cell.height / 2, cell.depth / 2 + 0.05]}>
        <boxGeometry args={[0.05, 0.15, 0.05]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Interior walls */}
      <mesh position={[0, cell.height / 2, -cell.depth / 2 + 0.02]}>
        <planeGeometry args={[cell.width - 0.05, cell.height - 0.05]} />
        <meshStandardMaterial color="#f5f5f4" />
      </mesh>
      <mesh position={[-cell.width / 2 + 0.02, cell.height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[cell.depth - 0.05, cell.height - 0.05]} />
        <meshStandardMaterial color="#fafaf9" />
      </mesh>
      <mesh position={[cell.width / 2 - 0.02, cell.height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[cell.depth - 0.05, cell.height - 0.05]} />
        <meshStandardMaterial color="#fafaf9" />
      </mesh>
      
      {/* Shelves if present */}
      {cell.hasShelves && (
        <>
          <mesh position={[0, cell.height * 0.4, 0]}>
            <boxGeometry args={[cell.width - 0.15, 0.02, cell.depth - 0.2]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.5} />
          </mesh>
          <mesh position={[0, cell.height * 0.7, 0]}>
            <boxGeometry args={[cell.width - 0.15, 0.02, cell.depth - 0.2]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.5} />
          </mesh>
        </>
      )}
      
      {/* Socket if present */}
      {cell.hasSocket && (
        <mesh position={[-cell.width / 2 + 0.05, 0.3, -cell.depth / 4]}>
          <boxGeometry args={[0.02, 0.08, 0.05]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}
      
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 3]} intensity={0.8} castShadow />
      <pointLight position={[0, cell.height - 0.1, 0]} intensity={0.3} color="#fff7ed" />
    </>
  );
};

const CellModal = ({ cell, isOpen, onClose }: CellModalProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');
  
  if (!cell) return null;
  
  const prices = {
    day: Math.round(cell.pricePerMonth / 25),
    week: Math.round(cell.pricePerMonth / 4),
    month: cell.pricePerMonth,
  };
  
  const periodLabels = {
    day: 'День',
    week: 'Неделя',
    month: 'Месяц',
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
            Площадь {cell.area} м² • Объем {cell.volume} м³ • {cell.tier > 1 ? `${cell.tier} ярус` : 'Нижний ярус'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 3D View */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-secondary to-muted border border-border">
              <Canvas shadows>
                <PerspectiveCamera makeDefault position={[3, 2.5, 4]} fov={45} />
                <OrbitControls 
                  enablePan={false}
                  enableZoom={true}
                  minDistance={2}
                  maxDistance={8}
                  target={[0, cell.height / 2, 0]}
                />
                <SingleCellView cell={cell} />
                <Environment preset="warehouse" />
              </Canvas>
            </div>
            
            <p className="text-sm text-center text-muted-foreground">
              Используйте мышь для вращения и приближения 3D-модели
            </p>
            
            {/* Video feeds placeholder */}
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
                <div className="text-center">
                  <Video className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">Камера 1</p>
                </div>
              </div>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
                <div className="text-center">
                  <Video className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">Камера 2</p>
                </div>
              </div>
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
                  {cell.hasSocket ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground" />
                  )}
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className={cell.hasSocket ? '' : 'text-muted-foreground'}>
                    Электрическая розетка
                  </span>
                </div>
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

            {/* Period selector */}
            <div>
              <h3 className="font-semibold mb-3">Период аренды</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['day', 'week', 'month'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedPeriod === period
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-semibold">{periodLabels[period]}</p>
                    <p className="text-lg font-bold text-primary">
                      {prices[period].toLocaleString('ru-RU')} ₽
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date selection hint */}
            <div className="p-4 border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Выберите даты</p>
                  <p className="text-sm text-muted-foreground">
                    Укажите период аренды в календаре
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                Забронировать за {prices[selectedPeriod].toLocaleString('ru-RU')} ₽
              </Button>
              <Button variant="outline" className="w-full" size="lg">
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
