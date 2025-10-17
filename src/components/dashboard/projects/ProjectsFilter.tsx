interface ProjectsFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: 'all' | 'active' | 'archived';
  onStatusChange: (status: 'all' | 'active' | 'archived') => void;
}

export const ProjectsFilter = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange
}: ProjectsFilterProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск проектов по названию или адресу..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 hidden md:block">Статус:</span>
          <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => onStatusChange('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => onStatusChange('active')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-l border-r border-gray-300 ${
                selectedStatus === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Активные
            </button>
            <button
              onClick={() => onStatusChange('archived')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedStatus === 'archived'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Архив
            </button>
          </div>
        </div>
      </div>

      {searchQuery && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Результаты поиска для: <span className="font-semibold">"{searchQuery}"</span>
          </p>
          <button
            onClick={() => onSearchChange('')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Очистить
          </button>
        </div>
      )}
    </div>
  );
};

