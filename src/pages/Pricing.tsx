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
            <div className="max-w-5xl mx-auto">
              <PriceCalculator />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
