import { describe, expect, it } from 'vitest';
import { HOLDING_MAIN_DOMAIN, isHoldingHostname } from './holdingDomain';
import { isMarketingPublicRequest } from './publicSite';

describe('holding hostname routing', () => {
  it('recognizes the browser hostname of a Cyrillic holding domain', () => {
    expect(isHoldingHostname(new URL('https://company.1мост.рф').hostname)).toBe(true);
    expect(HOLDING_MAIN_DOMAIN).toBe('xn--1-xtbgmf.xn--p1ai');
    expect(isMarketingPublicRequest('/', `company.${HOLDING_MAIN_DOMAIN}`)).toBe(false);
    expect(isMarketingPublicRequest('/about', `company.${HOLDING_MAIN_DOMAIN}`)).toBe(false);
    expect(isMarketingPublicRequest('/', HOLDING_MAIN_DOMAIN)).toBe(true);
  });

  it.each([
    'https://1мост.рф',
    'https://lk.1мост.рф',
    'https://api.1мост.рф',
    'https://www.1мост.рф',
    'https://localhost',
    'https://127.0.0.1',
    'https://company.1мост.рф.example.com',
    'https://evil1мост.рф',
  ])('keeps %s outside the holding router', (url) => {
    expect(isHoldingHostname(new URL(url).hostname)).toBe(false);
  });
});
