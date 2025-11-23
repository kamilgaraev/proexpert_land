import { Link } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { NAV_LINKS, SOLUTIONS } from '../../constants/landing-content';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-construction-600 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ProHelper</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-sm">
              ERP-конструктор для строительного бизнеса. 
              Стройте системно, управляйте гибко.
            </p>
            <div className="space-y-3">
              <a href="tel:+79991234567" className="flex items-center gap-3 hover:text-construction-500 transition-colors">
                <PhoneIcon className="w-5 h-5" />
                +7 (999) 123-45-67
              </a>
              <a href="mailto:info@prohelper.ru" className="flex items-center gap-3 hover:text-construction-500 transition-colors">
                <EnvelopeIcon className="w-5 h-5" />
                info@prohelper.ru
              </a>
              <div className="flex items-center gap-3 text-slate-500">
                <MapPinIcon className="w-5 h-5" />
                Москва, ул. Строителей, 25
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-bold mb-4">Навигация</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-construction-500 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-white font-bold mb-4">Решения</h3>
            <ul className="space-y-2">
              {SOLUTIONS.map((sol) => (
                <li key={sol.id}>
                  <Link to="/solutions" className="hover:text-construction-500 transition-colors">
                    {sol.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div>
            &copy; {currentYear} ProHelper. Все права защищены.
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Конфиденциальность</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Оферта</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
