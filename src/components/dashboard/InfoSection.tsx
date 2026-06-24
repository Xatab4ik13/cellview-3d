import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { FileText, HelpCircle, Phone, Mail, MessageCircle, ExternalLink, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteDocuments } from '@/hooks/useSettings';
import { iconMap } from '@/data/siteDocuments';

const InfoSection = () => {
  const { data: allDocs = [] } = useSiteDocuments();
  const documents = allDocs.filter(d => d.isPublished);

  const faqItems = [
    {
      question: 'Как получить гостевой доступ?',
      answer: 'В наши кладовые можно прийти в любое время, посмотреть пространство и выбрать подходящий размер ячейки. Оставьте заявку на сайте или позвоните 8(911)810-83-83.',
    },
    {
      question: 'Нужно ли покупать замок на ячейку?',
      answer: 'Для конфиденциальности и безопасности мы предоставляем возможность арендаторам самостоятельно приобрести замок на бокс, чтобы ключ был только у арендатора.',
    },
    {
      question: 'Есть ли сотрудники в помещении?',
      answer: 'Наши кладовые работают в автономном режиме, без персонала. Благодаря системе бесключевого доступа вы можете посетить кладовую, позвонив на специальный номер. Служба заботы всегда на связи — 8(911)810-83-83.',
    },
    {
      question: 'Какой минимальный срок аренды?',
      answer: 'Минимальный срок аренды — один месяц. При оплате сразу за несколько месяцев предусмотрены скидки.',
    },
    {
      question: 'Что нельзя хранить в ячейке?',
      answer: 'Запрещено хранить: корма для животных, газовые баллоны, живых существ, опасные и скоропортящиеся товары, взрывчатые вещества, оружие, боеприпасы, горючие и легковоспламеняющиеся предметы, продовольственные товары и мусор.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Documents */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg border-b border-border/50">
          <CardTitle className="text-xl font-bold">Документы</CardTitle>
          <CardDescription>
            Важные документы и правила использования
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {documents.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-4">Документы появятся здесь</p>
          )}
          {documents.map(doc => {
            const Icon = iconMap[doc.icon] || FileText;
            const isInternal = doc.fileUrl && doc.fileUrl.startsWith('/') && !doc.fileUrl.includes('.');
            const content = (
              <>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{doc.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{doc.description}</p>
                </div>
                {doc.fileUrl && !isInternal && <Download className="w-4 h-4 text-muted-foreground shrink-0" />}
              </>
            );
            const baseCls = "flex items-start gap-4 p-5 border border-border/50 rounded-xl hover:bg-secondary/50 hover:border-primary/30 transition-all text-left group";
            if (!doc.fileUrl) {
              return <div key={doc.id} className={baseCls}>{content}</div>;
            }
            if (isInternal) {
              return <Link key={doc.id} to={doc.fileUrl} className={baseCls}>{content}</Link>;
            }
            return (
              <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download className={baseCls}>
                {content}
              </a>
            );
          })}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <HelpCircle className="w-5 h-5 text-primary" />
                Частые вопросы
              </CardTitle>
              <CardDescription>
                Ответы на популярные вопросы клиентов
              </CardDescription>
            </div>
            <Button variant="outline" asChild className="font-semibold border-primary/30 hover:border-primary hover:bg-primary/5">
              <Link to="/faq" className="gap-2">
                Все вопросы
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                <AccordionTrigger className="text-left font-semibold hover:text-primary">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg border-b border-border/50">
          <CardTitle className="text-xl font-bold">Связаться с нами</CardTitle>
          <CardDescription>
            Служба поддержки работает ежедневно с 9:00 до 21:00
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="tel:+79118108383"
              className="flex items-center gap-4 p-5 border border-border/50 rounded-xl hover:bg-secondary/50 hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Phone className="w-7 h-7 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Телефон</p>
                <p className="font-bold text-lg">8 (911) 810-83-83</p>
              </div>
            </a>
            
            <a
              href="mailto:info@kladovka78.ru"
              className="flex items-center gap-4 p-5 border border-border/50 rounded-xl hover:bg-secondary/50 hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Email</p>
                <p className="font-bold text-lg">info@kladovka78.ru</p>
              </div>
            </a>
            
            <a
              href="https://t.me/kladovka78"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 border border-border/50 rounded-xl hover:bg-secondary/50 hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageCircle className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Telegram</p>
                <p className="font-bold text-lg">@kladovka78</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoSection;
