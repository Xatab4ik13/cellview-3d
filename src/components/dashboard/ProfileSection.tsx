import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { User, Building2, Save, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchCustomer, updateCustomer, type CustomerData } from '@/lib/api';

export interface ProfileCompleteness {
  isComplete: boolean;
  missingFields: string[];
}

/** Check if individual profile is fully filled */
function checkIndividualCompleteness(data: {
  lastName: string;
  firstName: string;
  email: string;
  passportSeries: string;
  passportNumber: string;
  passportDate: string;
  passportIssued: string;
  passportCode: string;
  birthDate: string;
  birthPlace: string;
  registrationAddress: string;
}): ProfileCompleteness {
  const missing: string[] = [];
  if (!data.lastName.trim()) missing.push('Фамилия');
  if (!data.firstName.trim()) missing.push('Имя');
  if (!data.email.trim()) missing.push('Email');
  if (!data.passportSeries.trim()) missing.push('Серия паспорта');
  if (!data.passportNumber.trim()) missing.push('Номер паспорта');
  if (!data.passportDate.trim()) missing.push('Дата выдачи паспорта');
  if (!data.passportIssued.trim()) missing.push('Кем выдан паспорт');
  if (!data.passportCode.trim()) missing.push('Код подразделения');
  if (!data.birthDate.trim()) missing.push('Дата рождения');
  if (!data.birthPlace.trim()) missing.push('Место рождения');
  if (!data.registrationAddress.trim()) missing.push('Адрес прописки');
  return { isComplete: missing.length === 0, missingFields: missing };
}

/** Check if company profile is fully filled */
function checkCompanyCompleteness(data: {
  companyName: string;
  inn: string;
  kpp: string;
  ogrn: string;
  bankName: string;
  bik: string;
  checkingAccount: string;
  corrAccount: string;
  legalAddress: string;
  contactPersonName: string;
  contactPersonEmail: string;
}): ProfileCompleteness {
  const missing: string[] = [];
  if (!data.companyName.trim()) missing.push('Наименование организации');
  if (!data.inn.trim()) missing.push('ИНН');
  if (!data.kpp.trim()) missing.push('КПП');
  if (!data.ogrn.trim()) missing.push('ОГРН');
  if (!data.bankName.trim()) missing.push('Банк');
  if (!data.bik.trim()) missing.push('БИК');
  if (!data.checkingAccount.trim()) missing.push('Расчетный счет');
  if (!data.corrAccount.trim()) missing.push('Корр. счет');
  if (!data.legalAddress.trim()) missing.push('Юридический адрес');
  if (!data.contactPersonName.trim()) missing.push('ФИО контактного лица');
  if (!data.contactPersonEmail.trim()) missing.push('Email контактного лица');
  return { isComplete: missing.length === 0, missingFields: missing };
}

const ProfileSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');

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
    passportCode: '',
    birthDate: '',
    birthPlace: '',
    registrationAddress: '',
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
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
  });

  // Load customer data from API
  useEffect(() => {
    const stored = localStorage.getItem('kladovka78_customer');
    if (!stored) return;

    const customer = JSON.parse(stored);
    setCustomerId(customer.id);

    fetchCustomer(customer.id)
      .then((data: any) => {
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
          passportIssued: data.passportIssued || '',
          passportDate: data.passportDate || '',
          passportCode: data.passportCode || '',
          birthDate: data.birthDate || '',
          birthPlace: data.birthPlace || '',
          registrationAddress: data.registrationAddress || '',
        });
        if (data.type === 'company') {
          setActiveTab('company');
          setCompanyData(prev => ({
            ...prev,
            companyName: data.companyName || '',
            inn: data.inn || '',
            kpp: data.kpp || '',
            ogrn: data.ogrn || '',
            bankName: data.bankName || '',
            bik: data.bik || '',
            checkingAccount: data.checkingAccount || '',
            corrAccount: data.corrAccount || '',
            legalAddress: data.legalAddress || '',
            contactPersonName: data.contactPerson || '',
            contactPersonEmail: data.contactPersonEmail || '',
            contactPersonPhone: data.contactPersonPhone || '',
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

  const individualCheck = checkIndividualCompleteness(personalData);
  const companyCheck = checkCompanyCompleteness(companyData);
  const currentCheck = activeTab === 'personal' ? individualCheck : companyCheck;

  const handleSave = async () => {
    if (!customerId) return;

    // Validate current tab
    if (!currentCheck.isComplete) {
      toast({
        title: 'Заполните все обязательные поля',
        description: `Не заполнено: ${currentCheck.missingFields.slice(0, 3).join(', ')}${currentCheck.missingFields.length > 3 ? ` и ещё ${currentCheck.missingFields.length - 3}` : ''}`,
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (activeTab === 'personal') {
        const name = [personalData.lastName, personalData.firstName, personalData.middleName]
          .filter(Boolean)
          .join(' ');

        await updateCustomer(customerId, {
          name,
          email: personalData.email,
          telegram: personalData.telegram || undefined,
          passportSeries: personalData.passportSeries,
          passportNumber: personalData.passportNumber,
          passportIssued: personalData.passportIssued,
          passportDate: personalData.passportDate,
          passportCode: personalData.passportCode,
          birthDate: personalData.birthDate,
          birthPlace: personalData.birthPlace,
          registrationAddress: personalData.registrationAddress,
          type: 'individual',
        } as any);
      } else {
        await updateCustomer(customerId, {
          companyName: companyData.companyName,
          inn: companyData.inn,
          kpp: companyData.kpp,
          ogrn: companyData.ogrn,
          bankName: companyData.bankName,
          bik: companyData.bik,
          checkingAccount: companyData.checkingAccount,
          corrAccount: companyData.corrAccount,
          legalAddress: companyData.legalAddress,
          contactPerson: companyData.contactPersonName,
          contactPersonEmail: companyData.contactPersonEmail,
          contactPersonPhone: companyData.contactPersonPhone,
          email: companyData.contactPersonEmail,
          type: 'company',
        } as any);
      }

      // Update localStorage
      const stored = localStorage.getItem('kladovka78_customer');
      if (stored) {
        const customer = JSON.parse(stored);
        if (activeTab === 'personal') {
          customer.name = [personalData.lastName, personalData.firstName, personalData.middleName].filter(Boolean).join(' ');
          customer.email = personalData.email;
        } else {
          customer.email = companyData.contactPersonEmail;
        }
        localStorage.setItem('kladovka78_customer', JSON.stringify(customer));
      }

      toast({
        title: 'Данные сохранены',
        description: 'Ваш профиль успешно обновлен',
      });
    } catch (err: any) {
      console.error('Profile save error:', err);
      toast({
        title: 'Ошибка',
        description: err?.message || 'Не удалось сохранить данные',
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
      {/* Completeness banner */}
      {!currentCheck.isComplete && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-300/50 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Профиль не заполнен полностью</p>
            <p className="text-sm text-muted-foreground mt-1">
              Для оплаты аренды необходимо заполнить все обязательные поля. 
              Не заполнено: {currentCheck.missingFields.join(', ')}.
            </p>
          </div>
        </div>
      )}
      {currentCheck.isComplete && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-300/50 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">Профиль заполнен — оплата доступна</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                Заполните все поля для заключения договора аренды. Поля отмеченные * обязательны.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
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
                  <Label htmlFor="email">Email *</Label>
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

              {/* Дата и место рождения */}
              <div className="border-t border-border/50 pt-6">
                <h4 className="font-semibold text-lg mb-4">Дата и место рождения</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Дата рождения *</Label>
                    <Input id="birthDate" type="date" value={personalData.birthDate} onChange={(e) => setPersonalData({ ...personalData, birthDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthPlace">Место рождения *</Label>
                    <Input id="birthPlace" value={personalData.birthPlace} onChange={(e) => setPersonalData({ ...personalData, birthPlace: e.target.value })} placeholder="г. Санкт-Петербург" />
                  </div>
                </div>
              </div>

              {/* Паспорт */}
              <div className="border-t border-border/50 pt-6">
                <h4 className="font-semibold text-lg mb-4">Паспортные данные</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passportSeries">Серия *</Label>
                    <Input id="passportSeries" value={personalData.passportSeries} onChange={(e) => setPersonalData({ ...personalData, passportSeries: e.target.value })} placeholder="0000" maxLength={4} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportNumber">Номер *</Label>
                    <Input id="passportNumber" value={personalData.passportNumber} onChange={(e) => setPersonalData({ ...personalData, passportNumber: e.target.value })} placeholder="000000" maxLength={6} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportDate">Дата выдачи *</Label>
                    <Input id="passportDate" type="date" value={personalData.passportDate} onChange={(e) => setPersonalData({ ...personalData, passportDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportCode">Код подразделения *</Label>
                    <Input id="passportCode" value={personalData.passportCode} onChange={(e) => setPersonalData({ ...personalData, passportCode: e.target.value })} placeholder="000-000" maxLength={7} />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="passportIssued">Кем выдан *</Label>
                  <Input id="passportIssued" value={personalData.passportIssued} onChange={(e) => setPersonalData({ ...personalData, passportIssued: e.target.value })} placeholder="ГУ МВД России по г. Санкт-Петербургу и Ленинградской области" />
                </div>
              </div>

              {/* Адрес регистрации (прописка) */}
              <div className="border-t border-border/50 pt-6">
                <h4 className="font-semibold text-lg mb-4">Адрес регистрации (прописка)</h4>
                <div className="space-y-2">
                  <Label htmlFor="registrationAddress">Полный адрес прописки *</Label>
                  <Textarea
                    id="registrationAddress"
                    value={personalData.registrationAddress}
                    onChange={(e) => setPersonalData({ ...personalData, registrationAddress: e.target.value })}
                    placeholder="г. Санкт-Петербург, ул. Примерная, д. 1, кв. 1"
                    rows={2}
                  />
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
              <CardDescription>Реквизиты для заключения договора с юридическим лицом. Все поля обязательны.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyName">Наименование организации *</Label>
                  <Input id="companyName" value={companyData.companyName} onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })} placeholder='ООО "Компания"' />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inn">ИНН *</Label>
                  <Input id="inn" value={companyData.inn} onChange={(e) => setCompanyData({ ...companyData, inn: e.target.value })} placeholder="0000000000" maxLength={12} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kpp">КПП *</Label>
                  <Input id="kpp" value={companyData.kpp} onChange={(e) => setCompanyData({ ...companyData, kpp: e.target.value })} placeholder="000000000" maxLength={9} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogrn">ОГРН *</Label>
                  <Input id="ogrn" value={companyData.ogrn} onChange={(e) => setCompanyData({ ...companyData, ogrn: e.target.value })} placeholder="0000000000000" maxLength={15} />
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <h4 className="font-semibold text-lg mb-4">Банковские реквизиты</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bankName">Наименование банка *</Label>
                    <Input id="bankName" value={companyData.bankName} onChange={(e) => setCompanyData({ ...companyData, bankName: e.target.value })} placeholder="ПАО Сбербанк" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bik">БИК *</Label>
                    <Input id="bik" value={companyData.bik} onChange={(e) => setCompanyData({ ...companyData, bik: e.target.value })} placeholder="000000000" maxLength={9} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkingAccount">Расчетный счет *</Label>
                    <Input id="checkingAccount" value={companyData.checkingAccount} onChange={(e) => setCompanyData({ ...companyData, checkingAccount: e.target.value })} placeholder="00000000000000000000" maxLength={20} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="corrAccount">Корр. счет *</Label>
                    <Input id="corrAccount" value={companyData.corrAccount} onChange={(e) => setCompanyData({ ...companyData, corrAccount: e.target.value })} placeholder="00000000000000000000" maxLength={20} />
                  </div>
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="legalAddress">Юридический адрес *</Label>
                  <Textarea id="legalAddress" value={companyData.legalAddress} onChange={(e) => setCompanyData({ ...companyData, legalAddress: e.target.value })} placeholder="г. Санкт-Петербург, ул. ..." rows={2} />
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <h4 className="font-semibold text-lg mb-4">Контактное лицо</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPersonName">ФИО *</Label>
                    <Input id="contactPersonName" value={companyData.contactPersonName} onChange={(e) => setCompanyData({ ...companyData, contactPersonName: e.target.value })} placeholder="Иванов Иван Иванович" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPersonEmail">Email *</Label>
                    <Input id="contactPersonEmail" type="email" value={companyData.contactPersonEmail} onChange={(e) => setCompanyData({ ...companyData, contactPersonEmail: e.target.value })} placeholder="email@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPersonPhone">Телефон</Label>
                    <Input id="contactPersonPhone" type="tel" value={companyData.contactPersonPhone} onChange={(e) => setCompanyData({ ...companyData, contactPersonPhone: e.target.value })} placeholder="+7 (999) 000-00-00" />
                  </div>
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
