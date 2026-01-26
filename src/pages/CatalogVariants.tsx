import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CellCardVariantA from '@/components/CellCardVariantA';
import CellCardVariantB from '@/components/CellCardVariantB';
import { storageCells } from '@/data/storageCells';
import { StorageCell } from '@/types/storage';
import { Button } from '@/components/ui/button';

const CatalogVariants = () => {
  const [selectedVariant, setSelectedVariant] = useState<'A' | 'B'>('A');
  
  // Берём несколько ячеек для демонстрации (разные размеры)
  const demoCells = storageCells.slice(0, 6);
  
  const handleSelect = (cell: StorageCell) => {
    console.log('Selected cell:', cell);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 lg:pt-36 pb-16">
        <div className="container mx-auto px-4">
          {/* Variant selector */}
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Сравнение вариантов дизайна
            </h1>
            <p className="text-muted-foreground mb-8">
              Выберите вариант для просмотра
            </p>
            
            <div className="inline-flex gap-4 p-2 bg-muted rounded-2xl">
              <Button
                variant={selectedVariant === 'A' ? 'default' : 'ghost'}
                onClick={() => setSelectedVariant('A')}
                className="px-8"
              >
                Вариант A — Минималистичный
              </Button>
              <Button
                variant={selectedVariant === 'B' ? 'default' : 'ghost'}
                onClick={() => setSelectedVariant('B')}
                className="px-8"
              >
                Вариант B — Изометрический
              </Button>
            </div>
          </div>
          
          {/* Cards grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoCells.map((cell) => (
              selectedVariant === 'A' ? (
                <CellCardVariantA 
                  key={cell.id} 
                  cell={cell} 
                  onSelect={handleSelect}
                />
              ) : (
                <CellCardVariantB 
                  key={cell.id} 
                  cell={cell} 
                  onSelect={handleSelect}
                />
              )
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CatalogVariants;
