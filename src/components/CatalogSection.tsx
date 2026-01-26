import { useState, useMemo } from 'react';
import { storageCells } from '@/data/storageCells';
import { StorageCell, FilterOptions } from '@/types/storage';
import CellCard from './CellCard';
import CellCardVariantA from './CellCardVariantA';
import CellCardVariantB from './CellCardVariantB';
import CellModal from './CellModal';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  SortAsc, 
  Grid3X3, 
  List,
  Zap,
  Layers,
  X
} from 'lucide-react';

const CatalogSection = () => {
  const [selectedCell, setSelectedCell] = useState<StorageCell | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState<FilterOptions>({
    availableOnly: false,
    hasSocket: false,
    hasShelves: false,
  });
  
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [areaRange, setAreaRange] = useState<[number, number]>([0, 20]);
  
  const filteredCells = useMemo(() => {
    return storageCells.filter(cell => {
      if (filters.availableOnly && !cell.isAvailable) return false;
      if (filters.hasSocket && !cell.hasSocket) return false;
      if (filters.hasShelves && !cell.hasShelves) return false;
      if (cell.pricePerMonth < priceRange[0] || cell.pricePerMonth > priceRange[1]) return false;
      if (cell.area < areaRange[0] || cell.area > areaRange[1]) return false;
      return true;
    });
  }, [filters, priceRange, areaRange]);
  
  const handleSelectCell = (cell: StorageCell) => {
    setSelectedCell(cell);
    setIsModalOpen(true);
  };
  
  const clearFilters = () => {
    setFilters({
      availableOnly: false,
      hasSocket: false,
      hasShelves: false,
    });
    setPriceRange([0, 10000]);
    setAreaRange([0, 20]);
  };
  
  const activeFiltersCount = [
    filters.availableOnly,
    filters.hasSocket,
    filters.hasShelves,
    priceRange[0] > 0 || priceRange[1] < 10000,
    areaRange[0] > 0 || areaRange[1] < 20,
  ].filter(Boolean).length;

  return (
    <section id="catalog" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-2">
              Каталог ячеек
            </h2>
            <p className="text-muted-foreground">
              {filteredCells.length} из {storageCells.length} ячеек
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Filter toggle */}
            <Button 
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Фильтры
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            {/* View mode toggle */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-8 p-6 bg-card border border-border rounded-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Фильтры</h3>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  <X className="w-4 h-4" />
                  Сбросить
                </Button>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Price range */}
              <div className="space-y-3">
                <Label>Цена, ₽/мес</Label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  min={0}
                  max={10000}
                  step={100}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{priceRange[0].toLocaleString('ru-RU')}</span>
                  <span>{priceRange[1].toLocaleString('ru-RU')}</span>
                </div>
              </div>
              
              {/* Area range */}
              <div className="space-y-3">
                <Label>Площадь, м²</Label>
                <Slider
                  value={areaRange}
                  onValueChange={(value) => setAreaRange(value as [number, number])}
                  min={0}
                  max={20}
                  step={0.5}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{areaRange[0]}</span>
                  <span>{areaRange[1]}</span>
                </div>
              </div>
              
              {/* Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="available" className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Только свободные
                  </Label>
                  <Switch 
                    id="available"
                    checked={filters.availableOnly}
                    onCheckedChange={(checked) => 
                      setFilters(f => ({ ...f, availableOnly: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="socket" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    С розеткой
                  </Label>
                  <Switch 
                    id="socket"
                    checked={filters.hasSocket}
                    onCheckedChange={(checked) => 
                      setFilters(f => ({ ...f, hasSocket: checked }))
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="shelves" className="flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    С полками
                  </Label>
                  <Switch 
                    id="shelves"
                    checked={filters.hasShelves}
                    onCheckedChange={(checked) => 
                      setFilters(f => ({ ...f, hasShelves: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cells grid */}
        {filteredCells.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredCells.map((cell) => (
              <CellCardVariantB 
                key={cell.id} 
                cell={cell} 
                onSelect={handleSelectCell}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ячейки не найдены</h3>
            <p className="text-muted-foreground mb-4">
              Попробуйте изменить параметры фильтрации
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
      
      <CellModal 
        cell={selectedCell}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default CatalogSection;
