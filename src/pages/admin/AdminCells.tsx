import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Edit, Trash2, Box, Upload, X, Image } from 'lucide-react';
import { storageCells } from '@/data/storageCells';
import { calculatePrice } from '@/types/storage';
import CellProjectionPreview from '@/components/admin/CellProjectionPreview';

const AdminCells = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const nextNumber = storageCells.length > 0 ? Math.max(...storageCells.map(c => c.number)) + 1 : 1;
  
  const [formData, setFormData] = useState({
    number: '',
    width: '',
    depth: '',
    height: '',
    floor: '1',
    tier: '1',
    hasSocket: false,
    hasShelves: false,
  });

  const getDimensions = (cell: typeof storageCells[0]) => 
    `${cell.width} × ${cell.depth} × ${cell.height} м`;

  const filteredCells = storageCells.filter(
    (cell) =>
      cell.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getDimensions(cell).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableCount = storageCells.filter((c) => c.isAvailable).length;
  const occupiedCount = storageCells.filter((c) => !c.isAvailable).length;

  // Calculate volume and price dynamically
  const volume = (parseFloat(formData.width) || 0) * (parseFloat(formData.depth) || 0) * (parseFloat(formData.height) || 0);
  const calculatedPrice = volume > 0 ? calculatePrice(volume) : 0;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setPhotos(prev => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      number: '',
      width: '',
      depth: '',
      height: '',
      floor: '1',
      tier: '1',
      hasSocket: false,
      hasShelves: false,
    });
    setPhotos([]);
    setPhotoPreviews([]);
  };

  const handleAddCell = () => {
    // Here you would normally save to backend
    console.log('Adding cell:', { ...formData, photos, calculatedPrice });
    resetForm();
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Управление ячейками</h2>
          <p className="text-muted-foreground">
            Всего: {storageCells.length} | Свободно: {availableCount} | Занято: {occupiedCount}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить ячейку
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Добавить новую ячейку</DialogTitle>
              <DialogDescription>
                Заполните информацию о новой ячейке хранения
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Projection Preview */}
              <div className="space-y-2">
                <Label>Превью проекции</Label>
                <CellProjectionPreview
                  width={parseFloat(formData.width) || 0}
                  height={parseFloat(formData.height) || 0}
                  depth={parseFloat(formData.depth) || 0}
                />
              </div>

              {/* Cell Number */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="number">Номер ячейки</Label>
                  <Input 
                    id="number" 
                    type="number" 
                    placeholder={String(nextNumber)}
                    value={formData.number}
                    onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Следующий: {nextNumber}</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tier">Ярус</Label>
                  <Input 
                    id="tier" 
                    type="number" 
                    min="1"
                    placeholder="1"
                    value={formData.tier}
                    onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))}
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="width">Ширина (м)</Label>
                  <Input 
                    id="width" 
                    type="number" 
                    step="0.1"
                    placeholder="2.0" 
                    value={formData.width}
                    onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="depth">Глубина (м)</Label>
                  <Input 
                    id="depth" 
                    type="number" 
                    step="0.1"
                    placeholder="2.5" 
                    value={formData.depth}
                    onChange={(e) => setFormData(prev => ({ ...prev, depth: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="height">Высота (м)</Label>
                  <Input 
                    id="height" 
                    type="number" 
                    step="0.1"
                    placeholder="2.5" 
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  />
                </div>
              </div>

              {/* Calculated values */}
              {volume > 0 && (
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Объём:</span>
                    <span className="font-medium">{volume.toFixed(2)} м³</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Площадь:</span>
                    <span className="font-medium">{((parseFloat(formData.width) || 0) * (parseFloat(formData.depth) || 0)).toFixed(2)} м²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Цена (1500₽/м³):</span>
                    <span className="font-bold text-primary">₽ {calculatedPrice.toLocaleString()}/мес</span>
                  </div>
                </div>
              )}

              {/* Floor */}
              <div className="grid gap-2">
                <Label htmlFor="floor">Этаж</Label>
                <Input 
                  id="floor" 
                  type="number" 
                  placeholder="1" 
                  value={formData.floor}
                  onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                />
              </div>

              {/* Options */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch 
                    id="socket" 
                    checked={formData.hasSocket}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasSocket: checked }))}
                  />
                  <Label htmlFor="socket">Розетка</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    id="shelves" 
                    checked={formData.hasShelves}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasShelves: checked }))}
                  />
                  <Label htmlFor="shelves">Стеллажи</Label>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-3">
                <Label>Фотографии ячейки</Label>
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Нажмите для загрузки или перетащите файлы
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG до 10MB
                  </p>
                </div>

                {/* Photo Previews */}
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img 
                          src={preview} 
                          alt={`Фото ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {photos.length > 0 && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Image className="h-4 w-4" />
                    Загружено: {photos.length} фото
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddCell} disabled={volume === 0}>
                Добавить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ID или размерам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Размеры</TableHead>
                <TableHead>Объём</TableHead>
                <TableHead>Цена/мес</TableHead>
                <TableHead>Опции</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCells.map((cell) => (
                <TableRow key={cell.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-muted-foreground" />
                      {cell.id}
                    </div>
                  </TableCell>
                  <TableCell>{getDimensions(cell)}</TableCell>
                  <TableCell>{cell.volume} м³</TableCell>
                  <TableCell>₽ {cell.pricePerMonth.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {cell.hasSocket && (
                        <Badge variant="outline" className="text-xs">
                          Розетка
                        </Badge>
                      )}
                      {cell.hasShelves && (
                        <Badge variant="outline" className="text-xs">
                          Стеллажи
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={cell.isAvailable ? 'default' : 'secondary'}
                      className={cell.isAvailable ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : ''}
                    >
                      {cell.isAvailable ? 'Свободна' : 'Занята'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCells;
