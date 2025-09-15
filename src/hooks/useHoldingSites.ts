import { useState, useCallback, useEffect } from 'react';
import { holdingSitesService } from '@utils/api';
import { toast } from 'react-toastify';
import type {
  HoldingSite,
  SiteContentBlock,
  SiteAsset,
  SiteTemplate,
  CreateSiteRequest,
  UpdateSiteRequest,
  CreateBlockRequest,
  UpdateBlockRequest,
  SiteFilters,
  BlockFilters,
  AssetFilters
} from '@/types/holding-sites';

export const useHoldingSites = () => {
  const [sites, setSites] = useState<HoldingSite[]>([]);
  const [currentSite, setCurrentSite] = useState<HoldingSite | null>(null);
  const [blocks, setBlocks] = useState<SiteContentBlock[]>([]);
  const [assets, setAssets] = useState<SiteAsset[]>([]);
  const [templates, setTemplates] = useState<SiteTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получение списка сайтов холдинга
  const fetchSites = useCallback(async (holdingId: number, filters?: SiteFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.getSites(holdingId, filters);
      
      if (response.data && response.data.success) {
        setSites(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки сайтов');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки сайтов';
      setError(errorMessage);
      console.error('Ошибка при загрузке сайтов:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание нового сайта
  const createSite = useCallback(async (holdingId: number, siteData: CreateSiteRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.createSite(holdingId, siteData);
      
      if (response.data && response.data.success) {
        const newSite = response.data.data;
        setSites(prev => [...prev, newSite]);
        toast.success('Сайт успешно создан');
        return newSite;
      } else {
        const errorMessage = response.data?.message || 'Ошибка создания сайта';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка создания сайта';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка при создании сайта:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение данных сайта
  const fetchSite = useCallback(async (siteId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.getSite(siteId);
      
      if (response.data && response.data.success) {
        const siteData = response.data.data;
        setCurrentSite(siteData);
        if (siteData.blocks) {
          setBlocks(siteData.blocks);
        }
        if (siteData.assets) {
          setAssets(siteData.assets);
        }
        return siteData;
      } else {
        setError(response.data?.message || 'Ошибка загрузки сайта');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки сайта';
      setError(errorMessage);
      console.error('Ошибка при загрузке сайта:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление сайта
  const updateSite = useCallback(async (siteId: number, siteData: UpdateSiteRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.updateSite(siteId, siteData);
      
      if (response.data && response.data.success) {
        const updatedSite = response.data.data;
        setSites(prev => prev.map(site => 
          site.id === siteId ? { ...site, ...updatedSite } : site
        ));
        if (currentSite && currentSite.id === siteId) {
          setCurrentSite({ ...currentSite, ...updatedSite });
        }
        toast.success('Сайт успешно обновлен');
        return updatedSite;
      } else {
        const errorMessage = response.data?.message || 'Ошибка обновления сайта';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка обновления сайта';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка при обновлении сайта:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentSite]);

  // Публикация сайта
  const publishSite = useCallback(async (siteId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.publishSite(siteId);
      
      if (response.data && response.data.success) {
        setSites(prev => prev.map(site => 
          site.id === siteId ? { ...site, status: 'published', is_published: true } : site
        ));
        if (currentSite && currentSite.id === siteId) {
          setCurrentSite({ ...currentSite, status: 'published', is_published: true });
        }
        toast.success(response.data.message || 'Сайт успешно опубликован');
        return true;
      } else {
        const errorMessage = response.data?.message || 'Ошибка публикации сайта';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка публикации сайта';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка при публикации сайта:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentSite]);

  // Удаление сайта
  const deleteSite = useCallback(async (siteId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.deleteSite(siteId);
      
      if (response.data && response.data.success) {
        setSites(prev => prev.filter(site => site.id !== siteId));
        if (currentSite && currentSite.id === siteId) {
          setCurrentSite(null);
        }
        toast.success('Сайт успешно удален');
        return true;
      } else {
        const errorMessage = response.data?.message || 'Ошибка удаления сайта';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка удаления сайта';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка при удалении сайта:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentSite]);

  // Получение шаблонов
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.getTemplates();
      
      if (response.data && response.data.success) {
        setTemplates(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки шаблонов');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки шаблонов';
      setError(errorMessage);
      console.error('Ошибка при загрузке шаблонов:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sites,
    currentSite,
    templates,
    loading,
    error,
    fetchSites,
    createSite,
    fetchSite,
    updateSite,
    publishSite,
    deleteSite,
    fetchTemplates,
    setSites,
    setCurrentSite,
    setError
  };
};

export const useSiteBlocks = (siteId: number) => {
  const [blocks, setBlocks] = useState<SiteContentBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получение блоков сайта
  const fetchBlocks = useCallback(async (filters?: BlockFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.getBlocks(siteId, filters);
      
      if (response.data && response.data.success) {
        setBlocks(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки блоков');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки блоков';
      setError(errorMessage);
      console.error('Ошибка при загрузке блоков:', err);
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  // Создание блока
  const createBlock = useCallback(async (blockData: CreateBlockRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.createBlock(siteId, blockData);
      
      if (response.data && response.data.success) {
        const newBlock = response.data.data;
        setBlocks(prev => [...prev, newBlock]);
        toast.success('Блок успешно создан');
        return newBlock;
      } else {
        const errorMessage = response.data?.message || 'Ошибка создания блока';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка создания блока';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка при создании блока:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  // Обновление блока
  const updateBlock = useCallback(async (blockId: number, blockData: UpdateBlockRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.updateBlock(siteId, blockId, blockData);
      
      if (response.data && response.data.success) {
        const updatedBlock = response.data.data;
        setBlocks(prev => prev.map(block => 
          block.id === blockId ? { ...block, ...updatedBlock } : block
        ));
        toast.success('Блок успешно обновлен');
        return updatedBlock;
      } else {
        const errorMessage = response.data?.message || 'Ошибка обновления блока';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка обновления блока';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка при обновлении блока:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  // Публикация блока
  const publishBlock = useCallback(async (blockId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.publishBlock(siteId, blockId);
      
      if (response.data && response.data.success) {
        setBlocks(prev => prev.map(block => 
          block.id === blockId ? { ...block, status: 'published' } : block
        ));
        toast.success('Блок успешно опубликован');
        return true;
      } else {
        const errorMessage = response.data?.message || 'Ошибка публикации блока';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка публикации блока';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка при публикации блока:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  // Дублирование блока
  const duplicateBlock = useCallback(async (blockId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.duplicateBlock(siteId, blockId);
      
      if (response.data && response.data.success) {
        const duplicatedBlock = response.data.data;
        setBlocks(prev => [...prev, duplicatedBlock]);
        toast.success('Блок успешно дублирован');
        return duplicatedBlock;
      } else {
        const errorMessage = response.data?.message || 'Ошибка дублирования блока';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка дублирования блока';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка при дублировании блока:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  // Удаление блока
  const deleteBlock = useCallback(async (blockId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.deleteBlock(siteId, blockId);
      
      if (response.data && response.data.success) {
        setBlocks(prev => prev.filter(block => block.id !== blockId));
        toast.success('Блок успешно удален');
        return true;
      } else {
        const errorMessage = response.data?.message || 'Ошибка удаления блока';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка удаления блока';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка при удалении блока:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  // Изменение порядка блоков
  const reorderBlocks = useCallback(async (blockOrder: number[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.reorderBlocks(siteId, blockOrder);
      
      if (response.data && response.data.success) {
        const reorderedBlocks = blockOrder.map(id => 
          blocks.find(block => block.id === id)!
        ).filter(Boolean);
        
        setBlocks(reorderedBlocks);
        toast.success('Порядок блоков обновлен');
        return true;
      } else {
        const errorMessage = response.data?.message || 'Ошибка изменения порядка блоков';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка изменения порядка блоков';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка при изменении порядка блоков:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [siteId, blocks]);

  useEffect(() => {
    if (siteId) {
      fetchBlocks();
    }
  }, [siteId, fetchBlocks]);

  return {
    blocks,
    loading,
    error,
    fetchBlocks,
    createBlock,
    updateBlock,
    publishBlock,
    duplicateBlock,
    deleteBlock,
    reorderBlocks,
    setBlocks,
    setError
  };
};

export const useSiteAssets = (siteId: number) => {
  const [assets, setAssets] = useState<SiteAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Получение медиафайлов
  const fetchAssets = useCallback(async (filters?: AssetFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.getAssets(siteId, filters);
      
      if (response.data && response.data.success) {
        setAssets(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки файлов');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки файлов';
      setError(errorMessage);
      console.error('Ошибка при загрузке файлов:', err);
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  // Загрузка файла
  const uploadAsset = useCallback(async (file: File, usageContext?: string) => {
    try {
      setLoading(true);
      setUploadProgress(0);
      setError(null);
      
      const response = await holdingSitesService.uploadAsset(siteId, file, usageContext);
      
      if (response.data && response.data.success) {
        const newAsset = response.data.data;
        setAssets(prev => [...prev, newAsset]);
        setUploadProgress(100);
        toast.success('Файл успешно загружен');
        return newAsset;
      } else {
        const errorMessage = response.data?.message || 'Ошибка загрузки файла';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки файла';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка при загрузке файла:', err);
      return null;
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }, [siteId]);

  // Обновление метаданных файла
  const updateAsset = useCallback(async (assetId: number, metadata: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.updateAsset(siteId, assetId, metadata);
      
      if (response.data && response.data.success) {
        const updatedAsset = response.data.data;
        setAssets(prev => prev.map(asset => 
          asset.id === assetId ? { ...asset, ...updatedAsset } : asset
        ));
        toast.success('Метаданные файла обновлены');
        return updatedAsset;
      } else {
        const errorMessage = response.data?.message || 'Ошибка обновления файла';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка обновления файла';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка при обновлении файла:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  // Удаление файла
  const deleteAsset = useCallback(async (assetId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingSitesService.deleteAsset(siteId, assetId);
      
      if (response.data && response.data.success) {
        setAssets(prev => prev.filter(asset => asset.id !== assetId));
        toast.success('Файл успешно удален');
        return true;
      } else {
        const errorMessage = response.data?.message || 'Ошибка удаления файла';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка удаления файла';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка при удалении файла:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    if (siteId) {
      fetchAssets();
    }
  }, [siteId, fetchAssets]);

  return {
    assets,
    loading,
    error,
    uploadProgress,
    fetchAssets,
    uploadAsset,
    updateAsset,
    deleteAsset,
    setAssets,
    setError
  };
};
