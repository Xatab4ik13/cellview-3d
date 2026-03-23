import { Video, Shield, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const CAMERAS_URL = 'https://cameras.kladovka78.ru';

const SurveillanceSection = () => {
  const [iframeKey, setIframeKey] = useState(0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
            <Video className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Видеонаблюдение</h2>
            <p className="text-sm text-muted-foreground">Просмотр камер в режиме реального времени</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIframeKey(k => k + 1)}
          >
            <RefreshCw className="w-4 h-4" />
            Обновить
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open(CAMERAS_URL, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Открыть отдельно
          </Button>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
        <Shield className="w-5 h-5 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          Видеозаписи хранятся 30 дней. Для получения архивных записей обратитесь к администратору.
        </p>
      </div>

      {/* Camera iframe */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
        <div className="relative w-full" style={{ minHeight: '600px' }}>
          <iframe
            key={iframeKey}
            src={CAMERAS_URL}
            className="w-full h-full absolute inset-0 border-0"
            style={{ minHeight: '600px' }}
            title="Видеонаблюдение"
            allow="fullscreen"
          />
        </div>
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
