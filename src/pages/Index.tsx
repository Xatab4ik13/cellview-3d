import Header from '@/components/Header';
import Hero from '@/components/Hero';
import LocationSection from '@/components/LocationSection';
import CatalogPreview from '@/components/CatalogPreview';
import FeaturesSection from '@/components/FeaturesSection';
import ContactsSection from '@/components/ContactsSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <LocationSection />
        <CatalogPreview />
        <FeaturesSection />
        <ContactsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
