import { useState, useMemo } from 'react';
import { useCells } from '@/hooks/useCells';
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
  const { data: storageCells = [], isLoading } = useCells();
  const [selectedCell, setSelectedCell] = useState<StorageCell | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState<FilterOptions>({
    availableOnly: false,
    hasShelves: false,
    tier: undefined,
  });
  
  // Dynamic ranges based on actual data
  const dataRanges = useMemo(() => {
    if (storageCells.length === 0) return { minPrice: 1000, maxPrice: 8000, minVol: 0.5, maxVol: 6 };
    const prices = storageCells.map(c => c.pricePerMonth);
    const volumes = storageCells.map(c => c.volume);
    return {
      minPrice: Math.floor(Math.min(...prices) / 100) * 100,
      maxPrice: Math.ceil(Math.max(...prices) / 100) * 100,
      minVol: Math.floor(Math.min(...volumes) * 10) / 10,
      maxVol: Math.ceil(Math.max(...volumes) * 10) / 10,
    };
  }, [storageCells]);

  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [volumeRange, setVolumeRange] = useState<[number, number] | null>(null);

  const effectivePriceRange = priceRange ?? [dataRanges.minPrice, dataRanges.maxPrice];
  const effectiveVolumeRange = volumeRange ?? [dataRanges.minVol, dataRanges.maxVol];
  
  const filteredCells = useMemo(() => {
    // Публичный каталог — показываем только доступные клиенту ячейки
    return storageCells.filter(cell => {
      if (!cell.isAvailable) return false;
      if (filters.hasShelves && !cell.hasShelves) return false;
      if (filters.tier !== undefined && cell.tier !== filters.tier) return false;
      if (cell.pricePerMonth < effectivePriceRange[0] || cell.pricePerMonth > effectivePriceRange[1]) return false;
      if (cell.volume < effectiveVolumeRange[0] || cell.volume > effectiveVolumeRange[1]) return false;
      return true;
    });
  }, [storageCells, filters, effectivePriceRange, effectiveVolumeRange]);
  
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
    setPriceRange(null);
    setVolumeRange(null);
    setCurrentPage(1);
  };
  
  const activeFiltersCount = [
    filters.availableOnly,
    filters.hasShelves,
    filters.tier !== undefined,
    priceRange !== null && (priceRange[0] > dataRanges.minPrice || priceRange[1] < dataRanges.maxPrice),
    volumeRange !== null && (volumeRange[0] > dataRanges.minVol || volumeRange[1] < dataRanges.maxVol),
  ].filter(Boolean).length;

  return (
    <section id="catalog" className="py-16 lg:py-24 section-purple">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="heading-section text-foreground mb-2">
              Каталог <span className="text-primary">ячеек</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Свободно {filteredCells.length} {filteredCells.length === 1 ? 'кладовка' : 'кладовок'}
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
          <div className="mb-8 p-6 bg-card border-2 border-border rounded-2xl shadow-lg animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Фильтры</h3>
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
                      value={effectivePriceRange[0]}
                      onChange={(e) => {
                        const val = Math.max(dataRanges.minPrice, Math.min(Number(e.target.value), effectivePriceRange[1]));
                        setPriceRange([val, effectivePriceRange[1]]);
                        handleFilterChange();
                      }}
                      className="h-9 text-center text-sm font-medium pr-8"
                      min={dataRanges.minPrice}
                      max={effectivePriceRange[1]}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₽</span>
                  </div>
                  <span className="text-muted-foreground">—</span>
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      value={effectivePriceRange[1]}
                      onChange={(e) => {
                        const val = Math.max(effectivePriceRange[0], Math.min(Number(e.target.value), dataRanges.maxPrice));
                        setPriceRange([effectivePriceRange[0], val]);
                        handleFilterChange();
                      }}
                      className="h-9 text-center text-sm font-medium pr-8"
                      min={effectivePriceRange[0]}
                      max={dataRanges.maxPrice}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₽</span>
                  </div>
                </div>
                <Slider
                  value={effectivePriceRange}
                  onValueChange={(value) => {
                    setPriceRange(value as [number, number]);
                    handleFilterChange();
                  }}
                  min={dataRanges.minPrice}
                  max={dataRanges.maxPrice}
                  step={100}
                  className="mt-2"
                />
              </div>
              
              {/* Volume range */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Объём, м³</Label>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      value={effectiveVolumeRange[0]}
                      onChange={(e) => {
                        const val = Math.max(dataRanges.minVol, Math.min(Number(e.target.value), effectiveVolumeRange[1]));
                        setVolumeRange([val, effectiveVolumeRange[1]]);
                        handleFilterChange();
                      }}
                      className="h-9 text-center text-sm font-medium pr-10"
                      min={dataRanges.minVol}
                      max={effectiveVolumeRange[1]}
                      step={0.1}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">м³</span>
                  </div>
                  <span className="text-muted-foreground">—</span>
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      value={effectiveVolumeRange[1]}
                      onChange={(e) => {
                        const val = Math.max(effectiveVolumeRange[0], Math.min(Number(e.target.value), dataRanges.maxVol));
                        setVolumeRange([effectiveVolumeRange[0], val]);
                        handleFilterChange();
                      }}
                      className="h-9 text-center text-sm font-medium pr-10"
                      min={effectiveVolumeRange[0]}
                      max={dataRanges.maxVol}
                      step={0.1}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">м³</span>
                  </div>
                </div>
                <Slider
                  value={effectiveVolumeRange}
                  onValueChange={(value) => {
                    setVolumeRange(value as [number, number]);
                    handleFilterChange();
                  }}
                  min={dataRanges.minVol}
                  max={dataRanges.maxVol}
                  step={0.1}
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
