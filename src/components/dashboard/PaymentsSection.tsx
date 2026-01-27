import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Receipt, CreditCard } from 'lucide-react';

// Mock payment history
const mockPayments = [
  {
    id: 1,
    date: '2025-01-15',
    description: 'Оплата аренды ячейки A-12',
    amount: 4500,
    status: 'success',
    type: 'subscription',
    invoiceUrl: '#',
    receiptUrl: '#',
  },
  {
    id: 2,
    date: '2024-12-15',
    description: 'Оплата аренды ячейки A-12',
    amount: 4500,
    status: 'success',
    type: 'subscription',
    invoiceUrl: '#',
    receiptUrl: '#',
  },
  {
    id: 3,
    date: '2024-11-15',
    description: 'Первоначальная оплата + залог',
    amount: 9000,
    status: 'success',
    type: 'initial',
    invoiceUrl: '#',
    receiptUrl: '#',
  },
];

const PaymentsSection = () => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Оплачено</Badge>;
      case 'pending':
        return <Badge variant="secondary">Ожидает</Badge>;
      case 'failed':
        return <Badge variant="destructive">Ошибка</Badge>;
      default:
        return null;
    }
  };

  const totalPaid = mockPayments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Всего оплачено</p>
                <p className="text-2xl font-bold">{totalPaid.toLocaleString()} ₽</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Платежей</p>
                <p className="text-2xl font-bold">{mockPayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Следующий платеж</p>
                <p className="text-2xl font-bold">15 фев</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle>История платежей</CardTitle>
          <CardDescription>
            Все транзакции по вашим арендам
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Документы</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {formatDate(payment.date)}
                    </TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell className="font-semibold">
                      {payment.amount.toLocaleString()} ₽
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Download className="w-4 h-4" />
                          Счет
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Download className="w-4 h-4" />
                          Чек
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {mockPayments.map((payment) => (
              <div key={payment.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(payment.date)}</p>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-lg font-bold">{payment.amount.toLocaleString()} ₽</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="w-4 h-4" />
                      Счет
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="w-4 h-4" />
                      Чек
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsSection;
