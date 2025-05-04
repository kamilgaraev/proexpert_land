import React from 'react';
import Placeholder from '@components/Placeholder';
import { ProjectIcon } from '@components/icons/DashboardIcons';

const ProjectsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-secondary-800 mb-6">Проекты</h1>
      
      <Placeholder 
        title="Управление проектами" 
        description="Здесь вы сможете создавать и управлять строительными проектами, отслеживать их статус и прогресс выполнения."
        icon={<ProjectIcon />}
      />
    </div>
  );
};

export default ProjectsPage; 