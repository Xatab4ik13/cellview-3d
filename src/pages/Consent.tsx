import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const Consent = () => {
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
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">Согласие на обработку данных</h1>

            <p>Отправляя свои данные через формы на сайте «Кладовка78», вы даёте согласие на обработку персональных данных в соответствии с Федеральным законом №152-ФЗ «О персональных данных».</p>

            <h2>Перечень данных</h2>
            <ul>
              <li>Фамилия, имя, отчество</li>
              <li>Номер телефона</li>
              <li>Адрес электронной почты</li>
              <li>Адрес проживания (при заключении договора)</li>
            </ul>

            <h2>Цели обработки</h2>
            <ul>
              <li>Связь с клиентом по заявке</li>
              <li>Оформление и исполнение договора аренды</li>
              <li>Информирование об акциях и изменениях условий</li>
            </ul>

            <h2>Отзыв согласия</h2>
            <p>Вы можете отозвать согласие, направив письменное заявление на info@kladovka78.ru. Обработка данных будет прекращена в течение 30 дней.</p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Consent;
