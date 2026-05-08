import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const faqData = [
  {
    id: 'item-1',
    question: "Как изменить мой тарифный план?",
    answer: "Вы можете легко изменить свой тарифный план в разделе 'Финансы' -> 'Тарифы'. Выберите новый план и нажмите кнопку подключения. Если вы повышаете тариф, разница в стоимости будет пересчитана автоматически."
  },
  {
    id: 'item-2',
    question: "Что делать, если я забыл пароль от своего аккаунта?",
    answer: "Если вы забыли пароль, на странице входа в систему кликните по ссылке 'Забыли пароль?'. Вам будет предложено ввести адрес электронной почты, связанный с вашим аккаунтом. После этого на указанный email придет письмо с подробными инструкциями по сбросу пароля."
  },
  {
    id: 'item-3',
    question: "Как я могу пополнить баланс моего счета?",
    answer: "В разделе 'Финансы' нажмите кнопку 'Пополнить баланс'. Вы сможете выбрать удобный способ оплаты (карта, счет для юр. лиц) и указать сумму. Средства зачисляются мгновенно."
  },
  {
    id: 'item-4',
    question: "Безопасно ли хранить данные моих проектов в системе?",
    answer: "Мы уделяем максимальное внимание безопасности ваших данных. Все данные проектов шифруются как при передаче, так и при хранении на наших серверах. Мы используем современные протоколы безопасности и регулярно проводим аудиты системы."
  },
  {
    id: 'item-5',
    question: "Могу ли я добавить других пользователей?",
    answer: "Да, в зависимости от вашего тарифного плана, вы можете добавлять прорабов или администраторов. Перейдите в раздел 'Участники', чтобы отправить приглашения новым пользователям по email."
  },
  {
    id: 'item-6',
    question: "Как добавить нового сотрудника в команду?",
    answer: "Перейдите в раздел 'Участники', нажмите кнопку 'Пригласить' и заполните email и роль сотрудника. Он получит письмо с ссылкой для регистрации."
  },
  {
    id: 'item-7',
    question: "Можно ли настроить уведомления?",
    answer: "Да, в вашем профиле в разделе настроек вы можете выбрать, какие уведомления вы хотите получать (Email, Push) и по каким событиям."
  }
];

export function FaqSection() {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-bold">Часто задаваемые вопросы</CardTitle>
        <CardDescription>
          Ответы на самые популярные вопросы о работе с платформой
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqData.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border border-border rounded-xl px-4 bg-card shadow-sm">
              <AccordionTrigger className="text-left font-medium py-4 hover:no-underline hover:text-primary transition-colors">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

