type RouterComponent = typeof import('./HoldingRouter').default;

let holdingRouter: RouterComponent | null = null;

export const getHoldingRouter = () => holdingRouter;

export async function loadHoldingRouter(): Promise<RouterComponent> {
  holdingRouter = (await import('./HoldingRouter')).default;
  return holdingRouter;
}
