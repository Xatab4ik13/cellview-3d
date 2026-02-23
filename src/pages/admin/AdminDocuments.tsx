import { useState } from 'react';
import { FolderOpen, FileText, FilePlus, Download, Eye, Search, Filter, Calendar, User, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type DocType = 'contract' | 'act' | 'invoice' | 'receipt';
type DocStatus = 'draft' | 'active' | 'signed' | 'expired';

interface Document {
  id: string;
  type: DocType;
  title: string;
  client: string;
  cell: string;
  date: string;
  status: DocStatus;
  amount?: number;
}

const docTypeLabels: Record<DocType, string> = {
  contract: 'Договор',
  act: 'Акт',
  invoice: 'Счёт',
  receipt: 'Квитанция',
};

const docTypeIcons: Record<DocType, string> = {
  contract: '📄',
  act: '📋',
  invoice: '🧾',
  receipt: '🧾',
};

const statusConfig: Record<DocStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Черновик', color: 'var(--status-pending)', icon: Clock },
  active: { label: 'Активный', color: 'var(--status-active)', icon: CheckCircle2 },
  signed: { label: 'Подписан', color: 'var(--status-new)', icon: CheckCircle2 },
  expired: { label: 'Истёк', color: 'var(--status-overdue)', icon: AlertCircle },
};

const mockDocuments: Document[] = [
  { id: 'D-001', type: 'contract', title: 'Договор аренды №78-001', client: 'Иванов А.С.', cell: 'A-12', date: '2024-01-15', status: 'active', amount: 4500 },
  { id: 'D-002', type: 'contract', title: 'Договор аренды №78-002', client: 'Петрова М.В.', cell: 'B-05', date: '2024-02-01', status: 'active', amount: 6200 },
  { id: 'D-003', type: 'act', title: 'Акт приёма-передачи №12', client: 'Иванов А.С.', cell: 'A-12', date: '2024-01-15', status: 'signed' },
  { id: 'D-004', type: 'invoice', title: 'Счёт №2024-031', client: 'Сидоров К.Н.', cell: 'C-18', date: '2024-03-01', status: 'draft', amount: 3800 },
  { id: 'D-005', type: 'contract', title: 'Договор аренды №78-003', client: 'ООО "Техника"', cell: 'D-01', date: '2023-06-10', status: 'expired', amount: 12000 },
  { id: 'D-006', type: 'receipt', title: 'Квитанция об оплате №455', client: 'Петрова М.В.', cell: 'B-05', date: '2024-03-05', status: 'signed', amount: 6200 },
  { id: 'D-007', type: 'act', title: 'Акт возврата №8', client: 'ООО "Техника"', cell: 'D-01', date: '2024-02-28', status: 'signed' },
  { id: 'D-008', type: 'invoice', title: 'Счёт №2024-045', client: 'Козлов Д.И.', cell: 'A-03', date: '2024-03-10', status: 'active', amount: 5100 },
];

const AdminDocuments = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filtered = mockDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.client.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && doc.type === activeTab;
  });

  const counts = {
    all: mockDocuments.length,
    contract: mockDocuments.filter(d => d.type === 'contract').length,
    act: mockDocuments.filter(d => d.type === 'act').length,
    invoice: mockDocuments.filter(d => d.type === 'invoice').length,
    receipt: mockDocuments.filter(d => d.type === 'receipt').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Документы</h2>
          <p className="text-base text-muted-foreground mt-1">Договоры, акты, счета и квитанции</p>
        </div>
        <Button
          className="gap-2 h-11 text-base"
          onClick={() => toast.info('Создание документов будет доступно после подключения базы данных')}
        >
          <FilePlus className="w-5 h-5" />
          Создать документ
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {([
          { label: 'Активных договоров', value: mockDocuments.filter(d => d.type === 'contract' && d.status === 'active').length, color: 'var(--status-active)' },
          { label: 'Черновиков', value: mockDocuments.filter(d => d.status === 'draft').length, color: 'var(--status-pending)' },
          { label: 'Истёкших', value: mockDocuments.filter(d => d.status === 'expired').length, color: 'var(--status-overdue)' },
          { label: 'Всего документов', value: mockDocuments.length, color: 'var(--status-new)' },
        ]).map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: `hsl(${stat.color})` }}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs + Search */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <TabsList className="h-11">
            <TabsTrigger value="all" className="text-sm px-4">Все ({counts.all})</TabsTrigger>
            <TabsTrigger value="contract" className="text-sm px-4">Договоры ({counts.contract})</TabsTrigger>
            <TabsTrigger value="act" className="text-sm px-4">Акты ({counts.act})</TabsTrigger>
            <TabsTrigger value="invoice" className="text-sm px-4">Счета ({counts.invoice})</TabsTrigger>
            <TabsTrigger value="receipt" className="text-sm px-4">Квитанции ({counts.receipt})</TabsTrigger>
          </TabsList>
          <div className="relative max-w-[300px] w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск документов..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-5">
          <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Документ</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Клиент</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Ячейка</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Дата</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Сумма</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Статус</th>
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc, i) => {
                    const sc = statusConfig[doc.status];
                    const StatusIcon = sc.icon;
                    return (
                      <motion.tr
                        key={doc.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{docTypeIcons[doc.type]}</span>
                            <div>
                              <p className="font-medium text-sm">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">{docTypeLabels[doc.type]}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{doc.client}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="font-mono text-xs">{doc.cell}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(doc.date).toLocaleDateString('ru-RU')}
                          </div>
                        </td>
                        <td className="p-4">
                          {doc.amount ? (
                            <span className="font-semibold text-sm">{doc.amount.toLocaleString('ru-RU')} ₽</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className="gap-1.5"
                            style={{
                              borderColor: `hsl(${sc.color} / 0.3)`,
                              color: `hsl(${sc.color})`,
                              backgroundColor: `hsl(${sc.color} / 0.1)`,
                            }}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {sc.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => toast.info(`Просмотр: ${doc.title} — будет доступно после подключения базы данных`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => toast.info(`Скачивание: ${doc.title} — будет доступно после подключения базы данных`)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDocuments;
