import PageLayout from '../../components/shared/PageLayout';
import { 
  CodeBracketIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon,
  GlobeAltIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

const ApiPage = () => {
  const endpoints = [
    {
      method: 'GET',
      endpoint: '/api/v1/projects',
      description: 'Получить список всех проектов',
      response: '200 OK'
    },
    {
      method: 'POST',
      endpoint: '/api/v1/projects',
      description: 'Создать новый проект',
      response: '201 Created'
    },
    {
      method: 'GET',
      endpoint: '/api/v1/projects/{id}',
      description: 'Получить детали проекта',
      response: '200 OK'
    },
    {
      method: 'PUT',
      endpoint: '/api/v1/projects/{id}',
      description: 'Обновить проект',
      response: '200 OK'
    },
    {
      method: 'DELETE',
      endpoint: '/api/v1/projects/{id}',
      description: 'Удалить проект',
      response: '204 No Content'
    },
    {
      method: 'GET',
      endpoint: '/api/v1/tasks',
      description: 'Получить список задач',
      response: '200 OK'
    },
    {
      method: 'POST',
      endpoint: '/api/v1/tasks',
      description: 'Создать новую задачу',
      response: '201 Created'
    },
    {
      method: 'GET',
      endpoint: '/api/v1/reports',
      description: 'Получить отчеты',
      response: '200 OK'
    }
  ];

  const codeExamples = [
    {
      title: 'Авторизация',
      language: 'curl',
      code: `curl -X POST https://api.prohelper.pro/api/v1/landing/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'`
    },
    {
      title: 'Получение проектов',
      language: 'javascript',
      code: `const response = await fetch('https://api.prohelper.pro/api/v1/projects', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
});

const projects = await response.json();
console.log(projects);`
    },
    {
      title: 'Создание задачи',
      language: 'python',
      code: `import requests

url = "https://api.prohelper.pro/api/v1/tasks"
headers = {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
}

data = {
    "title": "Установка окон",
    "description": "Установить окна в квартире 25",
    "project_id": 123,
    "assignee_id": 456,
    "due_date": "2024-02-15"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`
    }
  ];

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Безопасность',
      description: 'OAuth 2.0, JWT токены, HTTPS шифрование'
    },
    {
      icon: ClockIcon,
      title: 'Высокая скорость',
      description: 'Время отклика < 100ms, 99.9% uptime'
    },
    {
      icon: GlobeAltIcon,
      title: 'Глобальная доступность',
      description: 'CDN сеть для быстрого доступа из любой точки'
    },
    {
      icon: DocumentTextIcon,
      title: 'Полная документация',
      description: 'Детальная документация с примерами кода'
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout 
      title="API ProHelper" 
      subtitle="Мощный REST API для интеграции с вашими системами"
    >
      <div className="mb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100">
                <div className="w-12 h-12 bg-construction-100 rounded-xl flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-construction-600" />
                </div>
                <h3 className="text-lg font-semibold text-steel-900 mb-2">{feature.title}</h3>
                <p className="text-steel-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center">
                <CommandLineIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-steel-900">Основные эндпоинты</h2>
            </div>

            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-md border border-concrete-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm text-steel-800 font-mono">{endpoint.endpoint}</code>
                    </div>
                    <span className="text-xs text-green-600 font-medium">{endpoint.response}</span>
                  </div>
                  <p className="text-steel-600 text-sm">{endpoint.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-safety-500 to-safety-600 rounded-lg flex items-center justify-center">
                <CodeBracketIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-steel-900">Примеры кода</h2>
            </div>

            <div className="space-y-6">
              {codeExamples.map((example, index) => (
                <div key={index} className="bg-steel-900 rounded-lg overflow-hidden">
                  <div className="bg-steel-800 px-4 py-2 flex items-center justify-between">
                    <h3 className="text-white font-medium">{example.title}</h3>
                    <span className="text-steel-400 text-sm">{example.language}</span>
                  </div>
                  <pre className="p-4 text-green-400 text-sm overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-concrete-100 mb-16">
          <h2 className="text-2xl font-bold text-steel-900 mb-6">Быстрый старт</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-construction-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-construction-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-steel-900 mb-2">Получите токен</h3>
              <p className="text-steel-600 text-sm">Зарегистрируйтесь и получите API ключ в личном кабинете</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-safety-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-safety-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-steel-900 mb-2">Изучите документацию</h3>
              <p className="text-steel-600 text-sm">Ознакомьтесь с примерами и описанием методов</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-earth-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-earth-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-steel-900 mb-2">Начните интеграцию</h3>
              <p className="text-steel-600 text-sm">Используйте API для подключения ваших систем</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-construction-600 to-safety-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Готовы начать разработку?</h3>
          <p className="text-lg mb-6 opacity-90">
            Получите бесплатный доступ к API и начните интеграцию уже сегодня
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-construction-600 font-semibold rounded-lg hover:shadow-lg transition-all">
              Получить API ключ
            </button>
            <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-construction-600 transition-all">
              Полная документация
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ApiPage; 