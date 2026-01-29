import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Search, Edit, Trash2, Box } from 'lucide-react';
import { storageCells } from '@/data/storageCells';

const AdminCells = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const getDimensions = (cell: typeof storageCells[0]) => 
    `${cell.width} × ${cell.depth} × ${cell.height} м`;

  const filteredCells = storageCells.filter(
    (cell) =>
      cell.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getDimensions(cell).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableCount = storageCells.filter((c) => c.isAvailable).length;
  const occupiedCount = storageCells.filter((c) => !c.isAvailable).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Управление ячейками</h2>
          <p className="text-muted-foreground">
            Всего: {storageCells.length} | Свободно: {availableCount} | Занято: {occupiedCount}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить ячейку
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новую ячейку</DialogTitle>
              <DialogDescription>
                Заполните информацию о новой ячейке хранения
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cellId">ID ячейки</Label>
                <Input id="cellId" placeholder="Например: A-43" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="area">Площадь (м²)</Label>
                  <Input id="area" type="number" placeholder="5" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Цена (₽/мес)</Label>
                  <Input id="price" type="number" placeholder="5000" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dimensions">Размеры</Label>
                <Input id="dimensions" placeholder="2.5 × 2 × 2.5 м" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="socket" />
                  <Label htmlFor="socket">Розетка</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="shelves" />
                  <Label htmlFor="shelves">Стеллажи</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Добавить</Button>
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
                <TableHead>Площадь</TableHead>
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
                  <TableCell>{cell.area} м²</TableCell>
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
