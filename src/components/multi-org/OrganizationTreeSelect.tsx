import { useState } from 'react';
import { ChevronDownIcon, BuildingLibraryIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import type { OrganizationTree } from '@/types/multi-organization-v2';

interface OrganizationTreeSelectProps {
  tree: OrganizationTree;
  value: number[];
  onChange: (selectedIds: number[]) => void;
  multiSelect?: boolean;
}

export const OrganizationTreeSelect = ({
  tree,
  value,
  onChange,
  multiSelect = true,
}: OrganizationTreeSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (orgId: number) => {
    if (multiSelect) {
      const newValue = value.includes(orgId)
        ? value.filter(id => id !== orgId)
        : [...value, orgId];
      onChange(newValue);
    } else {
      onChange([orgId]);
    }
  };

  const handleParentToggle = () => {
    if (value.includes(tree.current.id)) {
      onChange([]);
    } else {
      const allIds = [tree.current.id, ...tree.children.map(c => c.id)];
      onChange(allIds);
    }
  };

  const getSelectedLabel = () => {
    if (value.length === 0) return 'Выберите организации';
    if (value.length === 1) {
      const org = value[0] === tree.current.id 
        ? tree.current 
        : tree.children.find(c => c.id === value[0]);
      return org?.name || 'Организация';
    }
    return `Выбрано: ${value.length}`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-sm text-gray-700">{getSelectedLabel()}</span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2 space-y-1">
            <div
              onClick={handleParentToggle}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(tree.current.id)}
                onChange={handleParentToggle}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <BuildingLibraryIcon className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{tree.current.name}</div>
                <div className="text-xs text-gray-500">{tree.current.projects_count} проектов</div>
              </div>
            </div>

            <div className="ml-6 space-y-1">
              {tree.children.map(child => (
                <div
                  key={child.id}
                  onClick={() => handleToggle(child.id)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(child.id)}
                    onChange={() => handleToggle(child.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{child.name}</div>
                    <div className="text-xs text-gray-500">
                      {child.projects_count} проектов
                      {!child.is_active && <span className="ml-2 text-red-500">(неактивна)</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {value.length > 0 && (
            <div className="p-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
              >
                Сбросить выбор
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

