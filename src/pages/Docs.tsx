import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FileText, Download, Shield, ClipboardList, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const documents = [
  {
    title: 'Договор аренды ячейки',
    description: 'Типовой договор аренды складской ячейки для физических и юридических лиц',
    icon: FileText,
    type: 'PDF',
  },
  {
    title: 'Акт приёма-передачи',
    description: 'Акт приёма-передачи ячейки при заключении и расторжении договора',
    icon: ClipboardList,
    type: 'PDF',
  },
  {
    title: 'Правила пользования складом',
    description: 'Правила поведения, режим работы и ограничения по хранению',
    icon: Scale,
    type: 'PDF',
  },
  {
    title: 'Политика конфиденциальности',
    description: 'Порядок обработки и защиты персональных данных клиентов',
    icon: Shield,
    type: 'PDF',
  },
];

const Docs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 lg:pt-36 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Документация</h1>
            <p className="text-muted-foreground mb-10">
              Типовые документы для аренды складских ячеек. Скачайте и ознакомьтесь заранее.
            </p>

            <div className="space-y-4">
              {documents.map((doc, i) => (
                <motion.div
                  key={doc.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <doc.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 shrink-0">
                    <Download className="w-4 h-4" />
                    {doc.type}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Docs;
