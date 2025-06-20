import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  KeyIcon,
  ChartBarIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SunIcon,
  MoonIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    projectUpdates: true,
    billing: true,
    security: true
  });

  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('ru');
  const [timezone, setTimezone] = useState('Europe/Moscow');

  const tabs = [
    { id: 'general', name: 'Общие', icon: CogIcon },
    { id: 'notifications', name: 'Уведомления', icon: BellIcon },
    { id: 'security', name: 'Безопасность', icon: ShieldCheckIcon },
    { id: 'appearance', name: 'Внешний вид', icon: PaintBrushIcon },
    { id: 'integrations', name: 'Интеграции', icon: GlobeAltIcon },
  ];

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast.success('Настройки уведомлений сохранены');
  };

  const handleSave = () => {
    toast.success('Настройки успешно сохранены!');
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-steel-900 mb-4">Основные настройки</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-2">
              Язык интерфейса
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-steel-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
              <option value="kz">Қазақша</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-2">
              Часовой пояс
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-3 border border-steel-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500"
            >
              <option value="Europe/Moscow">Москва (UTC+3)</option>
              <option value="Asia/Almaty">Алматы (UTC+6)</option>
              <option value="Asia/Tashkent">Ташкент (UTC+5)</option>
              <option value="Europe/Kiev">Киев (UTC+2)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-steel-200 pt-6">
        <h4 className="text-md font-medium text-steel-900 mb-4">Настройки организации</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-steel-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="w-5 h-5 text-construction-600" />
              <div>
                <p className="font-medium text-steel-900">Автоматическое создание проектов</p>
                <p className="text-sm text-steel-600">Создавать проекты при добавлении новых объектов</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-steel-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-construction-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-construction-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-steel-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="w-5 h-5 text-safety-600" />
              <div>
                <p className="font-medium text-steel-900">Детальная аналитика</p>
                <p className="text-sm text-steel-600">Собирать расширенную статистику по проектам</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-steel-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-construction-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-construction-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-steel-900 mb-4">Способы уведомлений</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-steel-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="w-5 h-5 text-construction-600" />
              <div>
                <p className="font-medium text-steel-900">Email уведомления</p>
                <p className="text-sm text-steel-600">Получать уведомления на электронную почту</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notifications.email}
                onChange={(e) => handleNotificationChange('email', e.target.checked)}
              />
              <div className="w-11 h-6 bg-steel-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-construction-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-construction-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-steel-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <DevicePhoneMobileIcon className="w-5 h-5 text-safety-600" />
              <div>
                <p className="font-medium text-steel-900">Push уведомления</p>
                <p className="text-sm text-steel-600">Мгновенные уведомления в браузере</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notifications.push}
                onChange={(e) => handleNotificationChange('push', e.target.checked)}
              />
              <div className="w-11 h-6 bg-steel-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-construction-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-construction-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-steel-200 pt-6">
        <h4 className="text-md font-medium text-steel-900 mb-4">Типы уведомлений</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-steel-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="w-5 h-5 text-earth-600" />
              <div>
                <p className="font-medium text-steel-900">Обновления проектов</p>
                <p className="text-sm text-steel-600">Изменения в проектах и задачах</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notifications.projectUpdates}
                onChange={(e) => handleNotificationChange('projectUpdates', e.target.checked)}
              />
              <div className="w-11 h-6 bg-steel-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-construction-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-construction-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-steel-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="w-5 h-5 text-construction-600" />
              <div>
                <p className="font-medium text-steel-900">Финансовые уведомления</p>
                <p className="text-sm text-steel-600">Счета, платежи и изменения баланса</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notifications.billing}
                onChange={(e) => handleNotificationChange('billing', e.target.checked)}
              />
              <div className="w-11 h-6 bg-steel-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-construction-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-construction-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-steel-900 mb-4">Безопасность аккаунта</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-construction-50 rounded-xl border border-construction-200">
            <div className="flex items-center space-x-3">
              <KeyIcon className="w-5 h-5 text-construction-600" />
              <div>
                <p className="font-medium text-steel-900">Изменить пароль</p>
                <p className="text-sm text-steel-600">Последнее изменение: 15 дней назад</p>
              </div>
            </div>
            <motion.button
              className="px-4 py-2 bg-construction-600 text-white rounded-lg hover:bg-construction-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Изменить
            </motion.button>
          </div>

          <div className="flex items-center justify-between p-4 bg-safety-50 rounded-xl border border-safety-200">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="w-5 h-5 text-safety-600" />
              <div>
                <p className="font-medium text-steel-900">Двухфакторная аутентификация</p>
                <p className="text-sm text-steel-600">Дополнительная защита аккаунта</p>
              </div>
            </div>
            <motion.button
              className="px-4 py-2 border border-safety-600 text-safety-600 rounded-lg hover:bg-safety-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Настроить
            </motion.button>
          </div>
        </div>
      </div>

      <div className="border-t border-steel-200 pt-6">
        <h4 className="text-md font-medium text-steel-900 mb-4">Активные сессии</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-steel-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <ComputerDesktopIcon className="w-5 h-5 text-earth-600" />
              <div>
                <p className="font-medium text-steel-900">Chrome на Windows</p>
                <p className="text-sm text-steel-600">Текущая сессия • Москва, Россия</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-earth-100 text-earth-800 text-xs font-medium rounded-full">
              Активна
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-steel-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <DevicePhoneMobileIcon className="w-5 h-5 text-steel-600" />
              <div>
                <p className="font-medium text-steel-900">Safari на iPhone</p>
                <p className="text-sm text-steel-600">2 дня назад • Москва, Россия</p>
              </div>
            </div>
            <motion.button
              className="px-3 py-1 text-construction-600 hover:text-construction-700 text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Завершить
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-steel-900 mb-4">Внешний вид</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-3">
              Тема интерфейса
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  theme === 'light' ? 'border-construction-500 bg-construction-50' : 'border-steel-200 bg-white'
                }`}
                onClick={() => setTheme('light')}
              >
                <div className="flex items-center space-x-3">
                  <SunIcon className="w-6 h-6 text-construction-600" />
                  <div>
                    <p className="font-medium text-steel-900">Светлая</p>
                    <p className="text-sm text-steel-600">Классический светлый интерфейс</p>
                  </div>
                </div>
              </div>

              <div 
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  theme === 'dark' ? 'border-construction-500 bg-construction-50' : 'border-steel-200 bg-white'
                }`}
                onClick={() => setTheme('dark')}
              >
                <div className="flex items-center space-x-3">
                  <MoonIcon className="w-6 h-6 text-steel-600" />
                  <div>
                    <p className="font-medium text-steel-900">Темная</p>
                    <p className="text-sm text-steel-600">Темный режим для работы</p>
                  </div>
                </div>
              </div>

              <div 
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  theme === 'auto' ? 'border-construction-500 bg-construction-50' : 'border-steel-200 bg-white'
                }`}
                onClick={() => setTheme('auto')}
              >
                <div className="flex items-center space-x-3">
                  <ComputerDesktopIcon className="w-6 h-6 text-safety-600" />
                  <div>
                    <p className="font-medium text-steel-900">Авто</p>
                    <p className="text-sm text-steel-600">Следовать системным настройкам</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-steel-200 pt-6">
        <h4 className="text-md font-medium text-steel-900 mb-4">Настройки отображения</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-steel-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <EyeIcon className="w-5 h-5 text-earth-600" />
              <div>
                <p className="font-medium text-steel-900">Компактный режим</p>
                <p className="text-sm text-steel-600">Уменьшенные отступы и размеры элементов</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-steel-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-construction-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-construction-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-steel-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="w-5 h-5 text-construction-600" />
              <div>
                <p className="font-medium text-steel-900">Показывать подсказки</p>
                <p className="text-sm text-steel-600">Всплывающие подсказки для элементов интерфейса</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-steel-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-construction-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-construction-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-steel-900 mb-4">Внешние интеграции</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-steel-50 rounded-xl border border-steel-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">1C</span>
              </div>
              <div>
                <p className="font-medium text-steel-900">1C: Предприятие</p>
                <p className="text-sm text-steel-600">Синхронизация с учетной системой</p>
              </div>
            </div>
            <motion.button
              className="px-4 py-2 bg-construction-600 text-white rounded-lg hover:bg-construction-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Подключить
            </motion.button>
          </div>

          <div className="flex items-center justify-between p-4 bg-earth-50 rounded-xl border border-earth-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">API</span>
              </div>
              <div>
                <p className="font-medium text-steel-900">REST API</p>
                <p className="text-sm text-steel-600">Подключено • Последняя синхронизация: 5 мин назад</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <motion.button
                className="px-3 py-2 border border-earth-600 text-earth-600 rounded-lg hover:bg-earth-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Настроить
              </motion.button>
              <motion.button
                className="px-3 py-2 text-construction-600 hover:text-construction-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Отключить
              </motion.button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-steel-50 rounded-xl border border-steel-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">WH</span>
              </div>
              <div>
                <p className="font-medium text-steel-900">Webhooks</p>
                <p className="text-sm text-steel-600">Автоматические уведомления о событиях</p>
              </div>
            </div>
            <motion.button
              className="px-4 py-2 border border-steel-300 text-steel-700 rounded-lg hover:bg-steel-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Настроить
            </motion.button>
          </div>
        </div>
      </div>

      <div className="border-t border-steel-200 pt-6">
        <h4 className="text-md font-medium text-steel-900 mb-4">API ключи</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-steel-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <KeyIcon className="w-5 h-5 text-construction-600" />
              <div>
                <p className="font-medium text-steel-900">Основной API ключ</p>
                <p className="text-sm text-steel-600 font-mono">pk_live_•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <motion.button
                className="px-3 py-1 text-steel-600 hover:text-steel-700 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Показать
              </motion.button>
              <motion.button
                className="px-3 py-1 text-construction-600 hover:text-construction-700 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Обновить
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'integrations':
        return renderIntegrationsSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-steel-900 mb-2">Настройки</h1>
        <p className="text-steel-600 text-lg">Управление параметрами системы и персонализация</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Боковое меню */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-construction-50 text-construction-700 border border-construction-200'
                      : 'text-steel-600 hover:bg-steel-50 hover:text-steel-900'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Основной контент */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-steel-100">
            {renderTabContent()}
            
            {/* Кнопка сохранения */}
            <div className="mt-8 pt-6 border-t border-steel-200">
              <div className="flex justify-end space-x-4">
                <motion.button
                  className="px-6 py-3 border border-steel-300 text-steel-700 rounded-xl hover:bg-steel-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Отмена
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-construction-500 to-construction-600 text-white rounded-xl hover:shadow-construction transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Сохранить изменения
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage; 