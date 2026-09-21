const API_BASE = import.meta.env.VITE_API_URL || 'https://api.kladovka78.ru';

const StoragePlanSection = () => {
  const statusUrl = encodeURIComponent(`${API_BASE}/api/cells/public-status`);

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
          className="w-full rounded-2xl overflow-hidden border-2 border-border bg-muted"
          style={{ height: '70vh', minHeight: 420 }}
        >
          <iframe
            src={`/plan/index.html?status=${statusUrl}&refresh=60000`}
            title="План кладовок"
            loading="lazy"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </section>
  );
};

export default StoragePlanSection;
