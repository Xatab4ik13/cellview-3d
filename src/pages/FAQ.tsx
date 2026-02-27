import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight } from 'lucide-react';

const FAQ = () => {
  const faqs = [
    {
      question: 'Как получить гостевой доступ?',
      answer: 'В наши кладовые можно прийти в любое время, посмотреть как устроено пространство и выбрать подходящий вам размер ячейки. Для этого необходимо оставить заявку на сайте или позвонить по телефону 8(911)810-83-83.',
    },
    {
      question: 'Нужно ли покупать замок на ячейку?',
      answer: 'Для конфиденциальности и безопасности мы предоставляем возможность арендаторам самостоятельно приобрести замок на бокс, чтобы ключ был только у арендатора.',
    },
    {
      question: 'Есть ли сотрудники в помещении?',
      answer: 'Наши кладовые работают в автономном режиме, без персонала. Благодаря системе бесключевого доступа арендатор может посетить кладовую, позвонив на специальный номер телефона. При этом наша служба заботы всегда на связи — мы оперативно решим любой вопрос удалённо по номеру 8(911)810-83-83.',
    },
    {
      question: 'Какой минимальный срок аренды ячейки?',
      answer: 'Минимальный срок аренды ячейки — один месяц. При оплате сразу за несколько месяцев предусмотрены скидки. Для более подробной информации звоните 8(911)810-83-83.',
    },
    {
      question: 'Что нельзя хранить в ячейках?',
      answer: 'Запрещено хранить: корма для животных, газовые баллоны, живых существ, опасные и скоропортящиеся товары, взрывчатые вещества, оружие, боеприпасы, наркотические, токсичные, радиоактивные, сильно пахнущие, ядовитые, горючие и легковоспламеняющиеся предметы, продовольственные товары и мусор.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 lg:pt-36">
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Частые <span className="text-gradient-primary">вопросы</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ответы на популярные вопросы об аренде кладовых ячеек
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:shadow-lg transition-shadow"
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* CTA */}
              <div className="mt-12 text-center p-8 bg-muted/30 rounded-2xl">
                <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Не нашли ответ?</h2>
                <p className="text-muted-foreground mb-6">
                  Свяжитесь с нами любым удобным способом
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contacts">
                    <Button>
                      Написать нам
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" asChild>
                    <a href="tel:+78121234567">
                      Позвонить
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
