import { describe, expect, it } from 'vitest';

import { createFetchResponse } from './api';

describe('createFetchResponse', () => {
  it('creates a typed axios-like response for fetch payloads', () => {
    const response = new Response(JSON.stringify({ success: true }), {
      status: 201,
      statusText: 'Created',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'request-42',
      },
    });

    const result = createFetchResponse({ success: true }, response);

    expect(result).toEqual({
      data: { success: true },
      status: 201,
      statusText: 'Created',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'request-42',
      },
      config: {
        headers: {},
      },
    });
  });
});
