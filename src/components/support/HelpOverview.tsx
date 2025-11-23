import { Link } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  BookOpenIcon,
  AcademicCapIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HelpOverviewProps {
  onTabChange: (tab: string) => void;
}

export function HelpOverview({ onTabChange }: HelpOverviewProps) {
  const supportChannels = [
    {
      title: "Телефон поддержки",
      description: "Звоните в рабочие часы",
      contact: "+7 (800) 123-45-67",
      icon: PhoneIcon,
      color: "bg-orange-50 text-orange-600",
      hours: "Пн-Пт: 9:00-18:00"
    },
    {
      title: "Email поддержка",
      description: "Отвечаем в течение 2 часов",
      contact: "support@prohelper.pro",
      icon: EnvelopeIcon,
      color: "bg-blue-50 text-blue-600",
      hours: "Круглосуточно"
    },
    {
      title: "Онлайн чат",
      description: "Мгновенная помощь",
      contact: "Открыть чат",
      icon: ChatBubbleLeftRightIcon,
      color: "bg-emerald-50 text-emerald-600",
      hours: "Пн-Пт: 9:00-22:00"
    }
  ];

  const resources = [
    {
      title: "Видеоуроки",
      description: "Обучающие ролики по всем функциям",
      icon: VideoCameraIcon,
      color: "bg-orange-100 text-orange-700",
      items: ["Начало работы", "Управление командой", "Финансы", "Настройки"]
    },
    {
      title: "База знаний",
      description: "Подробные статьи и инструкции",
      icon: BookOpenIcon,
      color: "bg-blue-100 text-blue-700",
      items: ["Руководства", "Лучшие практики", "Советы", "Обновления"]
    },
    {
      title: "Вебинары",
      description: "Живые обучающие сессии",
      icon: AcademicCapIcon,
      color: "bg-purple-100 text-purple-700",
      items: ["Еженедельные вебинары", "Специальные темы", "Q&A сессии", "Записи"]
    }
  ];

  return (
    <div className="space-y-12">
      {/* Быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-all cursor-pointer border-border group" onClick={() => onTabChange('support')}>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground mb-1">Техподдержка</h3>
              <p className="text-sm text-muted-foreground mb-3">Создайте заявку для решения технических вопросов</p>
              <span className="text-sm font-medium text-primary group-hover:underline">Написать обращение →</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all cursor-pointer border-border group" onClick={() => onTabChange('faq')}>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground mb-1">FAQ</h3>
              <p className="text-sm text-muted-foreground mb-3">Часто задаваемые вопросы с подробными ответами</p>
              <span className="text-sm font-medium text-blue-600 group-hover:underline">Читать ответы →</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all cursor-pointer border-border group">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
              <EnvelopeIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground mb-1">Email</h3>
              <p className="text-sm text-muted-foreground mb-3">Напишите нам на почту для детального обсуждения</p>
              <a href="mailto:support@prohelper.pro" className="text-sm font-medium text-emerald-600 group-hover:underline">support@prohelper.pro →</a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Каналы поддержки */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Способы связи</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportChannels.map((channel, index) => (
            <Card key={index} className="border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", channel.color)}>
                    <channel.icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-bold text-foreground">{channel.title}</h3>
                    <p className="text-xs text-muted-foreground">{channel.description}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground">{channel.contact}</p>
                  <div className="flex items-center text-muted-foreground text-xs font-medium">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {channel.hours}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Обучающие ресурсы */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Обучающие материалы</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <Card key={index} className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", resource.color)}>
                    <resource.icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-bold text-foreground">{resource.title}</h3>
                    <p className="text-xs text-muted-foreground">{resource.description}</p>
                  </div>
                </div>
                <ul className="space-y-2 mt-4">
                  {resource.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-2"></div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" className="w-full mt-4">
                   Открыть раздел
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

