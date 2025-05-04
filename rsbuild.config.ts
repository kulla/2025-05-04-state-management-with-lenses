import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export default defineConfig({
  html: {
    title: 'Prototype',
  },
  output: {
    assetPrefix: '/2025-05-04-state-management-with-lenses/',
  },
  plugins: [pluginReact()],
})
