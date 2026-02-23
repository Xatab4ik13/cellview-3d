import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 lg:pt-36 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">Политика конфиденциальности</h1>

            <h2>1. Общие положения</h2>
            <p>Настоящая политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта «Кладовка78».</p>

            <h2>2. Сбор информации</h2>
            <p>Мы собираем информацию, которую вы предоставляете при заполнении форм на сайте: имя, номер телефона, адрес электронной почты.</p>

            <h2>3. Использование информации</h2>
            <p>Собранная информация используется для связи с вами, оформления договоров аренды и улучшения качества обслуживания.</p>

            <h2>4. Защита данных</h2>
            <p>Мы принимаем все необходимые меры для защиты ваших персональных данных от несанкционированного доступа, изменения или уничтожения.</p>

            <h2>5. Контакты</h2>
            <p>По вопросам обработки персональных данных обращайтесь по адресу: info@kladovka78.ru</p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
