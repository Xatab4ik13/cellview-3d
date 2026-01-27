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
      answer: 'После оплаты вы получите PIN-код в личном кабинете и на email. Введите его на панели у входа в помещение. Доступ 24/7.',
    },
    {
      question: 'Можно ли изменить размер ячейки?',
      answer: 'Да, вы можете перейти на другую ячейку. Свяжитесь с нами, и мы поможем подобрать подходящий вариант с перерасчетом стоимости.',
    },
    {
      question: 'Что делать при утере PIN-кода?',
      answer: 'PIN-код всегда доступен в личном кабинете в разделе "Моя аренда". Также вы можете запросить новый код через службу поддержки.',
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
      <Card>
        <CardHeader>
          <CardTitle>Документы</CardTitle>
          <CardDescription>
            Важные документы и правила использования
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documents.map((doc, index) => (
            <button
              key={index}
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <doc.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{doc.title}</p>
                <p className="text-sm text-muted-foreground">{doc.description}</p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Частые вопросы
              </CardTitle>
              <CardDescription>
                Ответы на популярные вопросы клиентов
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/faq" className="gap-2">
                Все вопросы
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
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
      <Card>
        <CardHeader>
          <CardTitle>Связаться с нами</CardTitle>
          <CardDescription>
            Служба поддержки работает ежедневно с 9:00 до 21:00
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="tel:+78121234567"
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Телефон</p>
                <p className="font-semibold">8 812 123-45-67</p>
              </div>
            </a>
            
            <a
              href="mailto:info@kladovka78.ru"
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">info@kladovka78.ru</p>
              </div>
            </a>
            
            <a
              href="https://t.me/kladovka78"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telegram</p>
                <p className="font-semibold">@kladovka78</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoSection;
