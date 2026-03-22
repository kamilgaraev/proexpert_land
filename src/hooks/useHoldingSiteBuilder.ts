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
  EditorCollaborator,
  EditorPage,
  EditorSection,
  EditorSite,
  LeadEntry,
  LeadSummary,
  PageTemplatePreset,
  SiteBlogArticle,
  SiteRevision,
} from '@/types/holding-site-builder';

const SITE_SAVE_DELAY = 700;
const PAGE_SAVE_DELAY = 700;
const SECTION_SAVE_DELAY = 700;

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof BuilderApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const setDeepValue = (target: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> => {
  const segments = path.split('.');
  const next = structuredClone(target);
  let cursor: Record<string, unknown> = next;

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      cursor[segment] = value;
      return;
    }

    const current = cursor[segment];
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  });

  return next;
};

const sanitizeSitePayload = (site: EditorSite) => ({
  domain: site.domain,
  default_locale: site.default_locale,
  enabled_locales: site.enabled_locales,
  title: site.title,
  description: site.description,
  logo_url: site.logo_url,
  favicon_url: site.favicon_url,
  theme_config: site.theme_config,
  seo_meta: site.seo_meta,
  analytics_config: site.analytics_config,
});

const sanitizePagePayload = (page: EditorPage) => ({
  page_type: page.page_type,
  slug: page.slug,
  navigation_label: page.navigation_label,
  title: page.title,
  description: page.description,
  seo_meta: page.seo_meta,
  layout_config: page.layout_config,
  locale_content: page.locale_content,
  visibility: page.visibility,
  sort_order: page.sort_order,
  is_home: page.is_home,
  is_active: page.is_active,
});

const sanitizeSectionPayload = (section: EditorSection) => ({
  title: section.title,
  content: section.content,
  settings: section.settings,
  bindings: section.bindings,
  locale_content: section.locale_content,
  style_config: section.style_config,
  sort_order: section.sort_order,
  is_active: section.is_active,
});

export const useHoldingSiteBuilder = () => {
  const [workspace, setWorkspace] = useState<BuilderWorkspaceData | null>(null);
  const [leads, setLeads] = useState<LeadEntry[]>([]);
  const [leadSummary, setLeadSummary] = useState<LeadSummary | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<number | string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingSite, setSavingSite] = useState(false);
  const [savingPages, setSavingPages] = useState<Record<string, boolean>>({});
  const [savingSections, setSavingSections] = useState<Record<number, boolean>>({});
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirtySite, setDirtySite] = useState(false);
  const [dirtyPages, setDirtyPages] = useState<Record<string, boolean>>({});
  const [dirtySections, setDirtySections] = useState<Record<number, boolean>>({});

  const workspaceRef = useRef<BuilderWorkspaceData | null>(null);
  const siteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const sectionTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    workspaceRef.current = workspace;
  }, [workspace]);

  useEffect(() => {
    return () => {
      if (siteTimerRef.current) {
        clearTimeout(siteTimerRef.current);
      }

      Object.values(pageTimersRef.current).forEach((timer) => clearTimeout(timer));
      Object.values(sectionTimersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const replaceWorkspace = useCallback((nextWorkspace: BuilderWorkspaceData) => {
    startTransition(() => {
      setWorkspace({
        ...nextWorkspace,
        templates: nextWorkspace.templates.length > 0 ? nextWorkspace.templates : FALLBACK_TEMPLATES,
      });

      setSelectedPageId((currentPageId) => {
        if (currentPageId && nextWorkspace.pages.some((page) => page.id === currentPageId)) {
          return currentPageId;
        }

        return nextWorkspace.pages[0]?.id ?? null;
      });

      setSelectedSectionId((currentSectionId) => {
        if (
          currentSectionId &&
          nextWorkspace.pages.some((page) => page.sections.some((section) => section.id === currentSectionId))
        ) {
          return currentSectionId;
        }

        return nextWorkspace.pages[0]?.sections[0]?.id ?? null;
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

      replaceWorkspace(workspaceData);
      setLeadSummary(leadSummaryData);
      setLeads(leadEntries);
      setDirtySite(false);
      setDirtyPages({});
      setDirtySections({});
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Не удалось загрузить конструктор сайта.'));
    } finally {
      setLoading(false);
    }
  }, [replaceWorkspace]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

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
      NotificationService.show({ type: 'error', title: 'Автосохранение', message });
    } finally {
      setSavingSite(false);
    }
  }, [replaceWorkspace]);

  const savePageNow = useCallback(async (pageId: number | string) => {
    const currentWorkspace = workspaceRef.current;
    const page = currentWorkspace?.pages.find((item) => item.id === pageId);

    if (!page || typeof page.id !== 'number') {
      return;
    }

    setSavingPages((current) => ({ ...current, [String(pageId)]: true }));

    try {
      const updatedPage = await holdingSiteBuilderService.updatePage(page.id, sanitizePagePayload(page));

      startTransition(() => {
        setWorkspace((currentState) => {
          if (!currentState) {
            return currentState;
          }

          return {
            ...currentState,
            pages: currentState.pages.map((item) => (item.id === pageId ? updatedPage : item)),
            blocks:
              currentState.pages.find((item) => item.id === pageId)?.is_home
                ? updatedPage.sections
                : currentState.blocks,
          };
        });
      });

      setDirtyPages((current) => ({ ...current, [String(pageId)]: false }));
    } catch (saveError) {
      const message = getErrorMessage(saveError, 'Не удалось сохранить страницу.');
      setError(message);
      NotificationService.show({ type: 'error', title: 'Автосохранение', message });
    } finally {
      setSavingPages((current) => ({ ...current, [String(pageId)]: false }));
    }
  }, []);

  const saveSectionNow = useCallback(async (pageId: number | string, sectionId: number) => {
    const currentWorkspace = workspaceRef.current;
    const page = currentWorkspace?.pages.find((item) => item.id === pageId);
    const section = page?.sections.find((item) => item.id === sectionId);

    if (!page || typeof page.id !== 'number' || !section) {
      return;
    }

    setSavingSections((current) => ({ ...current, [sectionId]: true }));

    try {
      const updatedSection = await holdingSiteBuilderService.updateSection(
        page.id,
        sectionId,
        sanitizeSectionPayload(section),
      );

      startTransition(() => {
        setWorkspace((currentState) => {
          if (!currentState) {
            return currentState;
          }

          const nextPages = currentState.pages.map((currentPage) =>
            currentPage.id === pageId
              ? {
                  ...currentPage,
                  sections: currentPage.sections.map((currentSection) =>
                    currentSection.id === sectionId ? updatedSection : currentSection,
                  ),
                }
              : currentPage,
          );

          return {
            ...currentState,
            pages: nextPages,
            blocks: nextPages.find((item) => item.is_home)?.sections ?? currentState.blocks,
          };
        });
      });

      setDirtySections((current) => ({ ...current, [sectionId]: false }));
    } catch (saveError) {
      const message = getErrorMessage(saveError, 'Не удалось сохранить секцию.');
      setError(message);
      NotificationService.show({ type: 'error', title: 'Автосохранение', message });
    } finally {
      setSavingSections((current) => ({ ...current, [sectionId]: false }));
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

  const queuePageSave = useCallback((pageId: number | string) => {
    const key = String(pageId);
    if (pageTimersRef.current[key]) {
      clearTimeout(pageTimersRef.current[key]);
    }

    pageTimersRef.current[key] = setTimeout(() => {
      void savePageNow(pageId);
    }, PAGE_SAVE_DELAY);
  }, [savePageNow]);

  const queueSectionSave = useCallback((pageId: number | string, sectionId: number) => {
    if (sectionTimersRef.current[sectionId]) {
      clearTimeout(sectionTimersRef.current[sectionId]);
    }

    sectionTimersRef.current[sectionId] = setTimeout(() => {
      void saveSectionNow(pageId, sectionId);
    }, SECTION_SAVE_DELAY);
  }, [saveSectionNow]);

  const flushPendingSaves = useCallback(async () => {
    if (siteTimerRef.current) {
      clearTimeout(siteTimerRef.current);
      siteTimerRef.current = null;
      await saveSiteNow();
    }

    const pageIds = Object.keys(pageTimersRef.current);
    pageIds.forEach((pageId) => clearTimeout(pageTimersRef.current[pageId]));
    pageTimersRef.current = {};

    for (const pageId of pageIds) {
      // eslint-disable-next-line no-await-in-loop
      await savePageNow(Number.isNaN(Number(pageId)) ? pageId : Number(pageId));
    }

    const sectionIds = Object.keys(sectionTimersRef.current).map((value) => Number(value));
    sectionIds.forEach((sectionId) => clearTimeout(sectionTimersRef.current[sectionId]));
    sectionTimersRef.current = {};

    const currentWorkspace = workspaceRef.current;
    for (const sectionId of sectionIds) {
      const page = currentWorkspace?.pages.find((item) => item.sections.some((section) => section.id === sectionId));
      if (!page) {
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      await saveSectionNow(page.id, sectionId);
    }
  }, [savePageNow, saveSectionNow, saveSiteNow]);

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

  const selectedPage = useMemo(
    () => workspace?.pages.find((page) => page.id === selectedPageId) ?? null,
    [selectedPageId, workspace?.pages],
  );

  const selectedSection = useMemo(
    () => selectedPage?.sections.find((section) => section.id === selectedSectionId) ?? null,
    [selectedPage, selectedSectionId],
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

  const updatePageDraft = useCallback((pageId: number | string, patch: Partial<EditorPage>) => {
    startTransition(() => {
      setWorkspace((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          pages: current.pages.map((page) => (page.id === pageId ? { ...page, ...patch } : page)),
        };
      });
    });

    setDirtyPages((current) => ({ ...current, [String(pageId)]: true }));
    queuePageSave(pageId);
  }, [queuePageSave]);

  const updateSectionDraft = useCallback((pageId: number | string, sectionId: number, patch: Partial<EditorSection>) => {
    startTransition(() => {
      setWorkspace((current) => {
        if (!current) {
          return current;
        }

        const nextPages = current.pages.map((page) =>
          page.id === pageId
            ? {
                ...page,
                sections: page.sections.map((section) =>
                  section.id === sectionId
                    ? {
                        ...section,
                        ...patch,
                        content: patch.content ? { ...section.content, ...patch.content } : section.content,
                        settings: patch.settings ? { ...section.settings, ...patch.settings } : section.settings,
                        bindings: patch.bindings ? { ...section.bindings, ...patch.bindings } : section.bindings,
                        locale_content: patch.locale_content
                          ? { ...(section.locale_content ?? {}), ...patch.locale_content }
                          : section.locale_content,
                        style_config: patch.style_config
                          ? { ...(section.style_config ?? {}), ...patch.style_config }
                          : section.style_config,
                      }
                    : section,
                ),
              }
            : page,
        );

        return {
          ...current,
          pages: nextPages,
          blocks: nextPages.find((page) => page.is_home)?.sections ?? current.blocks,
        };
      });
    });

    setDirtySections((current) => ({ ...current, [sectionId]: true }));
    queueSectionSave(pageId, sectionId);
  }, [queueSectionSave]);

  const updateSectionField = useCallback(
    (pageId: number | string, sectionId: number, fieldPath: string, value: unknown) => {
      const normalizedPath = fieldPath.startsWith('content.') ? fieldPath.replace(/^content\./, '') : fieldPath;
      const page = workspaceRef.current?.pages.find((item) => item.id === pageId);
      const section = page?.sections.find((item) => item.id === sectionId);

      if (!section) {
        return;
      }

      updateSectionDraft(pageId, sectionId, {
        content: setDeepValue(section.content, normalizedPath, value),
      });
    },
    [updateSectionDraft],
  );

  const createPage = useCallback(async (payload: Record<string, unknown>) => {
    try {
      const page = await holdingSiteBuilderService.createPage(payload);

      startTransition(() => {
        setWorkspace((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            pages: [...current.pages, page].sort((a, b) => a.sort_order - b.sort_order),
          };
        });
        setSelectedPageId(page.id);
        setSelectedSectionId(page.sections[0]?.id ?? null);
      });

      return page;
    } catch (createError) {
      const message = getErrorMessage(createError, 'Не удалось создать страницу.');
      setError(message);
      NotificationService.show({ type: 'error', title: 'Страницы', message });
      return null;
    }
  }, []);

  const deletePage = useCallback(async (pageId: number | string) => {
    if (typeof pageId !== 'number') {
      return false;
    }

    try {
      const pages = await holdingSiteBuilderService.deletePage(pageId);

      startTransition(() => {
        setWorkspace((current) => (current ? { ...current, pages, blocks: pages.find((page) => page.is_home)?.sections ?? current.blocks } : current));
        setSelectedPageId((currentSelected) => (currentSelected === pageId ? pages[0]?.id ?? null : currentSelected));
      });

      return true;
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'Не удалось удалить страницу.');
      setError(message);
      NotificationService.show({ type: 'error', title: 'Страницы', message });
      return false;
    }
  }, []);

  const reorderPages = useCallback(async (pageOrder: Array<number | string>) => {
    const numericOrder = pageOrder.filter((pageId): pageId is number => typeof pageId === 'number');

    try {
      const pages = await holdingSiteBuilderService.reorderPages(numericOrder);
      startTransition(() => {
        setWorkspace((current) => (current ? { ...current, pages, blocks: pages.find((page) => page.is_home)?.sections ?? current.blocks } : current));
      });
    } catch (reorderError) {
      const message = getErrorMessage(reorderError, 'Не удалось обновить порядок страниц.');
      setError(message);
      NotificationService.show({ type: 'error', title: 'Страницы', message });
    }
  }, []);

  const addSection = useCallback(async (pageId: number | string, type: EditorSection['type']) => {
    if (typeof pageId !== 'number') {
      return null;
    }

    try {
      const section = await holdingSiteBuilderService.createSection(pageId, createBlockPayloadFromTemplate(type as never));

      startTransition(() => {
        setWorkspace((current) => {
          if (!current) {
            return current;
          }

          const nextPages = current.pages.map((page) =>
            page.id === pageId
              ? {
                  ...page,
                  sections: [...page.sections, section].sort((a, b) => a.sort_order - b.sort_order),
                }
              : page,
          );

          return {
            ...current,
            pages: nextPages,
            blocks: nextPages.find((page) => page.is_home)?.sections ?? current.blocks,
          };
        });
        setSelectedSectionId(section.id);
      });

      NotificationService.show({
        type: 'success',
        title: 'Структура сайта',
        message: `Секция «${BLOCK_LIBRARY.find((item) => item.type === type)?.label ?? type}» добавлена.`,
      });

      return section;
    } catch (createError) {
      const message = getErrorMessage(createError, 'Не удалось добавить секцию.');
      setError(message);
      NotificationService.show({ type: 'error', title: 'Структура сайта', message });
      return null;
    }
  }, []);

  const deleteSection = useCallback(async (pageId: number | string, sectionId: number) => {
    if (typeof pageId !== 'number') {
      return false;
    }

    try {
      const updatedPage = await holdingSiteBuilderService.deleteSection(pageId, sectionId);

      startTransition(() => {
        setWorkspace((current) => {
          if (!current) {
            return current;
          }

          const nextPages = current.pages.map((page) => (page.id === pageId ? updatedPage : page));
          return {
            ...current,
            pages: nextPages,
            blocks: nextPages.find((page) => page.is_home)?.sections ?? current.blocks,
          };
        });
        setSelectedSectionId((currentSelected) => (currentSelected === sectionId ? updatedPage.sections[0]?.id ?? null : currentSelected));
      });

      return true;
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'Не удалось удалить секцию.');
      setError(message);
      NotificationService.show({ type: 'error', title: 'Структура сайта', message });
      return false;
    }
  }, []);

  const duplicateSection = useCallback(async (sectionId: number) => {
    try {
      const section = await holdingSiteBuilderService.duplicateSection(sectionId);

      startTransition(() => {
        setWorkspace((current) => {
          if (!current) {
            return current;
          }

          const nextPages = current.pages.map((page) =>
            page.id === section.page_id
              ? {
                  ...page,
                  sections: [...page.sections, section].sort((a, b) => a.sort_order - b.sort_order),
                }
              : page,
          );

          return {
            ...current,
            pages: nextPages,
            blocks: nextPages.find((page) => page.is_home)?.sections ?? current.blocks,
          };
        });
        setSelectedSectionId(section.id);
      });

      return section;
    } catch (duplicateError) {
      const message = getErrorMessage(duplicateError, 'Не удалось продублировать секцию.');
      setError(message);
      NotificationService.show({ type: 'error', title: 'Структура сайта', message });
      return null;
    }
  }, []);

  const reorderSections = useCallback(async (pageId: number | string, sectionOrder: number[]) => {
    if (typeof pageId !== 'number') {
      return;
    }

    try {
      const updatedPage = await holdingSiteBuilderService.reorderSections(pageId, sectionOrder);

      startTransition(() => {
        setWorkspace((current) => {
          if (!current) {
            return current;
          }

          const nextPages = current.pages.map((page) => (page.id === pageId ? updatedPage : page));
          return {
            ...current,
            pages: nextPages,
            blocks: nextPages.find((page) => page.is_home)?.sections ?? current.blocks,
          };
        });
      });
    } catch (reorderError) {
      const message = getErrorMessage(reorderError, 'Не удалось обновить порядок секций.');
      setError(message);
      NotificationService.show({ type: 'error', title: 'Структура сайта', message });
    }
  }, []);

  const applyPageTemplate = useCallback(async (template: PageTemplatePreset) => {
    for (const pageDefinition of template.pages) {
      const exists = workspaceRef.current?.pages.some((page) => page.slug === pageDefinition.slug);
      if (exists) {
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      await createPage(pageDefinition);
    }
  }, [createPage]);

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
        message: 'Сайт опубликован.',
      });
    } catch (publishError) {
      const message = getErrorMessage(publishError, 'Не удалось опубликовать сайт.');
      setError(message);
      NotificationService.show({ type: 'error', title: 'Публикация', message });
    } finally {
      setPublishing(false);
    }
  }, [flushPendingSaves, refreshLeads, replaceWorkspace]);

  const rollbackRevision = useCallback(async (revisionId: number) => {
    try {
      const nextWorkspace = await holdingSiteBuilderService.rollbackRevision(revisionId);
      replaceWorkspace(nextWorkspace);
      NotificationService.show({ type: 'success', title: 'Ревизии', message: 'Публикация откатена.' });
    } catch (rollbackError) {
      const message = getErrorMessage(rollbackError, 'Не удалось откатить публикацию.');
      setError(message);
      NotificationService.show({ type: 'error', title: 'Ревизии', message });
    }
  }, [replaceWorkspace]);

  const createBlogArticle = useCallback(async (payload: Record<string, unknown>) => {
    try {
      const article = await holdingSiteBuilderService.createBlogArticle(payload);
      setWorkspace((current) =>
        current
          ? {
              ...current,
              blog: {
                ...current.blog,
                articles: [article, ...(current.blog?.articles ?? [])],
              },
            }
          : current,
      );
      return article;
    } catch (createError) {
      const message = getErrorMessage(createError, 'Не удалось создать статью.');
      setError(message);
      NotificationService.show({ type: 'error', title: 'Блог', message });
      return null;
    }
  }, []);

  const updateBlogArticle = useCallback(async (articleId: number, payload: Record<string, unknown>) => {
    try {
      const article = await holdingSiteBuilderService.updateBlogArticle(articleId, payload);
      setWorkspace((current) =>
        current
          ? {
              ...current,
              blog: {
                ...current.blog,
                articles: (current.blog?.articles ?? []).map((item) => (item.id === articleId ? article : item)),
              },
            }
          : current,
      );
      return article;
    } catch (updateError) {
      const message = getErrorMessage(updateError, 'Не удалось обновить статью.');
      setError(message);
      NotificationService.show({ type: 'error', title: 'Блог', message });
      return null;
    }
  }, []);

  const deleteBlogArticle = useCallback(async (articleId: number) => {
    try {
      const articles = await holdingSiteBuilderService.deleteBlogArticle(articleId);
      setWorkspace((current) =>
        current
          ? {
              ...current,
              blog: {
                ...current.blog,
                articles,
              },
            }
          : current,
      );
      return true;
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'Не удалось удалить статью.');
      setError(message);
      NotificationService.show({ type: 'error', title: 'Блог', message });
      return false;
    }
  }, []);

  const createCollaborator = useCallback(async (payload: { user_id: number; role: string }) => {
    const collaborators = await holdingSiteBuilderService.createCollaborator(payload);
    setWorkspace((current) => (current ? { ...current, collaborators } : current));
  }, []);

  const updateCollaborator = useCallback(async (collaboratorId: number, role: string) => {
    const collaborators = await holdingSiteBuilderService.updateCollaborator(collaboratorId, { role });
    setWorkspace((current) => (current ? { ...current, collaborators } : current));
  }, []);

  const deleteCollaborator = useCallback(async (collaboratorId: number) => {
    const collaborators = await holdingSiteBuilderService.deleteCollaborator(collaboratorId);
    setWorkspace((current) => (current ? { ...current, collaborators } : current));
  }, []);

  const hasUnsavedChanges = dirtySite || Object.values(dirtyPages).some(Boolean) || Object.values(dirtySections).some(Boolean);

  return {
    workspace,
    site: workspace?.site ?? null,
    pages: workspace?.pages ?? [],
    templates: workspace?.templates ?? FALLBACK_TEMPLATES,
    sectionPresets: workspace?.section_presets ?? workspace?.templates ?? FALLBACK_TEMPLATES,
    pageTemplates: workspace?.page_templates ?? [],
    collaborators: workspace?.collaborators ?? ([] as EditorCollaborator[]),
    revisions: workspace?.revisions ?? ([] as SiteRevision[]),
    blogArticles: workspace?.blog?.articles ?? ([] as SiteBlogArticle[]),
    leads,
    leadSummary,
    loading,
    error,
    savingSite,
    savingPages,
    savingSections,
    publishing,
    selectedPageId,
    selectedSectionId,
    selectedPage,
    selectedSection,
    hasUnsavedChanges,
    publication: workspace?.publication ?? null,
    summary: workspace?.summary ?? null,
    setSelectedPageId,
    setSelectedSectionId,
    updateSiteDraft,
    updatePageDraft,
    updateSectionDraft,
    updateSectionField,
    createPage,
    deletePage,
    reorderPages,
    addSection,
    deleteSection,
    duplicateSection,
    reorderSections,
    applyPageTemplate,
    publishSite,
    rollbackRevision,
    refreshLeads,
    createBlogArticle,
    updateBlogArticle,
    deleteBlogArticle,
    createCollaborator,
    updateCollaborator,
    deleteCollaborator,
    reload: loadWorkspace,
  };
};
