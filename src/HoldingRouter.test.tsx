import { createRoutesFromChildren, matchRoutes, Routes } from 'react-router-dom';
import { Children, isValidElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import HoldingRouter from './HoldingRouter';
import HoldingLandingRuntimePage from '@pages/holding/HoldingLandingRuntimePage';
import { HoldingPanelRouteGuard } from '@/components/multi-org/HoldingPanelRouteGuard';

const routeTree = Children.toArray(HoldingRouter().props.children).find((element) => isValidElement(element) && element.type === Routes);
if (!isValidElement<{ children: ReactNode }>(routeTree)) throw new Error('Holding routes are missing');
const routes = createRoutesFromChildren(routeTree.props.children);
const elementType = (element: unknown) => isValidElement(element) ? element.type : null;

describe('holding public and protected routes', () => {
  it.each(['/', '/about', '/services/design', '/blog/published-article'])('routes %s to the public runtime', (pathname) => {
    const matches = matchRoutes(routes, pathname);
    expect(elementType(matches?.at(-1)?.route.element)).toBe(HoldingLandingRuntimePage);
  });

  it.each(['/dashboard', '/projects/42', '/reports/contracts', '/landing/editor', '/holding/7/landing/edit'])(
    'keeps %s inside the existing access guard', (pathname) => {
      const matches = matchRoutes(routes, pathname);
      expect(matches?.some((match) => elementType(match.route.element) === HoldingPanelRouteGuard)).toBe(true);
      expect(elementType(matches?.at(-1)?.route.element)).not.toBe(HoldingLandingRuntimePage);
    },
  );
});
