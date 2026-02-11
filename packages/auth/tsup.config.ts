import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    proxy: 'src/proxy.ts',
    'middleware/index': 'src/middleware/index.ts',
    'utils/index': 'src/utils/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['next', 'next-auth', '@prisma/client'],
  treeshake: true,
})
