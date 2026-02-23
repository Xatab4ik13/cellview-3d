import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchCustomer, updateCustomer, type CustomerData } from '@/lib/api';

const ProfileSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  const [personalData, setPersonalData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    email: '',
    phone: '',
    telegram: '',
    passportSeries: '',
    passportNumber: '',
    passportIssued: '',
    passportDate: '',
  });

  const [companyData, setCompanyData] = useState({
    companyName: '',
    inn: '',
    kpp: '',
    ogrn: '',
    bankName: '',
    bik: '',
    checkingAccount: '',
    corrAccount: '',
    legalAddress: '',
  });

  // Load customer data from API
  useEffect(() => {
    const stored = localStorage.getItem('kladovka78_customer');
    if (!stored) return;

    const customer = JSON.parse(stored);
    setCustomerId(customer.id);

    fetchCustomer(customer.id)
      .then((data) => {
        const nameParts = (data.name || '').split(' ');
        setPersonalData({
          lastName: nameParts[0] || '',
          firstName: nameParts[1] || '',
          middleName: nameParts[2] || '',
          email: data.email || '',
          phone: data.phone || '',
          telegram: data.telegram || '',
          passportSeries: data.passportSeries || '',
          passportNumber: data.passportNumber || '',
          passportIssued: '',
          passportDate: '',
        });
        if (data.type === 'company') {
          setCompanyData(prev => ({
            ...prev,
            companyName: data.companyName || '',
            inn: data.inn || '',
            ogrn: data.ogrn || '',
          }));
        }
      })
      .catch(() => {
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить данные профиля',
          variant: 'destructive',
        });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSave = async () => {
    if (!customerId) return;
    setIsSaving(true);

    try {
      const name = [personalData.lastName, personalData.firstName, personalData.middleName]
        .filter(Boolean)
        .join(' ');

      await updateCustomer(customerId, {
        name,
        email: personalData.email || undefined,
        telegram: personalData.telegram || undefined,
        passportSeries: personalData.passportSeries || undefined,
        passportNumber: personalData.passportNumber || undefined,
        companyName: companyData.companyName || undefined,
        inn: companyData.inn || undefined,
        ogrn: companyData.ogrn || undefined,
      });

      // Update localStorage
      const stored = localStorage.getItem('kladovka78_customer');
      if (stored) {
        const customer = JSON.parse(stored);
        customer.name = name;
        customer.email = personalData.email;
        customer.telegram = personalData.telegram;
        localStorage.setItem('kladovka78_customer', JSON.stringify(customer));
      }

      toast({
        title: 'Данные сохранены',
        description: 'Ваш профиль успешно обновлен',
      });
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить данные',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 p-1.5 bg-secondary rounded-xl border border-border">
          <TabsTrigger value="personal" className="gap-2 rounded-lg font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
            <User className="w-4 h-4" />
            Физ. лицо
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2 rounded-lg font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
            <Building2 className="w-4 h-4" />
            Юр. лицо
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg border-b border-border/50">
              <CardTitle className="text-xl font-bold">Личные данные</CardTitle>
              <CardDescription>
                Заполните информацию для заключения договора аренды
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ФИО */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input id="lastName" value={personalData.lastName} onChange={(e) => setPersonalData({ ...personalData, lastName: e.target.value })} placeholder="Иванов" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя *</Label>
                  <Input id="firstName" value={personalData.firstName} onChange={(e) => setPersonalData({ ...personalData, firstName: e.target.value })} placeholder="Иван" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Отчество</Label>
                  <Input id="middleName" value={personalData.middleName} onChange={(e) => setPersonalData({ ...personalData, middleName: e.target.value })} placeholder="Иванович" />
                </div>
              </div>

              {/* Контакты */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={personalData.email} onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })} placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input id="phone" type="tel" value={personalData.phone} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Привязан через Telegram</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input id="telegram" value={personalData.telegram} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Привязан через бота</p>
                </div>
              </div>

              {/* Паспорт */}
              <div className="border-t border-border/50 pt-6">
                <h4 className="font-semibold text-lg mb-4">Паспортные данные</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passportSeries">Серия</Label>
                    <Input id="passportSeries" value={personalData.passportSeries} onChange={(e) => setPersonalData({ ...personalData, passportSeries: e.target.value })} placeholder="0000" maxLength={4} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportNumber">Номер</Label>
                    <Input id="passportNumber" value={personalData.passportNumber} onChange={(e) => setPersonalData({ ...personalData, passportNumber: e.target.value })} placeholder="000000" maxLength={6} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportDate">Дата выдачи</Label>
                    <Input id="passportDate" type="date" value={personalData.passportDate} onChange={(e) => setPersonalData({ ...personalData, passportDate: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-1">
                    <Label htmlFor="passportIssued">Кем выдан</Label>
                    <Input id="passportIssued" value={personalData.passportIssued} onChange={(e) => setPersonalData({ ...personalData, passportIssued: e.target.value })} placeholder="ГУ МВД..." />
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-primary hover:bg-primary/90 shadow-primary font-semibold">
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Сохранение...</> : <><Save className="w-4 h-4" /> Сохранить изменения</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg border-b border-border/50">
              <CardTitle className="text-xl font-bold">Данные организации</CardTitle>
              <CardDescription>Реквизиты для заключения договора с юридическим лицом</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyName">Наименование организации</Label>
                  <Input id="companyName" value={companyData.companyName} onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })} placeholder='ООО "Компания"' />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inn">ИНН</Label>
                  <Input id="inn" value={companyData.inn} onChange={(e) => setCompanyData({ ...companyData, inn: e.target.value })} placeholder="0000000000" maxLength={12} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kpp">КПП</Label>
                  <Input id="kpp" value={companyData.kpp} onChange={(e) => setCompanyData({ ...companyData, kpp: e.target.value })} placeholder="000000000" maxLength={9} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogrn">ОГРН</Label>
                  <Input id="ogrn" value={companyData.ogrn} onChange={(e) => setCompanyData({ ...companyData, ogrn: e.target.value })} placeholder="0000000000000" maxLength={15} />
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <h4 className="font-semibold text-lg mb-4">Банковские реквизиты</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bankName">Наименование банка</Label>
                    <Input id="bankName" value={companyData.bankName} onChange={(e) => setCompanyData({ ...companyData, bankName: e.target.value })} placeholder="ПАО Сбербанк" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bik">БИК</Label>
                    <Input id="bik" value={companyData.bik} onChange={(e) => setCompanyData({ ...companyData, bik: e.target.value })} placeholder="000000000" maxLength={9} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkingAccount">Расчетный счет</Label>
                    <Input id="checkingAccount" value={companyData.checkingAccount} onChange={(e) => setCompanyData({ ...companyData, checkingAccount: e.target.value })} placeholder="00000000000000000000" maxLength={20} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="corrAccount">Корр. счет</Label>
                    <Input id="corrAccount" value={companyData.corrAccount} onChange={(e) => setCompanyData({ ...companyData, corrAccount: e.target.value })} placeholder="00000000000000000000" maxLength={20} />
                  </div>
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="legalAddress">Юридический адрес</Label>
                  <Input id="legalAddress" value={companyData.legalAddress} onChange={(e) => setCompanyData({ ...companyData, legalAddress: e.target.value })} placeholder="г. Санкт-Петербург, ул. ..." />
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-primary hover:bg-primary/90 shadow-primary font-semibold">
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Сохранение...</> : <><Save className="w-4 h-4" /> Сохранить изменения</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSection;
