import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCells } from '@/hooks/useCells';
import { StorageCell } from '@/types/storage';
import CellCardVariantB from './CellCardVariantB';
import CellModal from './CellModal';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const PREVIEW_COUNT = 8;

const CatalogPreview = () => {
  const { data: storageCells = [], isLoading } = useCells();
  const [selectedCell, setSelectedCell] = useState<StorageCell | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Показываем только первые 8 ячеек
  const previewCells = storageCells.slice(0, PREVIEW_COUNT);
  
  const handleSelectCell = (cell: StorageCell) => {
    setSelectedCell(cell);
    setIsModalOpen(true);
  };

  return (
    <section id="catalog" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-2">
              Каталог ячеек
            </h2>
            <p className="text-muted-foreground">
              {storageCells.length} ячеек в наличии
            </p>
          </div>
          
          <Link to="/catalog">
            <Button variant="outline" className="gap-2">
              Смотреть все
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Cells grid - только 8 ячеек */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {previewCells.map((cell) => (
            <CellCardVariantB 
              key={cell.id} 
              cell={cell} 
              onSelect={handleSelectCell}
            />
          ))}
        </div>
        
        {/* CTA для полного каталога */}
        <div className="mt-10 text-center">
          <Link to="/catalog">
            <Button size="lg" className="gap-2">
              Перейти в каталог
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
      
      <CellModal 
        cell={selectedCell}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default CatalogPreview;
