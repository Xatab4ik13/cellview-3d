import { useState } from 'react';
import { Globe, Type, Image, Search, Save, Eye, Palette, Layout, FileText, Phone, MapPin, Clock, ExternalLink, File, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const AdminSite = () => {
  const [siteData, setSiteData] = useState({
    // SEO
    seoTitle: 'Кладовка78 — Аренда складских ячеек в Санкт-Петербурге',
    seoDescription: 'Надёжное хранение вещей от 1500₽/мес. Видеонаблюдение 24/7. Удобный доступ.',
    seoKeywords: 'склад, аренда ячейки, хранение вещей, Санкт-Петербург',
    // Hero
    heroTitle: 'Надёжное хранение вещей',
    heroSubtitle: 'Арендуйте складскую ячейку от 1500₽ в месяц с круглосуточным доступом',
    // Contacts
    phone: '+7 (812) 555-78-78',
    email: 'info@kladovka78.ru',
    address: 'Санкт-Петербург, ул. Примерная, д. 78',
    workHours: 'Пн-Вс: 08:00 — 22:00',
    // Social
    telegram: '@kladovka78',
    whatsapp: '+78125557878',
    vk: 'https://vk.com/kladovka78',
    // Features toggles
    showPricing: true,
    showFAQ: true,
    showCatalog: true,
    showContacts: true,
  });

  const handleSave = () => {
    toast.success('Настройки сайта сохранены');
  };

  const CardBlock = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
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

        {/* Content tab */}
        <TabsContent value="content" className="space-y-6">
          <CardBlock title="Главный экран (Hero)" icon={Image}>
            <Field label="Заголовок" value={siteData.heroTitle} onChange={update('heroTitle')} />
            <Field label="Подзаголовок" value={siteData.heroSubtitle} onChange={update('heroSubtitle')} multiline />
          </CardBlock>
        </TabsContent>

        {/* Contacts tab */}
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

        {/* SEO tab */}
        <TabsContent value="seo" className="space-y-6">
          <CardBlock title="Поисковая оптимизация" icon={Search}>
            <Field label="Title (до 60 символов)" value={siteData.seoTitle} onChange={update('seoTitle')} />
            <div className="text-xs text-muted-foreground text-right">{siteData.seoTitle.length}/60</div>
            <Field label="Description (до 160 символов)" value={siteData.seoDescription} onChange={update('seoDescription')} multiline />
            <div className="text-xs text-muted-foreground text-right">{siteData.seoDescription.length}/160</div>
            <Field label="Ключевые слова" value={siteData.seoKeywords} onChange={update('seoKeywords')} />
            {/* Preview */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2">Предпросмотр в поисковой выдаче:</p>
              <p className="text-primary text-base font-medium hover:underline cursor-pointer">{siteData.seoTitle}</p>
              <p className="text-[hsl(var(--status-active))] text-xs mt-0.5">kladovka78.ru</p>
              <p className="text-sm text-muted-foreground mt-1">{siteData.seoDescription}</p>
            </div>
          </CardBlock>
        </TabsContent>

        {/* Pages tab */}
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
          <CardBlock title="Публичные документы" icon={FileText}>
            <p className="text-sm text-muted-foreground mb-4">
              Документы, доступные на сайте для клиентов: оферта, политика конфиденциальности, согласие на обработку данных
            </p>
            {[
              { key: 'privacy', label: 'Политика конфиденциальности', path: '/privacy', status: 'published' },
              { key: 'consent', label: 'Согласие на обработку данных', path: '/consent', status: 'published' },
              { key: 'docs', label: 'Публичная оферта', path: '/docs', status: 'published' },
            ].map(doc => (
              <div key={doc.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <File className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.label}</p>
                    <p className="text-xs text-muted-foreground">{doc.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs" style={{
                    borderColor: 'hsl(var(--status-active) / 0.3)',
                    color: 'hsl(var(--status-active))',
                    backgroundColor: 'hsl(var(--status-active) / 0.1)',
                  }}>
                    Опубликован
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(doc.path, '_blank')}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast.info(`Редактирование "${doc.label}" будет доступно после подключения базы данных`)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardBlock>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSite;
