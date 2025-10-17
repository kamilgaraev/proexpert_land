# Frontend Integration Guide: Personal Cabinet (ЛК)
## Project-Based RBAC System

**Версия:** 1.0  
**Дата:** 17.10.2025  
**Статус:** Production Ready

---

## 📋 Содержание

1. [Обзор системы](#обзор-системы)
2. [Архитектура ЛК](#архитектура-лк)
3. [API Endpoints](#api-endpoints)
4. [Структуры данных](#структуры-данных)
5. [UI/UX Flows](#uiux-flows)
6. [Компоненты](#компоненты)
7. [State Management](#state-management)
8. [Примеры кода](#примеры-кода)
9. [Best Practices](#best-practices)

---

## 🎯 Обзор системы

### Что изменилось?

Система Project-Based RBAC вводит новый уровень управления:
- **Organization Level** (ЛК) - управление профилем организации, capabilities, просмотр всех проектов
- **Project Level** (Админка) - работа внутри конкретного проекта с учетом роли организации

### Задачи ЛК:

1. **Organization Profile Management** - управление capabilities, специализациями, сертификатами
2. **Onboarding Flow** - первичная настройка профиля организации
3. **Projects Overview** - обзорный просмотр всех проектов (owned + participant)
4. **Navigation** - переход в админку с выбором проекта

---

## 🏗️ Архитектура ЛК

### Уровни доступа:

```
┌─────────────────────────────────────────┐
│         ЛИЧНЫЙ КАБИНЕТ (ЛК)             │
│                                         │
│  • Organization Settings                │
│  • Capabilities Management              │
│  • My Projects (Overview)               │
│  • Billing & Modules                    │
│  • User Management                      │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Кнопка "Перейти к работе"        │  │
│  │  (выбор проекта → Админка)        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Ключевые концепции:

- **Organization Context** - текущая организация пользователя (из middleware)
- **Organization Capabilities** - что организация умеет делать (capabilities)
- **Project Roles** - роли организации в разных проектах (customer, contractor, subcontractor, etc.)
- **Multi-Organization** - пользователь может быть в нескольких организациях

---

## 🔌 API Endpoints

### Base URL
```
/api/v1/landing
```

### 1. Organization Profile & Capabilities

#### 1.1. Получить профиль организации
```http
GET /organization/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "organization_id": 1,
    "name": "ООО СтройГенподряд",
    "inn": "7701234567",
    "capabilities": [
      "general_contracting",
      "subcontracting"
    ],
    "primary_business_type": "general_contractor",
    "specializations": [
      "building_construction",
      "road_construction"
    ],
    "certifications": [
      "ISO 9001",
      "SRO"
    ],
    "profile_completeness": 85,
    "onboarding_completed": true,
    "onboarding_completed_at": "2025-10-01T10:00:00Z",
    "recommended_modules": [
      "advanced_warehouse",
      "project_planning",
      "contract_management"
    ]
  }
}
```

---

#### 1.2. Обновить Capabilities
```http
PUT /organization/profile/capabilities
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "capabilities": [
    "general_contracting",
    "subcontracting",
    "design"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Capabilities организации успешно обновлены.",
  "data": {
    "capabilities": ["general_contracting", "subcontracting", "design"],
    "profile_completeness": 90,
    "recommended_modules": [...]
  }
}
```

**Доступные Capabilities:**
- `general_contracting` - Генеральный подряд
- `subcontracting` - Субподрядные работы
- `design` - Проектирование
- `construction_supervision` - Строительный контроль
- `equipment_rental` - Аренда техники
- `materials_supply` - Поставка материалов
- `consulting` - Консалтинг
- `facility_management` - Эксплуатация объектов

---

#### 1.3. Обновить Primary Business Type
```http
PUT /organization/profile/business-type
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "primary_business_type": "general_contractor"
}
```

---

#### 1.4. Обновить Specializations
```http
PUT /organization/profile/specializations
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "specializations": [
    "building_construction",
    "electrical_works",
    "hvac_systems"
  ]
}
```

---

#### 1.5. Обновить Certifications
```http
PUT /organization/profile/certifications
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "certifications": [
    "ISO 9001",
    "SRO Construction",
    "Safety Certificate"
  ]
}
```

---

#### 1.6. Завершить Onboarding
```http
POST /organization/profile/complete-onboarding
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Onboarding успешно завершен!",
  "data": {
    "onboarding_completed": true,
    "onboarding_completed_at": "2025-10-17T12:00:00Z"
  }
}
```

---

#### 1.7. Получить список доступных Capabilities
```http
GET /organization/capabilities
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "value": "general_contracting",
      "label": "Генеральный подряд",
      "description": "Управление строительными проектами в качестве генподрядчика",
      "recommended_modules": ["advanced_warehouse", "project_planning"]
    },
    {
      "value": "subcontracting",
      "label": "Субподрядные работы",
      "description": "Выполнение специализированных работ как субподрядчик",
      "recommended_modules": ["basic_warehouse", "mobile_reports"]
    }
    // ... остальные capabilities
  ]
}
```

---

### 2. My Projects (Обзор проектов)

#### 2.1. Получить список проектов
```http
GET /my-projects
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": 1,
        "name": "ЖК Солнечный",
        "status": "in_progress",
        "is_archived": false,
        "role": "owner",
        "role_label": "Владелец проекта",
        "total_contracts": 15,
        "total_works": 120,
        "total_amount_contracts": 500000000.00,
        "total_amount_works": 350000000.00,
        "participants_count": 8
      },
      {
        "id": 2,
        "name": "ТРЦ Мега Плаза",
        "status": "in_progress",
        "is_archived": false,
        "role": "subcontractor",
        "role_label": "Субподрядчик",
        "total_contracts": 3,
        "total_works": 25,
        "total_amount_contracts": 50000000.00,
        "total_amount_works": 30000000.00,
        "participants_count": 5
      }
    ],
    "grouped": {
      "owned": [/* проекты где role=owner */],
      "participant": [/* проекты где role!=owner */]
    },
    "totals": {
      "all": 12,
      "owned": 5,
      "participant": 7,
      "active": 10,
      "archived": 2
    }
  }
}
```

---

#### 2.2. Получить детали проекта
```http
GET /my-projects/{projectId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": 1,
      "name": "ЖК Солнечный",
      "description": "Строительство жилого комплекса...",
      "address": "Москва, район Южное Бутово",
      "start_date": "2024-04-01",
      "end_date": "2026-10-01",
      "status": "in_progress",
      "owner_organization": {
        "id": 1,
        "name": "ООО СтройГенподряд"
      }
    },
    "my_context": {
      "role": "general_contractor",
      "role_label": "Генподрядчик",
      "is_owner": true,
      "can_manage_contracts": true,
      "can_view_finances": true,
      "can_manage_works": true,
      "can_manage_warehouse": true,
      "can_invite_participants": true
    },
    "statistics": {
      "contracts_count": 15,
      "works_count": 120,
      "total_contracts_amount": 500000000.00,
      "total_works_amount": 350000000.00,
      "completion_percentage": 70
    },
    "participants": [
      {
        "id": 2,
        "name": "ООО Электромонтаж",
        "role": "subcontractor",
        "role_label": "Субподрядчик"
      }
      // ... остальные участники
    ]
  }
}
```

---

## 📦 Структуры данных

### Organization Profile
```typescript
interface OrganizationProfile {
  organization_id: number;
  name: string;
  inn: string;
  capabilities: OrganizationCapability[];
  primary_business_type: string | null;
  specializations: string[];
  certifications: string[];
  profile_completeness: number; // 0-100
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  recommended_modules: string[];
}

type OrganizationCapability = 
  | 'general_contracting'
  | 'subcontracting'
  | 'design'
  | 'construction_supervision'
  | 'equipment_rental'
  | 'materials_supply'
  | 'consulting'
  | 'facility_management';
```

### Project Overview
```typescript
interface ProjectOverview {
  id: number;
  name: string;
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
  is_archived: boolean;
  role: ProjectOrganizationRole;
  role_label: string;
  total_contracts: number;
  total_works: number;
  total_amount_contracts: number;
  total_amount_works: number;
  participants_count: number;
}

type ProjectOrganizationRole =
  | 'owner'
  | 'customer'
  | 'general_contractor'
  | 'contractor'
  | 'subcontractor'
  | 'construction_supervision'
  | 'designer'
  | 'observer';
```

### My Project Context
```typescript
interface MyProjectContext {
  role: ProjectOrganizationRole;
  role_label: string;
  is_owner: boolean;
  can_manage_contracts: boolean;
  can_view_finances: boolean;
  can_manage_works: boolean;
  can_manage_warehouse: boolean;
  can_invite_participants: boolean;
}
```

---

## 🎨 UI/UX Flows

### 1. Onboarding Flow

**Шаги:**
1. **Welcome Screen** - приветствие нового пользователя
2. **Capabilities Selection** - выбор того, что умеет делать организация
3. **Business Type** - указание основного типа деятельности
4. **Specializations** (optional) - специализации
5. **Certifications** (optional) - сертификаты
6. **Complete** - завершение onboarding

**Компонент:**
```tsx
<OnboardingWizard
  onComplete={() => {
    // Вызов API: POST /organization/profile/complete-onboarding
    // Redirect to dashboard
  }}
/>
```

**Прогресс бар:**
- Показывать `profile_completeness` (0-100%)
- Рекомендовать заполнить недостающие поля

---

### 2. Organization Settings Page

**Секции:**
- **Company Info** - название, ИНН, адреса (readonly, изменяется через support)
- **Capabilities** - чекбоксы с capabilities
- **Business Type** - dropdown
- **Specializations** - multi-select или chips
- **Certifications** - список с возможностью добавления/удаления

**Live Recommendations:**
- При изменении capabilities показывать рекомендуемые модули
- Подсказки: "Для роли 'Генподрядчик' рекомендуем активировать модуль 'Планирование'"

---

### 3. My Projects Page

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  Мои проекты                         [+ Создать] │
├──────────────────────────────────────────────────┤
│  Tabs: [Все (12)] [Владелец (5)] [Участник (7)] │
├──────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐  │
│  │ ЖК "Солнечный"                 [Owner]     │  │
│  │ Москва, Южное Бутово                       │  │
│  │ ━━━━━━━━━━━━━━━━ 70%                       │  │
│  │ 💼 15 контрактов | 🔨 120 работ            │  │
│  │ [Перейти к работе →]                       │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │ ТРЦ "Мега Плаза"           [Subcontractor] │  │
│  │ Москва, МКАД 25км                          │  │
│  │ ━━━━━━━━━ 45%                              │  │
│  │ 💼 3 контракта | 🔨 25 работ               │  │
│  │ [Перейти к работе →]                       │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Фильтры:**
- По статусу (active, archived)
- По роли (owner, participant)
- Поиск по названию

**Actions:**
- Клик на карточку → детали проекта (modal)
- "Перейти к работе" → redirect в админку с project_id

---

### 4. Project Details Modal

**Content:**
- **Общая информация**: название, адрес, даты
- **Моя роль**: badge с ролью + список разрешений
- **Статистика**: контракты, работы, суммы
- **Участники**: список всех организаций-участников с их ролями
- **Actions**: "Перейти к работе" → админка

---

## 🧩 Компоненты

### 1. CapabilitiesSelector
```tsx
interface CapabilitiesSelectorProps {
  selectedCapabilities: OrganizationCapability[];
  onChange: (capabilities: OrganizationCapability[]) => void;
  showRecommendations?: boolean;
}

<CapabilitiesSelector
  selectedCapabilities={profile.capabilities}
  onChange={(caps) => updateCapabilities(caps)}
  showRecommendations={true}
/>
```

**Features:**
- Чекбоксы для каждого capability
- Описание при hover
- Показывать рекомендуемые модули для выбранных capabilities

---

### 2. ProjectCard
```tsx
interface ProjectCardProps {
  project: ProjectOverview;
  onViewDetails: (projectId: number) => void;
  onGoToWork: (projectId: number) => void;
}

<ProjectCard
  project={project}
  onViewDetails={(id) => openModal(id)}
  onGoToWork={(id) => navigate(`/admin/projects/${id}`)}
/>
```

**Design:**
- Роль как badge (цветовая кодировка по роли)
- Progress bar для completion_percentage
- Статистика в компактном виде
- Primary action: "Перейти к работе"

---

### 3. ProfileCompletenessWidget
```tsx
interface ProfileCompletenessWidgetProps {
  completeness: number;
  missingFields?: string[];
  onComplete: () => void;
}

<ProfileCompletenessWidget
  completeness={profile.profile_completeness}
  missingFields={['specializations', 'certifications']}
  onComplete={() => navigate('/settings/profile')}
/>
```

**Display:**
- Circular progress (0-100%)
- Список недостающих полей
- CTA: "Завершить настройку профиля"

---

### 4. RoleBadge
```tsx
interface RoleBadgeProps {
  role: ProjectOrganizationRole;
  size?: 'sm' | 'md' | 'lg';
}

<RoleBadge role="general_contractor" size="md" />
```

**Цветовая схема:**
- Owner: золотой/оранжевый
- General Contractor: синий
- Contractor: голубой
- Subcontractor: зеленый
- Customer: фиолетовый
- Designer: розовый
- Supervision: красный
- Observer: серый

---

## 🗃️ State Management

### Store Structure (Zustand/Redux)

```typescript
interface OrganizationStore {
  profile: OrganizationProfile | null;
  projects: ProjectOverview[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateCapabilities: (capabilities: OrganizationCapability[]) => Promise<void>;
  updateBusinessType: (type: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  
  fetchProjects: () => Promise<void>;
  fetchProjectDetails: (projectId: number) => Promise<ProjectDetailResponse>;
}
```

### React Query (Recommended)

```tsx
// Hooks
const { data: profile, isLoading } = useOrganizationProfile();
const { data: projects } = useMyProjects();
const { mutate: updateCapabilities } = useUpdateCapabilities();

// Usage
updateCapabilities(['general_contracting', 'design'], {
  onSuccess: () => {
    toast.success('Capabilities обновлены!');
    queryClient.invalidateQueries(['organization-profile']);
  }
});
```

---

## 💻 Примеры кода

### Fetching Organization Profile

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useOrganizationProfile() {
  return useQuery({
    queryKey: ['organization-profile'],
    queryFn: async () => {
      const response = await api.get('/organization/profile');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

export function useUpdateCapabilities() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (capabilities: OrganizationCapability[]) => {
      const response = await api.put('/organization/profile/capabilities', {
        capabilities
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-profile'] });
      queryClient.invalidateQueries({ queryKey: ['recommended-modules'] });
    },
  });
}
```

---

### Organization Settings Page

```tsx
import { useOrganizationProfile, useUpdateCapabilities } from '@/hooks/useOrganization';
import { CapabilitiesSelector } from '@/components/CapabilitiesSelector';
import { Button } from '@/components/ui/button';

export function OrganizationSettingsPage() {
  const { data: profile, isLoading } = useOrganizationProfile();
  const updateCapabilities = useUpdateCapabilities();

  if (isLoading) return <Spinner />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Настройки организации</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Capabilities</CardTitle>
          <CardDescription>
            Укажите, какие виды работ выполняет ваша организация
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CapabilitiesSelector
            selectedCapabilities={profile.capabilities}
            onChange={(caps) => {
              updateCapabilities.mutate(caps, {
                onSuccess: () => toast.success('Сохранено!')
              });
            }}
            showRecommendations
          />
        </CardContent>
      </Card>
      
      {/* Другие секции: Business Type, Specializations, Certifications */}
    </div>
  );
}
```

---

### My Projects Page

```tsx
import { useMyProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/ProjectCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function MyProjectsPage() {
  const { data, isLoading } = useMyProjects();
  const navigate = useNavigate();

  if (isLoading) return <Spinner />;

  const { projects, grouped, totals } = data;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Мои проекты</h1>
        <Button onClick={() => navigate('/projects/create')}>
          + Создать проект
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Все ({totals.all})</TabsTrigger>
          <TabsTrigger value="owned">Владелец ({totals.owned})</TabsTrigger>
          <TabsTrigger value="participant">Участник ({totals.participant})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetails={(id) => openDetailsModal(id)}
              onGoToWork={(id) => navigate(`/admin/projects/${id}`)}
            />
          ))}
        </TabsContent>

        <TabsContent value="owned" className="space-y-4 mt-6">
          {grouped.owned.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </TabsContent>

        <TabsContent value="participant" className="space-y-4 mt-6">
          {grouped.participant.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## ✅ Best Practices

### 1. Error Handling
```typescript
// Обработка ошибок валидации
try {
  await updateCapabilities(['invalid_capability']);
} catch (error) {
  if (error.response?.status === 422) {
    const errors = error.response.data.errors;
    // Показать validation errors в форме
    setFormErrors(errors);
  } else {
    toast.error('Произошла ошибка. Попробуйте позже.');
  }
}
```

### 2. Optimistic Updates
```typescript
const updateCapabilities = useMutation({
  mutationFn: updateCapabilitiesAPI,
  onMutate: async (newCapabilities) => {
    // Отменяем текущие запросы
    await queryClient.cancelQueries({ queryKey: ['organization-profile'] });
    
    // Сохраняем предыдущее состояние
    const previousProfile = queryClient.getQueryData(['organization-profile']);
    
    // Optimistic update
    queryClient.setQueryData(['organization-profile'], (old: any) => ({
      ...old,
      capabilities: newCapabilities
    }));
    
    return { previousProfile };
  },
  onError: (err, newData, context) => {
    // Откат при ошибке
    queryClient.setQueryData(['organization-profile'], context.previousProfile);
  },
});
```

### 3. Caching Strategy
- **Organization Profile**: 5 минут (обновляется редко)
- **My Projects**: 2 минуты (может обновляться чаще)
- **Project Details**: 1 минута (данные могут меняться)

### 4. Navigation
```typescript
// Переход в админку с выбранным проектом
const goToProject = (projectId: number) => {
  // Сохраняем selected project в localStorage для админки
  localStorage.setItem('selected_project_id', projectId.toString());
  
  // Redirect
  navigate(`/admin/projects/${projectId}`);
};
```

### 5. Validation
- Минимум 1 capability должен быть выбран
- Business type обязателен после выбора capabilities
- Onboarding можно завершить только при completeness >= 80%

---

## 🎯 Чеклист интеграции

### Organization Settings
- [ ] Страница настроек организации
- [ ] CapabilitiesSelector компонент
- [ ] Business Type selector
- [ ] Specializations multi-select
- [ ] Certifications list с CRUD
- [ ] Profile Completeness widget
- [ ] Onboarding wizard

### My Projects
- [ ] My Projects список с табами
- [ ] ProjectCard компонент
- [ ] Project Details modal
- [ ] RoleBadge компонент
- [ ] Фильтрация и поиск
- [ ] Переход в админку с project_id

### API Integration
- [ ] useOrganizationProfile hook
- [ ] useUpdateCapabilities hook
- [ ] useMyProjects hook
- [ ] useProjectDetails hook
- [ ] Error handling middleware
- [ ] Loading states

### State Management
- [ ] React Query setup
- [ ] Cache invalidation logic
- [ ] Optimistic updates
- [ ] Error boundaries

---

## 📞 Поддержка

**Backend Developer:** @your-team  
**API Documentation:** `/docs/FRONTEND_ADMIN_PROJECT_RBAC_INTEGRATION.md`  
**OpenAPI Spec:** `/public/docs/openapi-lk.yaml`

**Testing Accounts:**
- `director@gencontractor.ru / password` - Генподрядчик
- `director@electro.ru / password` - Субподрядчик
- `director@investstroy.ru / password` - Заказчик

**Test Environment Setup:**
```bash
php artisan rbac:setup-test --fresh --validate
```

---

✅ **Документация готова к использованию!**

