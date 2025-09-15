import React from 'react';
import { useParams } from 'react-router-dom';
import HoldingSitesList from '@components/holding/sites/HoldingSitesList';

const HoldingSitesPage: React.FC = () => {
  const { holdingId } = useParams<{ holdingId: string }>();
  
  if (!holdingId) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка</h3>
        <p className="text-gray-600">ID холдинга не найден</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <HoldingSitesList holdingId={parseInt(holdingId)} />
    </div>
  );
};

export default HoldingSitesPage;
