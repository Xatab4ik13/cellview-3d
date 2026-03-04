import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, MessageCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PaymentFail = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-40 pb-20 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-destructive">Оплата не прошла</h2>
            <p className="text-muted-foreground">
              Платёж был отклонён или отменён. Средства не были списаны.
            </p>
            <div className="space-y-3 pt-4">
              <Button asChild className="w-full">
                <Link to="/catalog">Выбрать ячейку</Link>
              </Button>
              <a
                href="https://t.me/kladovka78_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <MessageCircle className="w-4 h-4" />
                Связаться с поддержкой
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentFail;
