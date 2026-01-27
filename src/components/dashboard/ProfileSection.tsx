import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, Save, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProfileSection = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [personalData, setPersonalData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    email: '',
    phone: '+7 (999) 123-45-67',
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

  const handleSave = async () => {
    setIsSaving(true);
    // Mock save
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem('profileData', JSON.stringify({ personalData, companyData }));
    setIsSaving(false);
    toast({
      title: "Данные сохранены",
      description: "Ваш профиль успешно обновлен",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="personal" className="gap-2">
            <User className="w-4 h-4" />
            Физ. лицо
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="w-4 h-4" />
            Юр. лицо
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Личные данные</CardTitle>
              <CardDescription>
                Заполните информацию для заключения договора аренды
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ФИО */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input
                    id="lastName"
                    value={personalData.lastName}
                    onChange={(e) => setPersonalData({ ...personalData, lastName: e.target.value })}
                    placeholder="Иванов"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя *</Label>
                  <Input
                    id="firstName"
                    value={personalData.firstName}
                    onChange={(e) => setPersonalData({ ...personalData, firstName: e.target.value })}
                    placeholder="Иван"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Отчество</Label>
                  <Input
                    id="middleName"
                    value={personalData.middleName}
                    onChange={(e) => setPersonalData({ ...personalData, middleName: e.target.value })}
                    placeholder="Иванович"
                  />
                </div>
              </div>

              {/* Контакты */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalData.email}
                    onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={personalData.phone}
                    onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    value={personalData.telegram}
                    onChange={(e) => setPersonalData({ ...personalData, telegram: e.target.value })}
                    placeholder="@username"
                  />
                </div>
              </div>

              {/* Паспорт */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Паспортные данные</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passportSeries">Серия *</Label>
                    <Input
                      id="passportSeries"
                      value={personalData.passportSeries}
                      onChange={(e) => setPersonalData({ ...personalData, passportSeries: e.target.value })}
                      placeholder="0000"
                      maxLength={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportNumber">Номер *</Label>
                    <Input
                      id="passportNumber"
                      value={personalData.passportNumber}
                      onChange={(e) => setPersonalData({ ...personalData, passportNumber: e.target.value })}
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportDate">Дата выдачи *</Label>
                    <Input
                      id="passportDate"
                      type="date"
                      value={personalData.passportDate}
                      onChange={(e) => setPersonalData({ ...personalData, passportDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-1">
                    <Label htmlFor="passportIssued">Кем выдан *</Label>
                    <Input
                      id="passportIssued"
                      value={personalData.passportIssued}
                      onChange={(e) => setPersonalData({ ...personalData, passportIssued: e.target.value })}
                      placeholder="ГУ МВД..."
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <>Сохранение...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Сохранить изменения
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Данные организации</CardTitle>
              <CardDescription>
                Реквизиты для заключения договора с юридическим лицом
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Основные данные */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyName">Наименование организации *</Label>
                  <Input
                    id="companyName"
                    value={companyData.companyName}
                    onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                    placeholder='ООО "Компания"'
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inn">ИНН *</Label>
                  <Input
                    id="inn"
                    value={companyData.inn}
                    onChange={(e) => setCompanyData({ ...companyData, inn: e.target.value })}
                    placeholder="0000000000"
                    maxLength={12}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kpp">КПП</Label>
                  <Input
                    id="kpp"
                    value={companyData.kpp}
                    onChange={(e) => setCompanyData({ ...companyData, kpp: e.target.value })}
                    placeholder="000000000"
                    maxLength={9}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogrn">ОГРН</Label>
                  <Input
                    id="ogrn"
                    value={companyData.ogrn}
                    onChange={(e) => setCompanyData({ ...companyData, ogrn: e.target.value })}
                    placeholder="0000000000000"
                    maxLength={15}
                  />
                </div>
              </div>

              {/* Банковские реквизиты */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Банковские реквизиты</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bankName">Наименование банка *</Label>
                    <Input
                      id="bankName"
                      value={companyData.bankName}
                      onChange={(e) => setCompanyData({ ...companyData, bankName: e.target.value })}
                      placeholder="ПАО Сбербанк"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bik">БИК *</Label>
                    <Input
                      id="bik"
                      value={companyData.bik}
                      onChange={(e) => setCompanyData({ ...companyData, bik: e.target.value })}
                      placeholder="000000000"
                      maxLength={9}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkingAccount">Расчетный счет *</Label>
                    <Input
                      id="checkingAccount"
                      value={companyData.checkingAccount}
                      onChange={(e) => setCompanyData({ ...companyData, checkingAccount: e.target.value })}
                      placeholder="00000000000000000000"
                      maxLength={20}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="corrAccount">Корр. счет</Label>
                    <Input
                      id="corrAccount"
                      value={companyData.corrAccount}
                      onChange={(e) => setCompanyData({ ...companyData, corrAccount: e.target.value })}
                      placeholder="00000000000000000000"
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>

              {/* Адрес */}
              <div className="border-t pt-6">
                <div className="space-y-2">
                  <Label htmlFor="legalAddress">Юридический адрес *</Label>
                  <Input
                    id="legalAddress"
                    value={companyData.legalAddress}
                    onChange={(e) => setCompanyData({ ...companyData, legalAddress: e.target.value })}
                    placeholder="г. Санкт-Петербург, ул. ..."
                  />
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <>Сохранение...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Сохранить изменения
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSection;
