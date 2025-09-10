import Navbar from '@components/landing/Navbar';
import Hero from '@components/landing/Hero';
import Features from '@components/landing/Features';
import HowItWorks from '@components/landing/HowItWorks';
import ContactForm from '@components/landing/ContactForm';
import Pricing from '@components/landing/Pricing';
import Footer from '@components/landing/Footer';
import { useSEO } from '@hooks/useSEO';

const LandingPage = () => {
  const { addFAQSchema } = useSEO({
    title: "ProHelper - Умная платформа для управления строительными проектами",
    description: "Автоматизируйте строительные процессы с ProHelper: учет материалов, контроль бюджета, координация команд и отчетность в одной платформе. Повышайте эффективность проектов на 40%.",
    keywords: "строительство, управление проектами, учет материалов, строительная отчетность, SaaS для строителей, автоматизация строительства, финансовый контроль, ProHelper",
    type: "website"
  });

  const faqs = [
    {
      question: "Что такое ProHelper?",
      answer: "ProHelper - это умная SaaS-платформа для комплексного управления строительными проектами. Мы объединяем учет материалов, контроль бюджета, координацию команд и отчетность в одной системе."
    },
    {
      question: "Для каких компаний подходит ProHelper?",
      answer: "ProHelper подходит для строительных компаний любого размера: от небольших подрядчиков до крупных корпораций. У нас есть специальные тарифы для малого бизнеса, среднего бизнеса и enterprise решения."
    },
    {
      question: "Есть ли мобильное приложение?",
      answer: "Да, у нас есть мобильное приложение для прорабов, которое позволяет вести учет материалов прямо на объекте, сканировать QR-коды и фиксировать геолокацию."
    },
    {
      question: "Можно ли интегрировать ProHelper с 1С?",
      answer: "Да, ProHelper поддерживает интеграцию с 1С и более чем 200 другими системами. Данные синхронизируются автоматически, что экономит время на ручной ввод."
    }
  ];

  addFAQSchema(faqs);

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-cyber-bg to-slate-900">
      <Navbar />
      <div className="pt-16">
        <Hero />
        <Features />
        <HowItWorks />
        <div className="py-16 lg:py-24 px-4 lg:px-8">
          <div className="container-custom max-w-4xl mx-auto">
            <ContactForm />
          </div>
        </div>
        <Pricing />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage; 