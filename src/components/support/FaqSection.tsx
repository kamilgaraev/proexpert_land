import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"

const faqData = [
  {
    id: 'item-1',
    question: "Как изменить набор бизнес-пакетов?",
    answer: "Откройте раздел «Пакеты и оплата» в личном кабинете. Добавление рассчитывается перед оплатой, а отключение действует со следующего фиксированного расчетного периода."
  },
  {
    id: 'item-2',
    question: "Что делать, если я забыл пароль от своего аккаунта?",
    answer: "Если вы забыли пароль, на странице входа в систему кликните по ссылке 'Забыли пароль?'. Вам будет предложено ввести адрес электронной почты, связанный с вашим аккаунтом. После этого на указанный email придет письмо с подробными инструкциями по сбросу пароля."
  },
  {
    id: 'item-3',
    question: "Как оплачиваются пакеты?",
    answer: "Пакеты оплачиваются прямым платежом на 30 дней. При задержке продления действует семидневный льготный период, а расчетная дата не переносится."
  },
  {
    id: 'item-4',
    question: "Как управлять доступом сотрудников?",
    answer: "Откройте раздел «Сотрудники и доступ». При добавлении или редактировании сотрудника выберите роль в соответствии с его задачами. Доступные действия зависят от прав роли и подключённых возможностей организации."
  },
  {
    id: 'item-7',
    question: "Что указать в обращении в поддержку?",
    answer: "Перейдите на вкладку «Поддержка». Укажите имя, почту для ответа, тип обращения и тему. В сообщении опишите последовательность действий, ожидаемый результат и то, что произошло. Пароли и платёжные реквизиты отправлять не нужно."
  }
];

export function FaqSection() {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <h2 className="text-2xl font-semibold">Часто задаваемые вопросы</h2>
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

