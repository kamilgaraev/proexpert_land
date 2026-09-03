import type { Plugin } from 'vite';

export function ssrBuildCompatibility(): Plugin {
  return {
    name: 'most-ssr-build-compatibility',
    apply: 'build',
    configResolved(config) {
      if (config.command !== 'build') return;
      const environmentPlugin = config.plugins.find(plugin => plugin.name === 'vite-plugin-ssr:env');
      if (!environmentPlugin || typeof environmentPlugin.transform !== 'function') return;
      const originalTransform = environmentPlugin.transform;
      environmentPlugin.transform = function (code, id, options) {
        const buildOptions = options && options.ssr === undefined
          ? { ...options, ssr: Boolean(config.build.ssr) }
          : options;
        return originalTransform.call(this, code, id, buildOptions);
      };
    },
  };
}
