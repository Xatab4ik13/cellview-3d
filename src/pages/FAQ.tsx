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
      question: 'Как арендовать ячейку?',
      answer: 'Выберите подходящую ячейку в нашем 3D-каталоге, укажите период аренды и оплатите онлайн. После оплаты вы получите код доступа в личный кабинет и на email.',
    },
    {
      question: 'Какой минимальный срок аренды?',
      answer: 'Минимальный срок аренды — 1 день. Также доступна аренда на неделю или месяц. При месячной аренде можно оформить автопродление.',
    },
    {
      question: 'Как я попаду в помещение?',
      answer: 'Доступ в помещение осуществляется по звонку на специальный номер с вашего зарегистрированного телефона. Система автоматически распознает ваш номер и откроет дверь.',
    },
    {
      question: 'Что можно хранить в ячейках?',
      answer: 'В ячейках можно хранить личные вещи, мебель, бытовую технику, сезонные товары, архивы документов, спортивный инвентарь и товары для бизнеса. Запрещено хранение опасных, скоропортящихся и незаконных предметов.',
    },
    {
      question: 'Есть ли видеонаблюдение?',
      answer: 'Да, все ячейки находятся под круглосуточным видеонаблюдением. В личном кабинете вы можете смотреть видео с камер, направленных на вашу ячейку.',
    },
    {
      question: 'Можно ли приехать в любое время?',
      answer: 'Да, доступ к ячейкам круглосуточный, 7 дней в неделю, 365 дней в году. Вы можете забрать или положить вещи в любое удобное время.',
    },
    {
      question: 'Как оплатить аренду?',
      answer: 'Мы принимаем оплату банковскими картами онлайн, а также выставляем счета для юридических лиц. Доступна оплата частями и автопродление подписки.',
    },
    {
      question: 'Что будет при просрочке оплаты?',
      answer: 'За 24 часа до окончания аренды вы получите напоминание. При просрочке в течение 3 дней отправляются ежедневные уведомления. После этого доступ к ячейке временно блокируется до оплаты.',
    },
    {
      question: 'Можно ли досрочно расторгнуть договор?',
      answer: 'Да, вы можете завершить аренду досрочно в любой момент через личный кабинет. Неиспользованные дни не возвращаются.',
    },
    {
      question: 'Есть ли розетки в ячейках?',
      answer: 'В некоторых ячейках есть розетки — это указано в описании каждой ячейки. Если розетка нужна, выберите ячейку с соответствующей опцией при бронировании.',
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
