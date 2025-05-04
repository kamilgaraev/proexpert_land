import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="mt-6 text-3xl font-bold text-secondary-900">Страница не найдена</h2>
        <p className="mt-2 text-lg text-secondary-500">
          Извините, страница, которую вы ищете, не существует или была перемещена.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="btn btn-primary"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 