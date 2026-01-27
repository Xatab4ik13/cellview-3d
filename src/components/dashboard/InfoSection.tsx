import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { FileText, Shield, HelpCircle, Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const InfoSection = () => {
  const documents = [
    { title: 'Условия аренды', description: 'Правила и условия договора аренды', icon: FileText },
    { title: 'Правила безопасности', description: 'Требования к хранению вещей', icon: Shield },
    { title: 'Политика конфиденциальности', description: 'Обработка персональных данных', icon: FileText },
  ];

  const faqItems = [
    {
      question: 'Как получить доступ к ячейке?',
      answer: 'После оплаты вам будет доступен номер телефона для входа в личном кабинете. Просто позвоните на этот номер — дверь откроется автоматически. Доступ 24/7.',
    },
    {
      question: 'Можно ли изменить размер ячейки?',
      answer: 'Да, вы можете перейти на другую ячейку. Свяжитесь с нами, и мы поможем подобрать подходящий вариант с перерасчетом стоимости.',
    },
    {
      question: 'Что если не удаётся дозвониться?',
      answer: 'Номер для доступа всегда указан в личном кабинете в разделе "Моя аренда". Если возникли проблемы со входом — свяжитесь со службой поддержки.',
    },
    {
      question: 'Как продлить аренду?',
      answer: 'При включенном автопродлении оплата списывается автоматически. Для ручного продления перейдите в раздел "Подписка" и нажмите "Продлить".',
    },
    {
      question: 'Что нельзя хранить в ячейке?',
      answer: 'Запрещено хранить: легковоспламеняющиеся и взрывчатые вещества, продукты питания, живых животных, запрещенные предметы по законодательству РФ.',
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
          {documents.map((doc, index) => (
            <button
              key={index}
              className="flex items-start gap-4 p-5 border border-border/50 rounded-xl hover:bg-secondary/50 hover:border-primary/30 transition-all text-left group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <doc.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{doc.title}</p>
                <p className="text-sm text-muted-foreground">{doc.description}</p>
              </div>
            </button>
          ))}
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
              href="tel:+78121234567"
              className="flex items-center gap-4 p-5 border border-border/50 rounded-xl hover:bg-secondary/50 hover:border-primary/30 transition-all group"
            >
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Phone className="w-7 h-7 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Телефон</p>
                <p className="font-bold text-lg">8 812 123-45-67</p>
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
