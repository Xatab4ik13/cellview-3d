import { useState, useMemo } from 'react';
import { storageCells } from '@/data/storageCells';
import { StorageCell, FilterOptions } from '@/types/storage';
import CellCardVariantB from './CellCardVariantB';
import CellModal from './CellModal';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Filter, 
  Grid3X3, 
  Layers,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ITEMS_PER_PAGE = 8;

const CatalogSection = () => {
  const [selectedCell, setSelectedCell] = useState<StorageCell | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState<FilterOptions>({
    availableOnly: false,
    hasShelves: false,
    tier: undefined,
  });
  
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [areaRange, setAreaRange] = useState<[number, number]>([0, 20]);
  
  const filteredCells = useMemo(() => {
    return storageCells.filter(cell => {
      if (filters.availableOnly && !cell.isAvailable) return false;
      if (filters.hasShelves && !cell.hasShelves) return false;
      if (filters.tier !== undefined && cell.tier !== filters.tier) return false;
      if (cell.pricePerMonth < priceRange[0] || cell.pricePerMonth > priceRange[1]) return false;
      if (cell.area < areaRange[0] || cell.area > areaRange[1]) return false;
      return true;
    });
  }, [filters, priceRange, areaRange]);
  
  // Пагинация
  const totalPages = Math.ceil(filteredCells.length / ITEMS_PER_PAGE);
  const paginatedCells = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCells.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCells, currentPage]);
  
  // Сброс страницы при изменении фильтров
  const handleFilterChange = () => {
    setCurrentPage(1);
  };
  
  const handleSelectCell = (cell: StorageCell) => {
    setSelectedCell(cell);
    setIsModalOpen(true);
  };
  
  const clearFilters = () => {
    setFilters({
      availableOnly: false,
      hasShelves: false,
      tier: undefined,
    });
    setPriceRange([0, 10000]);
    setAreaRange([0, 20]);
    setCurrentPage(1);
  };
  
  const activeFiltersCount = [
    filters.availableOnly,
    filters.hasShelves,
    filters.tier !== undefined,
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Цена, ₽/мес</Label>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(Number(e.target.value), priceRange[1]));
                        setPriceRange([val, priceRange[1]]);
                        handleFilterChange();
                      }}
                      className="h-9 text-center text-sm font-medium pr-8"
                      min={0}
                      max={priceRange[1]}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₽</span>
                  </div>
                  <span className="text-muted-foreground">—</span>
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const val = Math.max(priceRange[0], Math.min(Number(e.target.value), 10000));
                        setPriceRange([priceRange[0], val]);
                        handleFilterChange();
                      }}
                      className="h-9 text-center text-sm font-medium pr-8"
                      min={priceRange[0]}
                      max={10000}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₽</span>
                  </div>
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => {
                    setPriceRange(value as [number, number]);
                    handleFilterChange();
                  }}
                  min={0}
                  max={10000}
                  step={100}
                  className="mt-2"
                />
              </div>
              
              {/* Area range */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Площадь, м²</Label>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      value={areaRange[0]}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(Number(e.target.value), areaRange[1]));
                        setAreaRange([val, areaRange[1]]);
                        handleFilterChange();
                      }}
                      className="h-9 text-center text-sm font-medium pr-10"
                      min={0}
                      max={areaRange[1]}
                      step={0.5}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">м²</span>
                  </div>
                  <span className="text-muted-foreground">—</span>
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      value={areaRange[1]}
                      onChange={(e) => {
                        const val = Math.max(areaRange[0], Math.min(Number(e.target.value), 20));
                        setAreaRange([areaRange[0], val]);
                        handleFilterChange();
                      }}
                      className="h-9 text-center text-sm font-medium pr-10"
                      min={areaRange[0]}
                      max={20}
                      step={0.5}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">м²</span>
                  </div>
                </div>
                <Slider
                  value={areaRange}
                  onValueChange={(value) => {
                    setAreaRange(value as [number, number]);
                    handleFilterChange();
                  }}
                  min={0}
                  max={20}
                  step={0.5}
                  className="mt-2"
                />
              </div>
              
              {/* Tier filter */}
              <div className="space-y-3">
                <Label>Ярус</Label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.tier === undefined ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setFilters(f => ({ ...f, tier: undefined }));
                      handleFilterChange();
                    }}
                  >
                    Все
                  </Button>
                  <Button
                    variant={filters.tier === 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setFilters(f => ({ ...f, tier: 1 }));
                      handleFilterChange();
                    }}
                  >
                    1 ярус
                  </Button>
                  <Button
                    variant={filters.tier === 2 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setFilters(f => ({ ...f, tier: 2 }));
                      handleFilterChange();
                    }}
                  >
                    2 ярус
                  </Button>
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
                    onCheckedChange={(checked) => {
                      setFilters(f => ({ ...f, availableOnly: checked }));
                      handleFilterChange();
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="shelves" className="flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    С полками
                  </Label>
                  <Switch 
                    id="shelves"
                    checked={filters.hasShelves}
                    onCheckedChange={(checked) => {
                      setFilters(f => ({ ...f, hasShelves: checked }));
                      handleFilterChange();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cells grid */}
        {paginatedCells.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedCells.map((cell) => (
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
        
        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                onClick={() => setCurrentPage(page)}
                className="w-10 h-10"
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
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
