import { useState } from 'react';
import { Video, Shield, Maximize2, RefreshCw, Settings, Wifi, WifiOff, Grid3X3, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const cameras = [
  { id: 1, name: 'Камера 1 — Главный вход', location: 'Вход на территорию склада', status: 'online' as const },
  { id: 2, name: 'Камера 2 — Коридор A', location: 'Коридор ячеек A1–A20', status: 'online' as const },
  { id: 3, name: 'Камера 3 — Коридор B', location: 'Коридор ячеек B1–B22', status: 'online' as const },
  { id: 4, name: 'Камера 4 — Зона погрузки', location: 'Зона погрузки / разгрузки', status: 'online' as const },
  { id: 5, name: 'Камера 5 — Парковка', location: 'Внешняя парковка', status: 'offline' as const },
  { id: 6, name: 'Камера 6 — Лифт', location: 'Грузовой лифт', status: 'online' as const },
];

const AdminCameras = () => {
  const [layout, setLayout] = useState<'2x2' | '3x3'>('2x2');
  const [selectedCamera, setSelectedCamera] = useState<number | null>(null);

  const onlineCount = cameras.filter(c => c.status === 'online').length;
  const offlineCount = cameras.filter(c => c.status === 'offline').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Видеонаблюдение</h2>
          <p className="text-base text-muted-foreground mt-1">Мониторинг камер в реальном времени</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 text-base py-1.5 px-3 border-[hsl(var(--status-active))]/30 text-[hsl(var(--status-active))] bg-[hsl(var(--status-active))]/10">
            <Wifi className="w-4 h-4" />
            {onlineCount} онлайн
          </Badge>
          {offlineCount > 0 && (
            <Badge variant="outline" className="gap-2 text-base py-1.5 px-3 border-[hsl(var(--status-overdue))]/30 text-[hsl(var(--status-overdue))] bg-[hsl(var(--status-overdue))]/10">
              <WifiOff className="w-4 h-4" />
              {offlineCount} офлайн
            </Badge>
          )}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <Button
              variant={layout === '2x2' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayout('2x2')}
              className="rounded-none h-10 w-10"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={layout === '3x3' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayout('3x3')}
              className="rounded-none h-10 w-10"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
        <Shield className="w-5 h-5 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          Видеозаписи хранятся 30 дней. Доступ к архиву — через настройки системы видеонаблюдения.
        </p>
      </div>

      {/* Camera grid */}
      <div className={`grid gap-5 ${layout === '2x2' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {cameras.map((camera, i) => (
          <motion.div
            key={camera.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {/* Video placeholder */}
            <div className="relative aspect-video bg-black cursor-pointer" onClick={() => setSelectedCamera(selectedCamera === camera.id ? null : camera.id)}>
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="text-center">
                  <Video className={`mx-auto mb-2 ${layout === '2x2' ? 'w-12 h-12' : 'w-8 h-8'} text-gray-600`} />
                  <p className="text-gray-500 text-sm">
                    {camera.status === 'online' ? 'Видеопоток' : 'Нет сигнала'}
                  </p>
                </div>
              </div>

              {/* Status badge */}
              <div className="absolute top-3 left-3">
                {camera.status === 'online' ? (
                  <Badge className="bg-red-600 text-white border-0 gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    LIVE
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1.5 bg-gray-700 text-gray-300 border-0">
                    <WifiOff className="w-3 h-3" />
                    OFFLINE
                  </Badge>
                )}
              </div>

              {/* Camera info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <h3 className="text-white font-semibold text-sm">{camera.name}</h3>
                <p className="text-white/70 text-xs">{camera.location}</p>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white h-8 w-8"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Controls */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-[hsl(var(--status-active))]' : 'bg-[hsl(var(--status-overdue))]'}`} />
                <span className="text-sm text-muted-foreground">
                  {camera.status === 'online' ? 'Онлайн' : 'Офлайн'}
                </span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminCameras;
