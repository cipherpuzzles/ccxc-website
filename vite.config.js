import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mkcert({
      hosts: ["www.ccxc.ikp.yt"],
      source: "coding"
    }),
    vue()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    https: true,
    port: 13880,
    host: '0.0.0.0'
  }
})
