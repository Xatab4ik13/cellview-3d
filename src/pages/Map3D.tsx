import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WarehouseMap3D from '@/components/WarehouseMap3D';
import CellInfoPanel from '@/components/CellInfoPanel';
import { storageCells } from '@/data/storageCells';
import { StorageCell } from '@/types/storage';

const Map3D = () => {
  const [selectedCell, setSelectedCell] = useState<StorageCell | null>(null);

  const handleSelectCell = (cellId: string | null) => {
    if (cellId) {
      const cell = storageCells.find(c => c.id === cellId);
      setSelectedCell(cell || null);
    } else {
      setSelectedCell(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                3D-карта <span className="text-gradient-primary">склада</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Интерактивная карта помещения. Вращайте, приближайте и кликайте на ячейки для просмотра деталей
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* 3D Map */}
              <div className="lg:col-span-2">
                <div className="relative h-[500px] lg:h-[700px] rounded-2xl overflow-hidden shadow-xl border border-border/50">
                  <WarehouseMap3D 
                    selectedCellId={selectedCell?.id || null}
                    onSelectCell={handleSelectCell}
                  />
                  
                  {/* Controls hint */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                    <div className="glass px-4 py-2 rounded-full text-sm text-muted-foreground">
                      🖱️ ЛКМ+тянуть — вращать • Колесо — приближать • ПКМ+тянуть — перемещать
                    </div>
                  </div>
                </div>
              </div>

              {/* Cell Info Panel */}
              <div className="lg:col-span-1">
                <CellInfoPanel 
                  cell={selectedCell}
                  onClose={() => setSelectedCell(null)}
                />
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success" />
                <span className="text-sm text-muted-foreground">Свободно</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted" />
                <span className="text-sm text-muted-foreground">Занято</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-accent" />
                <span className="text-sm text-muted-foreground">Выбрано</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Map3D;
