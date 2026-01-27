import { Video, Shield, Maximize2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const cameras = [
  {
    id: 1,
    name: 'Камера 1 — Вход',
    location: 'Главный вход склада',
    status: 'online',
  },
  {
    id: 2,
    name: 'Камера 2 — Коридор',
    location: 'Коридор ячеек A1-A20',
    status: 'online',
  },
];

const SurveillanceSection = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
            <Video className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Видеонаблюдение</h2>
            <p className="text-sm text-muted-foreground">Просмотр камер в режиме реального времени</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Все камеры онлайн
        </Badge>
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
        <Shield className="w-5 h-5 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          Видеозаписи хранятся 30 дней. Для получения архивных записей обратитесь к администратору.
        </p>
      </div>

      {/* Camera grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {cameras.map((camera) => (
          <div
            key={camera.id}
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg"
          >
            {/* Video placeholder */}
            <div className="relative aspect-video bg-black">
              {/* Placeholder for video stream */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="text-center">
                  <Video className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Видеопоток</p>
                  <p className="text-gray-600 text-xs mt-1">Подключение к камере...</p>
                </div>
              </div>
              
              {/* Live indicator */}
              <div className="absolute top-3 left-3">
                <Badge className="bg-red-600 text-white border-0 gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE
                </Badge>
              </div>

              {/* Camera name overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-white font-semibold">{camera.name}</h3>
                <p className="text-white/70 text-sm">{camera.location}</p>
              </div>

              {/* Fullscreen button */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Controls */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-muted-foreground">Онлайн</span>
              </div>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <RefreshCw className="w-4 h-4" />
                Обновить
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Info card */}
      <div className="bg-secondary/50 rounded-xl p-6 border border-border">
        <h3 className="font-semibold mb-3">О системе видеонаблюдения</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            Круглосуточная запись в HD качестве
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            Детекция движения с оповещением
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            Защищённое хранение данных
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            Просмотр доступен только для арендаторов
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SurveillanceSection;
