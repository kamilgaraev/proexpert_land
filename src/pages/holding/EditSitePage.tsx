import React from 'react';
import { useParams } from 'react-router-dom';
import SiteEditor from '@components/holding/sites/SiteEditor';

const EditSitePage: React.FC = () => {
  const { holdingId, siteId } = useParams<{ holdingId: string; siteId: string }>();
  
  if (!holdingId || !siteId) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка</h3>
        <p className="text-gray-600">Параметры сайта не найдены</p>
      </div>
    );
  }

  return (
    <SiteEditor 
      siteId={parseInt(siteId)} 
      holdingId={parseInt(holdingId)} 
    />
  );
};

export default EditSitePage;
