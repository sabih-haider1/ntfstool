/**
 * NTFS Tool - Free and Open Source Fork
 * 
 * @author   Dr_rOot (Original Author)
 * @author   Community Contributors (Fork Maintainers)
 * 
 * Copyright (c) 2018-2020 Dr_rOot (Original Author)
 * Copyright (c) 2025 NTFS Tool Community Contributors
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the MIT License as published in the LICENSE file.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * MIT License for more details.
 *
 * This is a free-use fork created with permission from the original author.
 * See FREE_USE_NOTICE.md for details.
 */

// Vue 3 Main Entry Point
import { createApp } from 'vue'
import axios from 'axios'
import App from './App.vue'
import router from '@/common/router/index'

// Element Plus (Vue 3 version of Element UI)
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/renderer/theme/ntfstool.css'

// Vue I18n
import messages from '@/common/lang/index'
import { createI18n } from 'vue-i18n'

// Electron Store
const Store = require('electron-store')
const store = new Store()

// Get current language
let langNow = store.get("lang", "en")

// Create i18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: langNow,
  fallbackLocale: "en",
  messages
})

// Create Vue app
const app = createApp(App)

// Configure axios
app.config.globalProperties.$http = axios

// Use plugins
console.log('[Renderer] Registering ElementPlus...')
app.use(ElementPlus)

console.log('[Renderer] Registering Router...')
app.use(router)

console.log('[Renderer] Registering i18n...')
app.use(i18n)

// Production configuration
app.config.performance = false

// CRITICAL: Disable Vue devtools in Electron to prevent router rendering errors
app.config.devtools = false

// Disable router devtools integration
if (router.options) {
  router.options.devtools = false
}

// CRITICAL: Disable global devtools hooks before mounting
if (typeof window !== 'undefined') {
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__ = null
  window.__VUE_DEVTOOLS_GLOBAL_HOOK_REPLAY__ = null
}

// Suppress only devtools-related warnings in Electron environment
app.config.warnHandler = (msg) => {
  if (msg.includes('__vrv_devtools') || msg.includes('devtools')) {
    return // Suppress devtools warnings
  }
  console.warn('[Vue warn]:', msg) // Log other warnings
}

// Global error handler (consolidated from above)
app.config.errorHandler = (err, instance, info) => {
  // Suppress devtools-related errors in Electron
  if (err.message?.includes('__vrv_devtools') || 
      err.message?.includes('reading \'ce\'') ||
      err.message?.includes('null')) {
    return
  }
  console.error('[Vue Error Handler]', err)
  console.error('[Vue Error Info]', info)
  console.error('[Vue Error Stack]', err.stack)
}

// CRITICAL: Wait for router to be ready before mounting
console.log('[Renderer] Waiting for router to be ready...')
router.isReady().then(() => {
  console.log('[Renderer] Router is ready, mounting Vue app to #app...')
  try {
    app.mount('#app')
    console.log('[Renderer] Vue app mounted successfully!')
    console.log('[Renderer] Current route:', router.currentRoute.value.path)
    console.log('[Renderer] Route matched:', router.currentRoute.value.matched.length, 'component(s)')
  } catch (err) {
    console.error('[Renderer] Failed to mount Vue app:', err)
    console.error('[Renderer] Error stack:', err.stack)
  }
}).catch((err) => {
  console.error('[Renderer] Router failed to initialize:', err)
})


