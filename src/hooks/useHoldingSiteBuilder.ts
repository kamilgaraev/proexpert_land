import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NotificationService from '@components/shared/NotificationService';
import {
  BLOCK_LIBRARY,
  FALLBACK_TEMPLATES,
  createBlockPayloadFromTemplate,
} from '@/constants/holdingSiteBuilder';
import {
  BuilderApiError,
  holdingSiteBuilderService,
} from '@/services/holdingSiteBuilderService';
import type {
  BuilderWorkspaceData,
  EditorBlock,
  EditorSite,
  LeadEntry,
  LeadSummary,
  SiteTemplatePreset,
} from '@/types/holding-site-builder';

const SITE_SAVE_DELAY = 700;
const BLOCK_SAVE_DELAY = 700;

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof BuilderApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const sanitizeSitePayload = (site: EditorSite) => ({
  domain: site.domain,
  title: site.title,
  description: site.description,
  logo_url: site.logo_url,
  favicon_url: site.favicon_url,
  theme_config: site.theme_config,
  seo_meta: site.seo_meta,
  analytics_config: site.analytics_config,
});

const sanitizeBlockPayload = (block: EditorBlock) => ({
  title: block.title,
  content: block.content,
  settings: block.settings,
  bindings: block.bindings,
  sort_order: block.sort_order,
  is_active: block.is_active,
});

const mergeRecord = (
  target: Record<string, unknown>,
  patch: Record<string, unknown> | undefined,
): Record<string, unknown> => ({ ...target, ...(patch ?? {}) });

export const useHoldingSiteBuilder = () => {
  const [workspace, setWorkspace] = useState<BuilderWorkspaceData | null>(null);
  const [leads, setLeads] = useState<LeadEntry[]>([]);
  const [leadSummary, setLeadSummary] = useState<LeadSummary | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingSite, setSavingSite] = useState(false);
  const [savingBlocks, setSavingBlocks] = useState<Record<number, boolean>>({});
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirtySite, setDirtySite] = useState(false);
  const [dirtyBlocks, setDirtyBlocks] = useState<Record<number, boolean>>({});

  const workspaceRef = useRef<BuilderWorkspaceData | null>(null);
  const siteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blockTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    workspaceRef.current = workspace;
  }, [workspace]);

  useEffect(() => {
    return () => {
      if (siteTimerRef.current) {
        clearTimeout(siteTimerRef.current);
      }

      Object.values(blockTimersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const replaceWorkspace = useCallback((nextWorkspace: BuilderWorkspaceData) => {
    startTransition(() => {
      setWorkspace(nextWorkspace);
      setSelectedBlockId((currentSelected) => {
        if (currentSelected && nextWorkspace.blocks.some((block) => block.id === currentSelected)) {
          return currentSelected;
        }

        return nextWorkspace.blocks[0]?.id ?? null;
      });
    });
  }, []);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [workspaceData, leadSummaryData, leadEntries] = await Promise.all([
        holdingSiteBuilderService.getWorkspace(),
        holdingSiteBuilderService.getLeadSummary(),
        holdingSiteBuilderService.getLeads(),
      ]);

      replaceWorkspace({
        ...workspaceData,
        templates: workspaceData.templates.length > 0 ? workspaceData.templates : FALLBACK_TEMPLATES,
      });
      setLeadSummary(leadSummaryData);
      setLeads(leadEntries);
      setDirtySite(false);
      setDirtyBlocks({});
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Не удалось загрузить конструктор сайта.'));
    } finally {
      setLoading(false);
    }
  }, [replaceWorkspace]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    const hasDirtyBlocks = Object.values(dirtyBlocks).some(Boolean);

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtySite && !hasDirtyBlocks && !savingSite) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dirtyBlocks, dirtySite, savingSite]);

  const saveSiteNow = useCallback(async () => {
    if (!workspaceRef.current) {
      return;
    }

    setSavingSite(true);
    setError(null);

    try {
      const nextWorkspace = await holdingSiteBuilderService.updateSite(
        sanitizeSitePayload(workspaceRef.current.site),
      );
      replaceWorkspace(nextWorkspace);
      setDirtySite(false);
    } catch (saveError) {
      const message = getErrorMessage(saveError, 'Не удалось сохранить настройки сайта.');
      setError(message);
      NotificationService.show({
        type: 'error',
        title: 'Автосохранение',
        message,
      });
    } finally {
      setSavingSite(false);
    }
  }, [replaceWorkspace]);

  const saveBlockNow = useCallback(async (blockId: number) => {
    const currentWorkspace = workspaceRef.current;
    const block = currentWorkspace?.blocks.find((item) => item.id === blockId);

    if (!block) {
      return;
    }

    setSavingBlocks((current) => ({ ...current, [blockId]: true }));
    setError(null);

    try {
      const updatedBlock = await holdingSiteBuilderService.updateBlock(
        blockId,
        sanitizeBlockPayload(block),
      );

      startTransition(() => {
        setWorkspace((currentWorkspaceState) => {
          if (!currentWorkspaceState) {
            return currentWorkspaceState;
          }

          return {
            ...currentWorkspaceState,
            blocks: currentWorkspaceState.blocks.map((item) =>
              item.id === blockId ? updatedBlock : item,
            ),
          };
        });
      });

      setDirtyBlocks((current) => ({ ...current, [blockId]: false }));
    } catch (saveError) {
      const message = getErrorMessage(saveError, 'Не удалось сохранить блок.');
      setError(message);
      NotificationService.show({
        type: 'error',
        title: 'Автосохранение',
        message,
      });
    } finally {
      setSavingBlocks((current) => ({ ...current, [blockId]: false }));
    }
  }, []);

  const queueSiteSave = useCallback(() => {
    if (siteTimerRef.current) {
      clearTimeout(siteTimerRef.current);
    }

    siteTimerRef.current = setTimeout(() => {
      void saveSiteNow();
    }, SITE_SAVE_DELAY);
  }, [saveSiteNow]);

  const queueBlockSave = useCallback((blockId: number) => {
    if (blockTimersRef.current[blockId]) {
      clearTimeout(blockTimersRef.current[blockId]);
    }

    blockTimersRef.current[blockId] = setTimeout(() => {
      void saveBlockNow(blockId);
    }, BLOCK_SAVE_DELAY);
  }, [saveBlockNow]);

  const flushPendingSaves = useCallback(async () => {
    if (siteTimerRef.current) {
      clearTimeout(siteTimerRef.current);
      siteTimerRef.current = null;
      await saveSiteNow();
    }

    const pendingBlockIds = Object.entries(blockTimersRef.current).map(([blockId, timer]) => {
      clearTimeout(timer);
      return Number(blockId);
    });
    blockTimersRef.current = {};

    for (const blockId of pendingBlockIds) {
      // eslint-disable-next-line no-await-in-loop
      await saveBlockNow(blockId);
    }
  }, [saveBlockNow, saveSiteNow]);

  const refreshLeads = useCallback(async () => {
    try {
      const [summary, entries] = await Promise.all([
        holdingSiteBuilderService.getLeadSummary(),
        holdingSiteBuilderService.getLeads(),
      ]);
      setLeadSummary(summary);
      setLeads(entries);
    } catch (refreshError) {
      setError(getErrorMessage(refreshError, 'Не удалось обновить лиды.'));
    }
  }, []);

  const selectedBlock = useMemo(
    () => workspace?.blocks.find((block) => block.id === selectedBlockId) ?? null,
    [selectedBlockId, workspace?.blocks],
  );

  const updateSiteDraft = useCallback((patch: Partial<EditorSite>) => {
    startTransition(() => {
      setWorkspace((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          site: {
            ...current.site,
            ...patch,
          },
        };
      });
    });
    setDirtySite(true);
    queueSiteSave();
  }, [queueSiteSave]);

  const updateBlockDraft = useCallback((blockId: number, patch: Partial<EditorBlock>) => {
    startTransition(() => {
      setWorkspace((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          blocks: current.blocks.map((block) => {
            if (block.id !== blockId) {
              return block;
            }

            return {
              ...block,
              ...patch,
              content: patch.content ? mergeRecord(block.content, patch.content) : block.content,
              settings: patch.settings ? mergeRecord(block.settings, patch.settings) : block.settings,
              bindings: patch.bindings ? { ...block.bindings, ...patch.bindings } : block.bindings,
            };
          }),
        };
      });
    });
    setDirtyBlocks((current) => ({ ...current, [blockId]: true }));
    queueBlockSave(blockId);
  }, [queueBlockSave]);

  const addBlock = useCallback(async (type: SiteTemplatePreset['blocks'][number]) => {
    try {
      const createdBlock = await holdingSiteBuilderService.createBlock(createBlockPayloadFromTemplate(type));

      startTransition(() => {
        setWorkspace((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            blocks: [...current.blocks, createdBlock].sort((a, b) => a.sort_order - b.sort_order),
          };
        });
        setSelectedBlockId(createdBlock.id);
      });

      NotificationService.show({
        type: 'success',
        title: 'Конструктор',
        message: `Блок «${BLOCK_LIBRARY.find((item) => item.type === type)?.label ?? type}» добавлен.`,
      });

      return createdBlock;
    } catch (createError) {
      const message = getErrorMessage(createError, 'Не удалось добавить блок.');
      setError(message);
      NotificationService.show({
        type: 'error',
        title: 'Конструктор',
        message,
      });
      return null;
    }
  }, []);

  const deleteBlock = useCallback(async (blockId: number) => {
    try {
      const response = await holdingSiteBuilderService.deleteBlock(blockId);

      startTransition(() => {
        setWorkspace((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            blocks: response.blocks,
          };
        });
        setSelectedBlockId((current) => (current === blockId ? response.blocks[0]?.id ?? null : current));
      });

      NotificationService.show({
        type: 'success',
        title: 'Конструктор',
        message: 'Блок удален.',
      });
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'Не удалось удалить блок.');
      setError(message);
      NotificationService.show({
        type: 'error',
        title: 'Конструктор',
        message,
      });
    }
  }, []);

  const duplicateBlock = useCallback(async (blockId: number) => {
    try {
      const duplicated = await holdingSiteBuilderService.duplicateBlock(blockId);

      startTransition(() => {
        setWorkspace((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            blocks: [...current.blocks, duplicated].sort((a, b) => a.sort_order - b.sort_order),
          };
        });
        setSelectedBlockId(duplicated.id);
      });
    } catch (duplicateError) {
      const message = getErrorMessage(duplicateError, 'Не удалось продублировать блок.');
      setError(message);
      NotificationService.show({
        type: 'error',
        title: 'Конструктор',
        message,
      });
    }
  }, []);

  const reorderBlocks = useCallback(async (blockOrder: number[]) => {
    startTransition(() => {
      setWorkspace((current) => {
        if (!current) {
          return current;
        }

        const sorted = [...current.blocks].sort(
          (left, right) => blockOrder.indexOf(left.id) - blockOrder.indexOf(right.id),
        );

        return {
          ...current,
          blocks: sorted.map((block, index) => ({
            ...block,
            sort_order: index + 1,
          })),
        };
      });
    });

    try {
      const blocks = await holdingSiteBuilderService.reorderBlocks(blockOrder);

      startTransition(() => {
        setWorkspace((current) => (current ? { ...current, blocks } : current));
      });
    } catch (reorderError) {
      const message = getErrorMessage(reorderError, 'Не удалось изменить порядок блоков.');
      setError(message);
      NotificationService.show({
        type: 'error',
        title: 'Конструктор',
        message,
      });
      await loadWorkspace();
    }
  }, [loadWorkspace]);

  const publishSite = useCallback(async () => {
    setPublishing(true);
    setError(null);

    try {
      await flushPendingSaves();
      const nextWorkspace = await holdingSiteBuilderService.publishSite();
      replaceWorkspace(nextWorkspace);
      await refreshLeads();
      NotificationService.show({
        type: 'success',
        title: 'Публикация',
        message: 'Сайт холдинга опубликован.',
      });
    } catch (publishError) {
      const message = getErrorMessage(publishError, 'Не удалось опубликовать сайт.');
      setError(message);
      NotificationService.show({
        type: 'error',
        title: 'Публикация',
        message,
      });
    } finally {
      setPublishing(false);
    }
  }, [flushPendingSaves, refreshLeads, replaceWorkspace]);

  const applyTemplate = useCallback(async (template: SiteTemplatePreset) => {
    const currentTypes = new Set(workspaceRef.current?.blocks.map((block) => block.type));

    for (const type of template.blocks) {
      if (!currentTypes.has(type)) {
        // eslint-disable-next-line no-await-in-loop
        const created = await addBlock(type);
        if (created) {
          currentTypes.add(type);
        }
      }
    }
  }, [addBlock]);

  const uploadAsset = useCallback(async (file: File, usageContext: string, metadata?: Record<string, unknown>) => {
    try {
      const asset = await holdingSiteBuilderService.uploadAsset(file, usageContext, metadata);

      startTransition(() => {
        setWorkspace((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            assets: [asset, ...current.assets],
          };
        });
      });

      NotificationService.show({
        type: 'success',
        title: 'Медиатека',
        message: 'Файл загружен.',
      });

      return asset;
    } catch (uploadError) {
      const message = getErrorMessage(uploadError, 'Не удалось загрузить файл.');
      setError(message);
      NotificationService.show({
        type: 'error',
        title: 'Медиатека',
        message,
      });
      return null;
    }
  }, []);

  const updateAsset = useCallback(async (assetId: number, metadata: Record<string, unknown>) => {
    try {
      const asset = await holdingSiteBuilderService.updateAsset(assetId, metadata);

      startTransition(() => {
        setWorkspace((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            assets: current.assets.map((item) => (item.id === assetId ? asset : item)),
          };
        });
      });
    } catch (updateError) {
      const message = getErrorMessage(updateError, 'Не удалось обновить файл.');
      setError(message);
      NotificationService.show({
        type: 'error',
        title: 'Медиатека',
        message,
      });
    }
  }, []);

  const deleteAsset = useCallback(async (assetId: number) => {
    try {
      await holdingSiteBuilderService.deleteAsset(assetId);

      startTransition(() => {
        setWorkspace((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            assets: current.assets.filter((asset) => asset.id !== assetId),
          };
        });
      });
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'Не удалось удалить файл.');
      setError(message);
      NotificationService.show({
        type: 'error',
        title: 'Медиатека',
        message,
      });
    }
  }, []);

  const refreshAssets = useCallback(async () => {
    try {
      const assets = await holdingSiteBuilderService.getAssets();
      startTransition(() => {
        setWorkspace((current) => (current ? { ...current, assets } : current));
      });
    } catch (refreshError) {
      setError(getErrorMessage(refreshError, 'Не удалось обновить медиатеку.'));
    }
  }, []);

  const openPreview = useCallback(async () => {
    const previewUrl = workspaceRef.current?.publication.preview_url;
    if (!previewUrl) {
      return;
    }

    await flushPendingSaves();
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  }, [flushPendingSaves]);

  const hasUnsavedChanges = dirtySite || Object.values(dirtyBlocks).some(Boolean) || savingSite;

  return {
    workspace,
    leads,
    leadSummary,
    selectedBlockId,
    selectedBlock,
    loading,
    savingSite,
    savingBlocks,
    publishing,
    error,
    hasUnsavedChanges,
    blockLibrary: BLOCK_LIBRARY,
    templates: workspace?.templates ?? FALLBACK_TEMPLATES,
    loadWorkspace,
    refreshAssets,
    refreshLeads,
    selectBlock: setSelectedBlockId,
    updateSiteDraft,
    updateBlockDraft,
    addBlock,
    deleteBlock,
    duplicateBlock,
    reorderBlocks,
    uploadAsset,
    updateAsset,
    deleteAsset,
    publishSite,
    applyTemplate,
    flushPendingSaves,
    openPreview,
  };
};
