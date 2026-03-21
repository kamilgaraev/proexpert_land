import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_TEMPLATES } from '@/constants/holdingSiteBuilder';
import {
  createLeadSummaryFixture,
  createWorkspaceFixture,
} from '@/test/fixtures/holdingSiteBuilder';

const {
  getWorkspaceMock,
  getLeadSummaryMock,
  getLeadsMock,
  updateSiteMock,
} = vi.hoisted(() => ({
  getWorkspaceMock: vi.fn(),
  getLeadSummaryMock: vi.fn(),
  getLeadsMock: vi.fn(),
  updateSiteMock: vi.fn(),
}));

vi.mock('@components/shared/NotificationService', () => ({
  default: {
    show: vi.fn(),
  },
}));

vi.mock('@/services/holdingSiteBuilderService', () => {
  class MockBuilderApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  }

  return {
    BuilderApiError: MockBuilderApiError,
    holdingSiteBuilderService: {
      getWorkspace: getWorkspaceMock,
      getLeadSummary: getLeadSummaryMock,
      getLeads: getLeadsMock,
      updateSite: updateSiteMock,
      updateBlock: vi.fn(),
      createBlock: vi.fn(),
      deleteBlock: vi.fn(),
      duplicateBlock: vi.fn(),
      reorderBlocks: vi.fn(),
      getAssets: vi.fn(),
      uploadAsset: vi.fn(),
      updateAsset: vi.fn(),
      deleteAsset: vi.fn(),
      publishSite: vi.fn(),
    },
  };
});

import { useHoldingSiteBuilder } from '@/hooks/useHoldingSiteBuilder';

describe('useHoldingSiteBuilder', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();

    getWorkspaceMock.mockResolvedValue(createWorkspaceFixture());
    getLeadSummaryMock.mockResolvedValue(createLeadSummaryFixture());
    getLeadsMock.mockResolvedValue([]);
    updateSiteMock.mockImplementation(async (payload: Record<string, unknown>) => {
      const workspace = createWorkspaceFixture();

      return {
        ...workspace,
        site: {
          ...workspace.site,
          ...payload,
        },
      };
    });
  });

  it('подставляет fallback templates, если backend вернул пустой список', async () => {
    const { result } = renderHook(() => useHoldingSiteBuilder());

    await waitFor(() => expect(result.current.workspace?.site.title).toBe('Alpha Holding'));

    expect(result.current.templates).toEqual(FALLBACK_TEMPLATES);
    expect(getWorkspaceMock).toHaveBeenCalledTimes(1);
    expect(getLeadSummaryMock).toHaveBeenCalledTimes(1);
    expect(getLeadsMock).toHaveBeenCalledTimes(1);
  });

  it('автосохраняет site draft через debounce и санитизированный payload', async () => {
    const { result } = renderHook(() => useHoldingSiteBuilder());

    await waitFor(() => expect(result.current.workspace).not.toBeNull());

    act(() => {
      result.current.updateSiteDraft({
        title: 'Alpha Holding Updated',
      });
    });

    expect(result.current.hasUnsavedChanges).toBe(true);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 750));
    });

    await waitFor(() =>
      expect(updateSiteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Alpha Holding Updated',
          domain: 'alpha.prohelper.pro',
          seo_meta: expect.any(Object),
          analytics_config: expect.any(Object),
        }),
      ),
    );

    await waitFor(() => expect(result.current.workspace?.site.title).toBe('Alpha Holding Updated'));
  });
});
