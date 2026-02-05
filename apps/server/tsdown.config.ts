import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  entry: './src/index.ts',
  external: [/@loris-sandbox\/.*/],
  format: 'esm',
  noExternal: [/@solana-stack-attack\/.*/],
  outDir: './dist',
})
