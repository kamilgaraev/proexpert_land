import React from 'react';
import Placeholder from '@components/Placeholder';
import { DocumentIcon } from '@components/icons/DashboardIcons';

const DocumentsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-secondary-800 mb-6">Документы</h1>
      
      <Placeholder 
        title="Управление документами" 
        description="Здесь вы сможете создавать, хранить и управлять документами проектов: договоры, сметы, акты выполненных работ и другие важные файлы."
        icon={<DocumentIcon />}
      />
    </div>
  );
};

export default DocumentsPage; 