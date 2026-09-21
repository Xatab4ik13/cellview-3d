import { useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.kladovka78.ru';

const StoragePlanSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let api: { destroy?: () => void } | null = null;
    let cancelled = false;

    (async () => {
      try {
        const mod: any = await loadPlanModule();
        if (cancelled || !containerRef.current) return;
        api = await mod.mount(containerRef.current, {
          model: '/plan/kladovka78-plan.glb',
          statusUrl: `${API_BASE}/api/cells/public-status`,
          refreshMs: 60000,
        });
      } catch (e) {
        console.error('Не удалось загрузить план кладовок', e);
      }
    })();

    return () => {
      cancelled = true;
      api?.destroy?.();
    };
  }, []);

  return (
    <section id="plan" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">План склада</h2>
          <p className="text-muted-foreground">
            Интерактивный план кладовок на Алтайской, 21. Зелёная дверь — свободна,
            жёлтая — в брони, красная — занята.
          </p>
        </div>
        <div
          ref={containerRef}
          className="w-full rounded-2xl overflow-hidden border-2 border-border bg-muted"
          style={{ height: '70vh', minHeight: 420 }}
        />
      </div>
    </section>
  );
};

export default StoragePlanSection;
