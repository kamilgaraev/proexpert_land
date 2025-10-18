import { useState, useCallback } from 'react';
import { holdingLandingService } from '@/utils/api';
import type { 
  HoldingLanding, 
  LandingBlock, 
  LandingAsset,
  UpdateLandingRequest,
  CreateBlockRequest,
  UpdateBlockRequest,
  UpdateAssetRequest,
  BlockFilters,
  AssetFilters
} from '@/types/holding-landing';

// Основной хук для управления лендингом холдинга
export const useHoldingLanding = () => {
  const [landing, setLanding] = useState<HoldingLanding | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLanding = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await holdingLandingService.getLanding();
      if (response.status === 200) {
        setLanding(response.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки лендинга');
      }
    } catch (err) {
      setError('Ошибка сети при загрузке лендинга');
      console.error('Landing fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLanding = useCallback(async (data: UpdateLandingRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await holdingLandingService.updateLanding(data);
      if (response.status === 200) {
        setLanding(prev => prev ? { ...prev, ...response.data } : response.data);
        return true;
      } else {
        setError(response.data?.message || 'Ошибка обновления лендинга');
        return false;
      }
    } catch (err) {
      setError('Ошибка сети при обновлении лендинга');
      console.error('Landing update error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const publishLanding = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await holdingLandingService.publishLanding();
      if (response.status === 200) {
        setLanding(prev => prev ? { ...prev, status: 'published', is_published: true } : null);
        return response.data;
      } else {
        setError(response.data?.message || 'Ошибка публикации лендинга');
        return null;
      }
    } catch (err) {
      setError('Ошибка сети при публикации лендинга');
      console.error('Landing publish error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    landing,
    loading,
    error,
    fetchLanding,
    updateLanding,
    publishLanding
  };
};

// Хук для управления блоками лендинга
export const useLandingBlocks = () => {
  const [blocks, setBlocks] = useState<LandingBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlocks = useCallback(async (filters?: BlockFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await holdingLandingService.getBlocks(filters);
      if (response.status === 200) {
        const blocksData = Array.isArray(response.data) ? response.data : [];
        setBlocks(blocksData);
      } else {
        setError(response.data?.message || 'Ошибка загрузки блоков');
        setBlocks([]);
      }
    } catch (err) {
      setError('Ошибка сети при загрузке блоков');
      setBlocks([]);
      console.error('Blocks fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBlock = useCallback(async (blockData: CreateBlockRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await holdingLandingService.createBlock(blockData);
      if (response.status === 201 || response.status === 200) {
        setBlocks(prev => [...prev, response.data]);
        return response.data;
      } else {
        setError(response.data?.message || 'Ошибка создания блока');
        return null;
      }
    } catch (err) {
      setError('Ошибка сети при создании блока');
      console.error('Block create error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBlock = useCallback(async (blockId: number, blockData: UpdateBlockRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await holdingLandingService.updateBlock(blockId, blockData);
      if (response.status === 200) {
        setBlocks(prev => prev.map(block => 
          block.id === blockId ? { ...block, ...response.data } : block
        ));
        return true;
      } else {
        setError(response.data?.message || 'Ошибка обновления блока');
        return false;
      }
    } catch (err) {
      setError('Ошибка сети при обновлении блока');
      console.error('Block update error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const publishBlock = useCallback(async (blockId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await holdingLandingService.publishBlock(blockId);
      if (response.status === 200) {
        setBlocks(prev => prev.map(block => 
          block.id === blockId ? { ...block, status: 'published', published_at: new Date().toISOString() } : block
        ));
        return true;
      } else {
        setError(response.data?.message || 'Ошибка публикации блока');
        return false;
      }
    } catch (err) {
      setError('Ошибка сети при публикации блока');
      console.error('Block publish error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateBlock = useCallback(async (blockId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await holdingLandingService.duplicateBlock(blockId);
      if (response.status === 201 || response.status === 200) {
        setBlocks(prev => [...prev, response.data]);
        return response.data;
      } else {
        setError(response.data?.message || 'Ошибка дублирования блока');
        return null;
      }
    } catch (err) {
      setError('Ошибка сети при дублировании блока');
      console.error('Block duplicate error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBlock = useCallback(async (blockId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await holdingLandingService.deleteBlock(blockId);
      if (response.status === 200 || response.status === 204) {
        setBlocks(prev => prev.filter(block => block.id !== blockId));
        return true;
      } else {
        setError(response.data?.message || 'Ошибка удаления блока');
        return false;
      }
    } catch (err) {
      setError('Ошибка сети при удалении блока');
      console.error('Block delete error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reorderBlocks = useCallback(async (blockOrder: { id: number; sort_order: number }[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await holdingLandingService.reorderBlocks(blockOrder);
      if (response.status === 200) {
        const sortedBlocks = [...blocks].sort((a, b) => {
          const aOrder = blockOrder.find(o => o.id === a.id)?.sort_order || 0;
          const bOrder = blockOrder.find(o => o.id === b.id)?.sort_order || 0;
          return aOrder - bOrder;
        });
        setBlocks(sortedBlocks);
        return true;
      } else {
        setError(response.data?.message || 'Ошибка изменения порядка блоков');
        return false;
      }
    } catch (err) {
      setError('Ошибка сети при изменении порядка блоков');
      console.error('Blocks reorder error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [blocks]);

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
    reorderBlocks
  };
};

// Хук для управления медиафайлами лендинга
export const useLandingAssets = () => {
  const [assets, setAssets] = useState<LandingAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async (filters?: AssetFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await holdingLandingService.getAssets(filters);
      if (response.status === 200) {
        const assetsData = Array.isArray(response.data) ? response.data : [];
        setAssets(assetsData);
      } else {
        setError(response.data?.message || 'Ошибка загрузки медиафайлов');
        setAssets([]);
      }
    } catch (err) {
      setError('Ошибка сети при загрузке медиафайлов');
      setAssets([]);
      console.error('Assets fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAsset = useCallback(async (file: File, usageContext?: string, metadata?: any) => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await holdingLandingService.uploadAsset(file, usageContext, metadata);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.status === 201 || response.status === 200) {
        setAssets(prev => [...prev, response.data]);
        return response.data;
      } else {
        setError(response.data?.message || 'Ошибка загрузки файла');
        return null;
      }
    } catch (err) {
      setError('Ошибка сети при загрузке файла');
      console.error('Asset upload error:', err);
      return null;
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const updateAsset = useCallback(async (assetId: number, metadata: UpdateAssetRequest['metadata']) => {
    setLoading(true);
    setError(null);
    try {
      const response = await holdingLandingService.updateAsset(assetId, metadata);
      if (response.status === 200) {
        setAssets(prev => prev.map(asset => 
          asset.id === assetId ? { ...asset, metadata: { ...asset.metadata, ...metadata } } : asset
        ));
        return true;
      } else {
        setError(response.data?.message || 'Ошибка обновления файла');
        return false;
      }
    } catch (err) {
      setError('Ошибка сети при обновлении файла');
      console.error('Asset update error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAsset = useCallback(async (assetId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await holdingLandingService.deleteAsset(assetId);
      if (response.status === 200 || response.status === 204) {
        setAssets(prev => prev.filter(asset => asset.id !== assetId));
        return true;
      } else {
        setError(response.data?.message || 'Ошибка удаления файла');
        return false;
      }
    } catch (err) {
      setError('Ошибка сети при удалении файла');
      console.error('Asset delete error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Утилитарные функции
  const getAssetsByType = useCallback((type: 'image' | 'video' | 'document') => {
    return assets.filter(asset => asset.asset_type === type);
  }, [assets]);

  const getAssetsByContext = useCallback((context: string) => {
    return assets.filter(asset => asset.usage_context === context);
  }, [assets]);

  const getOptimizedUrl = useCallback((asset: LandingAsset, size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium') => {
    if (asset.asset_type === 'image' && asset.optimized_url) {
      return asset.optimized_url[size] || asset.public_url;
    }
    return asset.public_url;
  }, []);

  return {
    assets,
    loading,
    uploadProgress,
    error,
    fetchAssets,
    uploadAsset,
    updateAsset,
    deleteAsset,
    getAssetsByType,
    getAssetsByContext,
    getOptimizedUrl
  };
};
