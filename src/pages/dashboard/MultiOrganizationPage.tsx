import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  PlusIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useMultiOrganization } from '@hooks/useMultiOrganization';
import type { CreateHoldingRequest, AddChildOrganizationRequest } from '@utils/api';

const MultiOrganizationPage = () => {
  const {
    availability,
    hierarchy,
    accessibleOrganizations,
    selectedOrganization,
    loading,
    error,
    checkAvailability,
    fetchHierarchy,
    fetchAccessibleOrganizations,
    fetchOrganizationDetails,
    createHolding,
    addChildOrganization,
    switchContext,
    canCreateHolding,
    isHolding,
    getCurrentOrganizationType,
  } = useMultiOrganization();

  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateHoldingModal, setShowCreateHoldingModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [selectedOrgForDetails, setSelectedOrgForDetails] = useState<number | null>(null);
  
  // Form states
  const [holdingForm, setHoldingForm] = useState<CreateHoldingRequest>({
    name: '',
    description: '',
    max_child_organizations: 25,
    settings: {
      consolidated_reports: true,
      shared_materials: false,
      unified_billing: true,
    },
    permissions_config: {
      default_child_permissions: {
        projects: ['read', 'create', 'edit'],
        contracts: ['read', 'create'],
        materials: ['read', 'create'],
        reports: ['read'],
        users: ['read'],
      },
    },
  });

  const [childForm, setChildForm] = useState<AddChildOrganizationRequest>({
    group_id: hierarchy?.parent?.group_id || 1,
    name: '',
    description: '',
    inn: '',
    kpp: '',
    address: '',
    phone: '',
    email: '',
    owner: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const initializeData = async () => {
      const available = await checkAvailability();
      if (available || availability) {
        await Promise.all([
          fetchHierarchy(),
          fetchAccessibleOrganizations(),
        ]);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (hierarchy?.parent?.group_id) {
      setChildForm(prev => ({ ...prev, group_id: hierarchy.parent.group_id! }));
    }
  }, [hierarchy]);

  const handleCreateHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHolding(holdingForm);
      setShowCreateHoldingModal(false);
      // Reset form...
    } catch (error) {
      console.error('Ошибка создания холдинга:', error);
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addChildOrganization(childForm);
      setShowAddChildModal(false);
      // Reset form...
    } catch (error) {
      console.error('Ошибка добавления дочерней организации:', error);
    }
  };

  const handleSwitchContext = async (organizationId: number) => {
    try {
      await switchContext(organizationId);
      window.location.reload();
    } catch (error) {
      console.error('Ошибка смены контекста:', error);
    }
  };

  const handleViewOrganizationDetails = async (orgId: number) => {
    setSelectedOrgForDetails(orgId);
    await fetchOrganizationDetails(orgId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(value);
  };

  if (loading && !availability) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
         <div className="text-center">
            <ArrowPathIcon className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Загрузка данных холдинга...</p>
         </div>
      </div>
    );
  }

  if (!availability?.available && !loading && !hierarchy) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <BuildingOffice2Icon className="h-8 w-8 text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Модуль мультиорганизации</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
            Управляйте группой компаний, филиалами и дочерними структурами в одном интерфейсе. 
            Для доступа к функционалу необходимо активировать модуль.
          </p>
          <button className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200">
            Перейти к активации
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: ChartBarIcon },
    { id: 'hierarchy', name: 'Структура', icon: BuildingOffice2Icon },
    { id: 'organizations', name: 'Организации', icon: ArrowPathIcon },
    { id: 'analytics', name: 'Аналитика', icon: DocumentTextIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Мультиорганизация</h1>
              {hierarchy?.parent && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                   getCurrentOrganizationType() === 'parent' 
                    ? 'bg-orange-50 text-orange-700 border-orange-100' 
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {getCurrentOrganizationType() === 'parent' ? 'Головной офис' : 'Филиал'}
                </span>
              )}
            </div>
            <p className="text-slate-500">
              Единый центр управления структурой бизнеса
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {hierarchy?.parent?.slug && (
              <a
                href={`https://${hierarchy.parent.slug}.prohelper.pro/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2 text-slate-400" />
                Сайт холдинга
              </a>
            )}
          
            {canCreateHolding() && !isHolding() && (
              <button
                onClick={() => setShowCreateHoldingModal(true)}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-md hover:shadow-lg font-bold"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Создать холдинг
              </button>
            )}
            
            {isHolding() && hierarchy?.parent && (
              <button
                onClick={() => setShowAddChildModal(true)}
                className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg font-medium"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Добавить организацию
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Modern Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-200 mb-8 w-full md:w-fit overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center px-6 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive ? 'text-orange-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-orange-50 rounded-xl"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-orange-50 rounded-xl">
                            <BuildingOfficeIcon className="h-6 w-6 text-orange-600" />
                         </div>
                         <div>
                            <p className="text-sm font-medium text-slate-500">Ваша роль</p>
                            <p className="text-lg font-bold text-slate-900">
                              {getCurrentOrganizationType() === 'parent' ? 'Головной офис' : 
                               getCurrentOrganizationType() === 'child' ? 'Филиал' : 'Организация'}
                            </p>
                         </div>
                      </div>
                    </div>

                    {hierarchy?.total_stats && (
                      <>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                             <div className="p-3 bg-slate-50 rounded-xl">
                                <UsersIcon className="h-6 w-6 text-slate-600" />
                             </div>
                             <div>
                                <p className="text-sm font-medium text-slate-500">Сотрудников</p>
                                <p className="text-lg font-bold text-slate-900">{hierarchy.total_stats.total_users}</p>
                             </div>
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                             <div className="p-3 bg-slate-50 rounded-xl">
                                <BriefcaseIcon className="h-6 w-6 text-slate-600" />
                             </div>
                             <div>
                                <p className="text-sm font-medium text-slate-500">Проектов</p>
                                <p className="text-lg font-bold text-slate-900">{hierarchy.total_stats.total_projects}</p>
                             </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Holding Info Card */}
                  {hierarchy?.parent && (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                         <h3 className="font-bold text-slate-900">Информация о компании</h3>
                         {hierarchy.parent.is_holding && <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">HOLDING</span>}
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Название</p>
                           <p className="text-base font-medium text-slate-900">{hierarchy.parent.name}</p>
                        </div>
                        {hierarchy.parent.tax_number && (
                          <div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ИНН</p>
                             <p className="text-base font-medium text-slate-900">{hierarchy.parent.tax_number}</p>
                          </div>
                        )}
                        {hierarchy.parent.address && (
                          <div className="md:col-span-2">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Юридический адрес</p>
                             <p className="text-base font-medium text-slate-900">{hierarchy.parent.address}</p>
                          </div>
                        )}
                        <div className="md:col-span-2 pt-4 border-t border-slate-100 flex gap-8">
                           <div>
                              <span className="text-3xl font-bold text-slate-900 block">{hierarchy.children.length}</span>
                              <span className="text-sm text-slate-500">Дочерних организаций</span>
                           </div>
                           {/* Add more stats here if available */}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'hierarchy' && hierarchy && (
                 <div className="pb-12 pt-4 relative min-h-[500px]">
                    <div className="flex flex-col items-center w-full">
                       {/* Root Node */}
                       <div className="relative z-20 mb-16">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-6 rounded-3xl border-2 border-orange-500/30 shadow-[0_20px_50px_-12px_rgba(249,115,22,0.3)] w-96 text-center relative z-20 hover:border-orange-500 transition-colors duration-300"
                          >
                             <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent rounded-3xl -z-10"></div>
                             <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-orange-500/30">
                                <BuildingOffice2Icon className="h-8 w-8" />
                             </div>
                             <h3 className="font-bold text-xl text-slate-900 mb-2">{hierarchy.parent.name}</h3>
                             <p className="text-sm text-slate-500 mb-4 uppercase tracking-widest font-bold text-[10px]">Головная организация</p>
                             
                             <div className="flex justify-center gap-3">
                                <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 text-xs font-bold text-slate-500">
                                   ИНН {hierarchy.parent.tax_number || '—'}
                                </div>
                                <div className="px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100 text-xs font-bold text-emerald-600 flex items-center gap-1">
                                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                   Активна
                                </div>
                             </div>
                          </motion.div>
                          
                          {/* Animated Vertical Connector from Parent */}
                          {hierarchy.children.length > 0 && (
                             <div className="absolute left-1/2 bottom-0 translate-y-full -translate-x-1/2 w-px h-16 overflow-visible z-0">
                                <div className="h-full w-full bg-gradient-to-b from-orange-500/30 to-orange-300/30"></div>
                             </div>
                          )}
                       </div>

                       {/* Children */}
                       {hierarchy.children.length > 0 && (
                          <div className="relative w-full flex justify-center px-8">
                             <div className="flex justify-center gap-8 w-full flex-wrap relative">
                                {/* Connecting line across children */}
                                {hierarchy.children.length > 1 && (
                                   <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent -mt-16" 
                                        style={{ width: '80%' }} 
                                   ></div>
                                )}

                                {hierarchy.children.map((child, index) => (
                                   <motion.div 
                                      key={child.id} 
                                      className="flex flex-col items-center relative group"
                                      initial={{ opacity: 0, y: 30 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                                   >
                                      {/* Vertical Connector to Child */}
                                      <div className="absolute top-0 -mt-16 w-px h-16 bg-gradient-to-b from-orange-300/30 to-slate-200"></div>
                                      
                                      {/* Dot at junction */}
                                      <div className="absolute top-0 -mt-16 w-3 h-3 rounded-full bg-white border-2 border-orange-300 -translate-y-1/2 z-10 shadow-sm"></div>
                                      
                                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg hover:shadow-2xl hover:border-orange-200 hover:-translate-y-2 transition-all duration-300 w-80 relative z-10 group group-hover:shadow-orange-100">
                                         <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors duration-300">
                                               <BuildingOfficeIcon className="h-6 w-6" />
                                            </div>
                                            <button 
                                               onClick={() => handleSwitchContext(child.id)}
                                               className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-lg hover:bg-slate-800"
                                            >
                                               Войти
                                            </button>
                                         </div>
                                         
                                         <h4 className="font-bold text-slate-900 text-lg mb-1 truncate" title={child.name}>{child.name}</h4>
                                         <p className="text-xs text-slate-400 mb-4 uppercase font-bold tracking-wider">Филиал / Дочерняя</p>
                                         
                                         <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                            <div className="flex -space-x-2">
                                               {[1,2,3].map(i => (
                                                  <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                                               ))}
                                            </div>
                                            <button 
                                               onClick={() => handleViewOrganizationDetails(child.id)}
                                               className="text-xs font-bold text-slate-400 hover:text-orange-600 flex items-center transition-colors"
                                            >
                                               Подробнее <ChevronRightIcon className="w-3 h-3 ml-1" />
                                            </button>
                                         </div>
                                      </div>
                                   </motion.div>
                                ))}
                             </div>
                          </div>
                       )}
                    </div>
                 </div>
              )}

              {activeTab === 'organizations' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {accessibleOrganizations.length > 0 ? accessibleOrganizations.map((org) => (
                    <div key={org.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow group">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                               org.organization_type === 'parent' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-600'
                            }`}>
                               <BuildingOfficeIcon className="w-6 h-6" />
                            </div>
                            <div>
                               <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{org.name}</h3>
                               <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-slate-500">
                                     {org.organization_type === 'parent' ? 'Головная' : 'Дочерняя'}
                                  </span>
                                  {org.is_holding && (
                                     <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">ХОЛДИНГ</span>
                                  )}
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      <div className="flex gap-3 mt-6">
                         <button
                            onClick={() => handleSwitchContext(org.id)}
                            className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                         >
                            <ArrowPathIcon className="w-4 h-4" />
                            Переключиться
                         </button>
                         <button
                            onClick={() => handleViewOrganizationDetails(org.id)}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                         >
                            <EyeIcon className="w-5 h-5" />
                         </button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-12 text-center">
                       <p className="text-slate-500">Нет доступных организаций для переключения</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && hierarchy?.total_stats && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                       <div className="flex items-center justify-between mb-4">
                          <div className="p-2 bg-blue-50 rounded-lg">
                             <UsersIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <span className="text-xs font-bold text-slate-400 uppercase">Персонал</span>
                       </div>
                       <p className="text-3xl font-bold text-slate-900 mb-1">{hierarchy.total_stats.total_users}</p>
                       <p className="text-sm text-slate-500">Всего сотрудников в холдинге</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                       <div className="flex items-center justify-between mb-4">
                          <div className="p-2 bg-green-50 rounded-lg">
                             <DocumentTextIcon className="w-6 h-6 text-green-600" />
                          </div>
                          <span className="text-xs font-bold text-slate-400 uppercase">Проекты</span>
                       </div>
                       <p className="text-3xl font-bold text-slate-900 mb-1">{hierarchy.total_stats.total_projects}</p>
                       <p className="text-sm text-slate-500">Активных проектов</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                       <div className="flex items-center justify-between mb-4">
                          <div className="p-2 bg-purple-50 rounded-lg">
                             <BanknotesIcon className="w-6 h-6 text-purple-600" />
                          </div>
                          <span className="text-xs font-bold text-slate-400 uppercase">Договоры</span>
                       </div>
                       <p className="text-3xl font-bold text-slate-900 mb-1">{hierarchy.total_stats.total_contracts}</p>
                       <p className="text-sm text-slate-500">Заключенных контрактов</p>
                    </div>
                 </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Modals would go here - simplified for this turn, keeping the logic but would ideally be separate components */}
      {/* Details Modal */}
      <AnimatePresence>
         {selectedOrganization && selectedOrgForDetails && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
               onClick={() => setSelectedOrgForDetails(null)}
            >
               <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
               >
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                     <h3 className="text-xl font-bold text-slate-900">Детали организации</h3>
                     <button onClick={() => setSelectedOrgForDetails(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                     </button>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                           <BuildingOfficeIcon className="w-4 h-4 text-orange-500" />
                           Основное
                        </h4>
                        <div className="space-y-3 text-sm">
                           <div>
                              <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider mb-1">Название</span>
                              <span className="text-slate-900 font-medium text-base">{selectedOrganization.organization.name}</span>
                           </div>
                           <div>
                              <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider mb-1">Тип</span>
                              <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-medium inline-block">
                                 {selectedOrganization.organization.organization_type === 'parent' ? 'Головная' : 'Дочерняя'}
                              </span>
                           </div>
                           {selectedOrganization.organization.inn && (
                              <div>
                                 <span className="text-slate-500 block text-xs uppercase font-bold tracking-wider mb-1">ИНН</span>
                                 <span className="text-slate-900 font-medium">{selectedOrganization.organization.inn}</span>
                              </div>
                           )}
                        </div>
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                           <ChartBarIcon className="w-4 h-4 text-orange-500" />
                           Показатели
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                              <div className="text-2xl font-bold text-slate-900">{selectedOrganization.stats.users_count}</div>
                              <div className="text-xs text-slate-500 font-medium">Сотрудников</div>
                           </div>
                           <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                              <div className="text-2xl font-bold text-slate-900">{selectedOrganization.stats.projects_count}</div>
                              <div className="text-xs text-slate-500 font-medium">Проектов</div>
                           </div>
                           <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100 col-span-2">
                              <div className="text-xl font-bold text-slate-900">{formatCurrency(selectedOrganization.stats.active_contracts_value)}</div>
                              <div className="text-xs text-slate-500 font-medium">Объем контрактов</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
      
      {/* Modals for Create Holding / Add Child would also need updating to match theme, omitted for brevity but logic remains */}
      {showCreateHoldingModal && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">Создание холдинга</h3>
                  <button onClick={() => setShowCreateHoldingModal(false)}><XMarkIcon className="w-6 h-6 text-slate-400" /></button>
               </div>
               <form onSubmit={handleCreateHolding} className="p-6 space-y-4">
                  {/* Simplified form fields with new styling */}
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Название холдинга</label>
                     <input 
                        type="text" 
                        required
                        value={holdingForm.name}
                        onChange={e => setHoldingForm({...holdingForm, name: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        placeholder="Например: ГК СтройПрогресс"
                     />
                  </div>
                  <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors">
                     Создать структуру
                  </button>
               </form>
            </div>
         </div>
      )}

      {showAddChildModal && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-xl font-bold text-slate-900">Добавить дочернюю организацию</h3>
                  <button onClick={() => setShowAddChildModal(false)}><XMarkIcon className="w-6 h-6 text-slate-400" /></button>
               </div>
               <div className="overflow-y-auto p-6">
                  <form onSubmit={handleAddChild} className="space-y-5">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="col-span-full">
                           <label className="block text-sm font-bold text-slate-700 mb-1">Название</label>
                           <input 
                              type="text" required
                              value={childForm.name}
                              onChange={e => setChildForm({...childForm, name: e.target.value})}
                              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">Email владельца</label>
                           <input 
                              type="email" required
                              value={childForm.owner.email}
                              onChange={e => setChildForm({...childForm, owner: {...childForm.owner, email: e.target.value}})}
                              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">Имя владельца</label>
                           <input 
                              type="text" required
                              value={childForm.owner.name}
                              onChange={e => setChildForm({...childForm, owner: {...childForm.owner, name: e.target.value}})}
                              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                           />
                        </div>
                        <div className="col-span-full">
                           <label className="block text-sm font-bold text-slate-700 mb-1">Пароль для входа</label>
                           <input 
                              type="password" required
                              value={childForm.owner.password}
                              onChange={e => setChildForm({...childForm, owner: {...childForm.owner, password: e.target.value}})}
                              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                           />
                        </div>
                     </div>
                     <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowAddChildModal(false)} className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100">Отмена</button>
                        <button type="submit" className="px-5 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200">Добавить</button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default MultiOrganizationPage;