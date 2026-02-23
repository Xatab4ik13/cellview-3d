import { useState } from 'react';
import { Globe, Type, Image, Search, Save, Eye, Palette, Layout, FileText, Phone, MapPin, Clock, ExternalLink, File, Plus, Trash2, Edit, X, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { defaultDocuments, iconMap, type SiteDocument } from '@/data/siteDocuments';

const AdminSite = () => {
  const [siteData, setSiteData] = useState({
    seoTitle: 'Кладовка78 — Аренда складских ячеек в Санкт-Петербурге',
    seoDescription: 'Надёжное хранение вещей от 1500₽/мес. Видеонаблюдение 24/7. Удобный доступ.',
    seoKeywords: 'склад, аренда ячейки, хранение вещей, Санкт-Петербург',
    heroTitle: 'Надёжное хранение вещей',
    heroSubtitle: 'Арендуйте складскую ячейку от 1500₽ в месяц с круглосуточным доступом',
    phone: '+7 (812) 555-78-78',
    email: 'info@kladovka78.ru',
    address: 'Санкт-Петербург, ул. Примерная, д. 78',
    workHours: 'Пн-Вс: 08:00 — 22:00',
    telegram: '@kladovka78',
    whatsapp: '+78125557878',
    vk: 'https://vk.com/kladovka78',
    showPricing: true,
    showFAQ: true,
    showCatalog: true,
    showContacts: true,
  });

  const [documents, setDocuments] = useState<SiteDocument[]>(defaultDocuments);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<SiteDocument | null>(null);
  const [docForm, setDocForm] = useState({ title: '', description: '', fileUrl: '' });
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<SiteDocument | null>(null);

  const handleSave = () => {
    toast.success('Настройки сайта сохранены');
  };

  const openNewDoc = () => {
    setEditingDoc(null);
    setDocForm({ title: '', description: '', fileUrl: '' });
    setIsDocDialogOpen(true);
  };

  const openEditDoc = (doc: SiteDocument) => {
    setEditingDoc(doc);
    setDocForm({ title: doc.title, description: doc.description, fileUrl: doc.fileUrl || '' });
    setIsDocDialogOpen(true);
  };

  const handleSaveDoc = () => {
    if (!docForm.title.trim() || !docForm.description.trim()) {
      toast.error('Заполните название и описание документа');
      return;
    }
    const now = new Date().toISOString().split('T')[0];
    if (editingDoc) {
      setDocuments(prev => prev.map(d =>
        d.id === editingDoc.id ? { ...d, title: docForm.title, description: docForm.description, fileUrl: docForm.fileUrl.trim() || undefined, updatedAt: now } : d
      ));
      toast.success(`Документ "${docForm.title}" обновлён`);
    } else {
      const newDoc: SiteDocument = {
        id: `doc-${Date.now()}`,
        title: docForm.title.trim(),
        description: docForm.description.trim(),
        icon: 'FileText',
        type: 'PDF',
        isPublished: false,
        updatedAt: now,
        fileUrl: docForm.fileUrl.trim() || undefined,
      };
      setDocuments(prev => [...prev, newDoc]);
      toast.success(`Документ "${newDoc.title}" создан`);
    }
    setIsDocDialogOpen(false);
  };

  const handleDeleteDoc = () => {
    if (!deletingDocId) return;
    const doc = documents.find(d => d.id === deletingDocId);
    setDocuments(prev => prev.filter(d => d.id !== deletingDocId));
    setDeletingDocId(null);
    toast.success(`Документ "${doc?.title}" удалён`);
  };

  const togglePublish = (id: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id !== id) return d;
      const newState = !d.isPublished;
      toast.success(newState ? 'Документ опубликован' : 'Документ снят с публикации');
      return { ...d, isPublished: newState };
    }));
  };

  const CardBlock = ({ title, icon: Icon, children, action }: { title: string; icon: React.ElementType; children: React.ReactNode; action?: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );

  const Field = ({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {multiline ? (
        <Textarea value={value} onChange={e => onChange(e.target.value)} className="min-h-[80px]" />
      ) : (
        <Input value={value} onChange={e => onChange(e.target.value)} className="h-11" />
      )}
    </div>
  );

  const update = (key: string) => (value: string) => setSiteData(prev => ({ ...prev, [key]: value }));
  const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Управление сайтом</h2>
          <p className="text-base text-muted-foreground mt-1">Тексты, контакты, SEO и настройки отображения</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 h-11" onClick={() => window.open('/', '_blank')}>
            <Eye className="w-5 h-5" />
            Предпросмотр
          </Button>
          <Button onClick={handleSave} className="gap-2 h-11 text-base">
            <Save className="w-5 h-5" />
            Сохранить
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="h-11 flex-wrap">
          <TabsTrigger value="content" className="text-sm px-5 gap-2"><Type className="w-4 h-4" />Контент</TabsTrigger>
          <TabsTrigger value="contacts" className="text-sm px-5 gap-2"><Phone className="w-4 h-4" />Контакты</TabsTrigger>
          <TabsTrigger value="seo" className="text-sm px-5 gap-2"><Search className="w-4 h-4" />SEO</TabsTrigger>
          <TabsTrigger value="pages" className="text-sm px-5 gap-2"><Layout className="w-4 h-4" />Страницы</TabsTrigger>
          <TabsTrigger value="documents" className="text-sm px-5 gap-2"><FileText className="w-4 h-4" />Документы</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <CardBlock title="Главный экран (Hero)" icon={Image}>
            <Field label="Заголовок" value={siteData.heroTitle} onChange={update('heroTitle')} />
            <Field label="Подзаголовок" value={siteData.heroSubtitle} onChange={update('heroSubtitle')} multiline />
          </CardBlock>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <CardBlock title="Контактная информация" icon={Phone}>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Телефон" value={siteData.phone} onChange={update('phone')} />
              <Field label="Email" value={siteData.email} onChange={update('email')} />
              <Field label="Адрес" value={siteData.address} onChange={update('address')} />
              <Field label="Часы работы" value={siteData.workHours} onChange={update('workHours')} />
            </div>
          </CardBlock>
          <CardBlock title="Социальные сети" icon={ExternalLink}>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Telegram" value={siteData.telegram} onChange={update('telegram')} />
              <Field label="WhatsApp" value={siteData.whatsapp} onChange={update('whatsapp')} />
              <Field label="ВКонтакте" value={siteData.vk} onChange={update('vk')} />
            </div>
          </CardBlock>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <CardBlock title="Поисковая оптимизация" icon={Search}>
            <Field label="Title (до 60 символов)" value={siteData.seoTitle} onChange={update('seoTitle')} />
            <div className="text-xs text-muted-foreground text-right">{siteData.seoTitle.length}/60</div>
            <Field label="Description (до 160 символов)" value={siteData.seoDescription} onChange={update('seoDescription')} multiline />
            <div className="text-xs text-muted-foreground text-right">{siteData.seoDescription.length}/160</div>
            <Field label="Ключевые слова" value={siteData.seoKeywords} onChange={update('seoKeywords')} />
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2">Предпросмотр в поисковой выдаче:</p>
              <p className="text-primary text-base font-medium hover:underline cursor-pointer">{siteData.seoTitle}</p>
              <p className="text-[hsl(var(--status-active))] text-xs mt-0.5">kladovka78.ru</p>
              <p className="text-sm text-muted-foreground mt-1">{siteData.seoDescription}</p>
            </div>
          </CardBlock>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <CardBlock title="Разделы сайта" icon={Layout}>
            <p className="text-sm text-muted-foreground mb-4">Управляйте видимостью разделов на сайте</p>
            {[
              { key: 'showCatalog', label: 'Каталог ячеек', desc: 'Каталог с фильтрацией и карточками ячеек' },
              { key: 'showPricing', label: 'Цены и калькулятор', desc: 'Страница с тарифами и калькулятором стоимости' },
              { key: 'showFAQ', label: 'Частые вопросы', desc: 'Раздел с ответами на вопросы клиентов' },
              { key: 'showContacts', label: 'Контакты', desc: 'Контактная информация и форма обратной связи' },
            ].map(page => (
              <div key={page.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-sm">{page.label}</p>
                  <p className="text-xs text-muted-foreground">{page.desc}</p>
                </div>
                <Switch
                  checked={(siteData as any)[page.key]}
                  onCheckedChange={(v) => setSiteData(prev => ({ ...prev, [page.key]: v }))}
                />
              </div>
            ))}
          </CardBlock>
        </TabsContent>

        {/* Documents tab */}
        <TabsContent value="documents" className="space-y-6">
          <CardBlock
            title="Публичные документы"
            icon={FileText}
            action={
              <Button className="gap-2 h-9" onClick={openNewDoc}>
                <Plus className="w-4 h-4" />
                Добавить документ
              </Button>
            }
          >
            <p className="text-sm text-muted-foreground mb-2">
              Документы, доступные на сайте: оферта, политика конфиденциальности и др.
            </p>
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Нет документов</p>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between py-3 border-b border-border last:border-0 gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <File className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{doc.description} · {doc.type} · Обновлён {formatDate(doc.updatedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => togglePublish(doc.id)} style={doc.isPublished ? {
                      borderColor: 'hsl(var(--status-active) / 0.3)',
                      color: 'hsl(var(--status-active))',
                      backgroundColor: 'hsl(var(--status-active) / 0.1)',
                    } : {
                      borderColor: 'hsl(var(--status-pending) / 0.3)',
                      color: 'hsl(var(--status-pending))',
                      backgroundColor: 'hsl(var(--status-pending) / 0.1)',
                    }}>
                      {doc.isPublished ? 'Опубликован' : 'Черновик'}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewingDoc(doc)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditDoc(doc)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setDeletingDocId(doc.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardBlock>
        </TabsContent>
      </Tabs>

      {/* Document Create/Edit Dialog */}
      <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDoc ? 'Редактировать документ' : 'Новый документ'}</DialogTitle>
            <DialogDescription>
              {editingDoc ? 'Измените содержание документа' : 'Добавьте новый публичный документ на сайт'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label>Название документа</Label>
              <Input
                placeholder="Например: Правила пользования складом"
                value={docForm.title}
                onChange={e => setDocForm(p => ({ ...p, title: e.target.value }))}
                className="h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label>Описание</Label>
              <Textarea
                placeholder="Краткое описание документа..."
                value={docForm.description}
                onChange={e => setDocForm(p => ({ ...p, description: e.target.value }))}
                className="min-h-[100px] text-sm leading-relaxed"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ссылка на файл (URL)</Label>
              <Input
                placeholder="https://example.com/documents/file.pdf"
                value={docForm.fileUrl}
                onChange={e => setDocForm(p => ({ ...p, fileUrl: e.target.value }))}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">Загрузите файл на сервер и вставьте прямую ссылку для скачивания</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDocDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSaveDoc} disabled={!docForm.title.trim() || !docForm.description.trim()}>
              {editingDoc ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document View Dialog */}
      <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingDoc?.title}</DialogTitle>
            <DialogDescription>
              {viewingDoc?.type} · Обновлён {viewingDoc && formatDate(viewingDoc.updatedAt)}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted/30 rounded-lg border border-border whitespace-pre-wrap text-sm leading-relaxed">
            {viewingDoc?.description}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingDoc(null)}>Закрыть</Button>
            <Button onClick={() => { if (viewingDoc) { openEditDoc(viewingDoc); setViewingDoc(null); } }}>
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingDocId} onOpenChange={() => setDeletingDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить документ?</AlertDialogTitle>
            <AlertDialogDescription>
              Документ «{documents.find(d => d.id === deletingDocId)?.title}» будет удалён с сайта. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDoc} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSite;
