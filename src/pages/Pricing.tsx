import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PriceCalculator from '@/components/PriceCalculator';

const Pricing = () => {

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 lg:pt-36">
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="heading-display mb-4">
                Тарифы и <span className="text-primary">цены</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                Выберите размер ячейки под ваши нужды. Все цены включают охрану и видеонаблюдение
              </p>
            </div>

            {/* Price Calculator */}
            <div className="max-w-5xl mx-auto mb-20">
              <PriceCalculator />
            </div>
            {/* Additional Info */}
            <div className="bg-secondary/50 rounded-2xl p-8 max-w-4xl mx-auto border-2 border-border">
              <h2 className="text-2xl font-bold mb-6 text-center">Дополнительные услуги</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                    <span className="font-medium">Установка полок</span>
                    <span className="font-bold text-primary">500 ₽/полка</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                    <span className="font-medium">Розетка в ячейке</span>
                    <span className="font-bold text-primary">+ 300 ₽/мес</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                    <span className="font-medium">Помощь с разгрузкой</span>
                    <span className="font-bold text-primary">от 1 000 ₽</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                    <span className="font-medium">Страхование вещей</span>
                    <span className="font-bold text-primary">от 200 ₽/мес</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                    <span className="font-medium">Упаковочные материалы</span>
                    <span className="font-bold text-primary">от 100 ₽</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                    <span className="font-medium">Выставление счета ЮЛ</span>
                    <span className="font-bold text-emerald-600">бесплатно</span>
                  </div>
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

export default Pricing;
