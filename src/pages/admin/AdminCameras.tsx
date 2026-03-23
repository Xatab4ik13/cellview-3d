import { useState } from 'react';
import { Video, Shield, ExternalLink, RefreshCw, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const CAMERAS_URL = 'https://cameras.kladovka78.ru';

const AdminCameras = () => {
  const [iframeKey, setIframeKey] = useState(0);

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
            NVR подключён
          </Badge>
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
          Видеозаписи хранятся 30 дней. Доступ к архиву — через интерфейс NVR.
        </p>
      </div>

      {/* Camera iframe */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="relative w-full" style={{ minHeight: '700px' }}>
          <iframe
            key={iframeKey}
            src={CAMERAS_URL}
            className="w-full h-full absolute inset-0 border-0"
            style={{ minHeight: '700px' }}
            title="Видеонаблюдение — Админ"
            allow="fullscreen"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default AdminCameras;
