import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const unsafeKeys = new Set(['1234567890abcdef1234567890abcdef']);

export const requireProductionReverbKey = (value) => {
  const key = typeof value === 'string' ? value.trim() : '';

  if (!key || unsafeKeys.has(key.toLowerCase())) {
    throw new Error('VITE_REVERB_APP_KEY must contain a non-placeholder production key');
  }
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  requireProductionReverbKey(process.env.VITE_REVERB_APP_KEY);
  process.stdout.write('Reverb production configuration is valid\n');
}
