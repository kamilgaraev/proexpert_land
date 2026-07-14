import { describe, expect, it } from 'vitest';

import { requireProductionReverbKey } from './reverb-config.mjs';

describe('requireProductionReverbKey', () => {
  it.each([undefined, '', '   ', '1234567890abcdef1234567890abcdef'])(
    'rejects an unsafe production key: %s',
    (value) => {
      expect(() => requireProductionReverbKey(value)).toThrow('VITE_REVERB_APP_KEY');
    },
  );

  it('accepts a configured production key without exposing it', () => {
    expect(requireProductionReverbKey(' real-key ')).toBeUndefined();
  });
});
