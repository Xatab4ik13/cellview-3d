import Header from '@/components/Header';
import Hero from '@/components/Hero';
import LocationSection from '@/components/LocationSection';
import CatalogSection from '@/components/CatalogSection';
import FeaturesSection from '@/components/FeaturesSection';
import PricingSection from '@/components/PricingSection';
import ContactsSection from '@/components/ContactsSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <LocationSection />
        <CatalogSection />
        <FeaturesSection />
        <PricingSection />
        <ContactsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
