import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Building2, 
  Pencil, 
  Check, 
  ShieldCheck, 
  AlertTriangle,
  Info,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { organizationService, Organization, OrganizationUpdateData, VerificationRecommendations, UserMessage } from '@utils/api';
import { useDaData } from '@hooks/useDaData';
import AutocompleteInput from '@components/shared/AutocompleteInput';
import VerificationRecommendationsComponent from '@components/dashboard/VerificationRecommendations';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const OrganizationPage = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [recommendations, setRecommendations] = useState<VerificationRecommendations | null>(null);
  const [userMessage, setUserMessage] = useState<UserMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState<OrganizationUpdateData>({});
  const [recommendationsKey, setRecommendationsKey] = useState(0);

  const { searchAddresses } = useDaData();

  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const response = await organizationService.getCurrent();
      if (response.success) {
        setOrganization(response.data.organization);
        setRecommendations(response.data.recommendations);
        setUserMessage(response.data.user_message);
        setFormData({
          name: response.data.organization.name || '',
          legal_name: response.data.organization.legal_name || '',
          tax_number: response.data.organization.tax_number || '',
          registration_number: response.data.organization.registration_number || '',
          phone: response.data.organization.phone || '',
          email: response.data.organization.email || '',
          address: response.data.organization.address || '',
          city: response.data.organization.city || '',
          postal_code: response.data.organization.postal_code || '',
          country: response.data.organization.country || 'Россия',
          description: response.data.organization.description || '',
        });
      }
    } catch (error) {
      toast.error('Не удалось загрузить данные организации');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await organizationService.update(formData);
      if (response.success) {
        setOrganization(response.data.organization);
        setRecommendations(response.data.recommendations);
        setUserMessage(response.data.user_message);
        setIsEditing(false);
        setRecommendationsKey(prev => prev + 1);
        toast.success('Данные организации обновлены');
      }
    } catch (error) {
      toast.error('Не удалось сохранить изменения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerification = async () => {
    try {
      setIsVerifying(true);
      const response = await organizationService.requestVerification();
      if (response.success && response.data.organization) {
        toast.success('Верификация выполнена успешно');
        await loadOrganization();
        setTimeout(() => {
          setRecommendationsKey(prev => prev + 1);
        }, 500);
      }
    } catch (error) {
      toast.error('Не удалось выполнить верификацию');
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusVariant = (status: string) => {
    if (recommendations && recommendations.current_score === recommendations.max_score) {
      return 'default'; // verified (greenish usually in our theme or construct)
    }
    
    switch (status) {
      case 'verified':
        return 'default';
      case 'partially_verified':
        return 'secondary'; // yellow? shadcn secondary is gray usually, maybe create custom variant or use className
      case 'needs_review':
        return 'destructive';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (statusText: string) => {
    if (recommendations && recommendations.current_score === recommendations.max_score) {
      return 'Полностью верифицирована';
    }
    return statusText;
  };

  const handleAddressSearch = async (query: string) => {
    const results = await searchAddresses(query);
    return results.map(item => ({
      value: item.value,
      label: item.value
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
         <Skeleton className="h-24 w-full rounded-xl" />
         <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!organization || !recommendations) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="mx-auto h-12 w-12 opacity-20 mb-4" />
        <p>Данные организации не найдены</p>
      </div>
    );
  }

  const isFullyVerified = recommendations.current_score === recommendations.max_score;
  const shouldShowUserMessage = userMessage && !(isFullyVerified && userMessage.action === 'verify');

  return (
    <div className="space-y-6">
      {shouldShowUserMessage && (
        <Alert variant={userMessage.type === 'error' ? 'destructive' : 'default'} className={
            userMessage.type === 'success' ? "border-green-500 text-green-700 bg-green-50" : 
            userMessage.type === 'warning' ? "border-yellow-500 text-yellow-700 bg-yellow-50" : ""
        }>
          {userMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : 
           userMessage.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
           userMessage.type === 'error' ? <AlertTriangle className="h-4 w-4" /> :
           <Info className="h-4 w-4" />
          }
          <AlertTitle className="ml-2">{userMessage.title}</AlertTitle>
          <AlertDescription className="ml-2">
            {userMessage.message}
            {userMessage.action === 'verify' && (
                <div className="mt-3">
                    <Button size="sm" onClick={handleVerification} disabled={isVerifying}>
                        {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Запустить верификацию
                    </Button>
                </div>
            )}
            {userMessage.action === 'edit' && (
                <div className="mt-3">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Редактировать данные
                    </Button>
                </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Организация</CardTitle>
                <CardDescription>Управление данными и верификация</CardDescription>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Статус:</span>
                    <Badge variant={getStatusVariant(recommendations.status)}>
                        {getStatusLabel(recommendations.status_text)}
                    </Badge>
                </div>
                <div className="flex items-center gap-2 w-full max-w-[200px]">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Рейтинг:</span>
                    <div className="flex-1 flex items-center gap-2">
                        <Progress value={recommendations.current_score} max={recommendations.max_score} className="h-2" />
                        <span className="text-xs font-medium">{recommendations.current_score}/{recommendations.max_score}</span>
                    </div>
                </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
            <div className="flex justify-end mb-4">
                 {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Редактировать
                    </Button>
                )}
            </div>

          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Название организации</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Юридическое наименование</Label>
                  <Input
                    value={formData.legal_name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, legal_name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>ИНН</Label>
                  <Input
                    value={formData.tax_number || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_number: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>ОГРН</Label>
                  <Input
                    value={formData.registration_number || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Телефон</Label>
                  <Input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Адрес</Label>
                  <AutocompleteInput
                    value={formData.address || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                    onSearch={handleAddressSearch}
                    placeholder="Введите адрес организации"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Город</Label>
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Почтовый индекс</Label>
                  <Input
                    value={formData.postal_code || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Описание деятельности</Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="ghost" type="button" onClick={() => setIsEditing(false)}>
                  Отменить
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Сохранить
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-1">
                <Label className="text-muted-foreground font-normal">Название</Label>
                <div className="font-medium">{organization.name || '—'}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground font-normal">Юридическое наименование</Label>
                <div className="font-medium">{organization.legal_name || '—'}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground font-normal">ИНН</Label>
                <div className="font-medium">{organization.tax_number || '—'}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground font-normal">ОГРН</Label>
                <div className="font-medium">{organization.registration_number || '—'}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground font-normal">Телефон</Label>
                <div className="font-medium">{organization.phone || '—'}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground font-normal">Email</Label>
                <div className="font-medium">{organization.email || '—'}</div>
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-muted-foreground font-normal">Адрес</Label>
                <div className="font-medium">{organization.address || '—'}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground font-normal">Город</Label>
                <div className="font-medium">{organization.city || '—'}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground font-normal">Индекс</Label>
                <div className="font-medium">{organization.postal_code || '—'}</div>
              </div>
              {organization.description && (
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-muted-foreground font-normal">Описание</Label>
                  <div className="font-medium">{organization.description}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <VerificationRecommendationsComponent 
        organizationId={organization.id}
        onRecommendationsLoad={() => {}}
        onVerificationRequest={handleVerification}
        isVerifying={isVerifying}
        refreshTrigger={recommendationsKey}
      />
    </div>
  );
};

export default OrganizationPage;
