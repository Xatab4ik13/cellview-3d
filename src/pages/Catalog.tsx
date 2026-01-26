import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogSection from '@/components/CatalogSection';

const Catalog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 lg:pt-36">
        <CatalogSection />
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;
