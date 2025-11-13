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

// Vue 3 Router Configuration
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/renderer/page/Home.vue'
import Setting from '@/renderer/page/Setting.vue'
import Tray from '@/renderer/page/Tray.vue'
import Dialog from '@/renderer/page/Dialog.vue'
import FeedBack from '@/renderer/page/FeedBack.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/setting',
    name: 'Setting',
    component: Setting
  },
  {
    path: '/dialog',
    name: 'Dialog',
    component: Dialog
  },
  {
    path: '/feedBack',
    name: 'FeedBack',
    component: FeedBack
  },
  {
    path: '/tray',
    name: 'Tray',
    component: Tray
  },
  {
    // Vue 3 catch-all route syntax
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  // Use hash mode for Electron compatibility
  history: createWebHashHistory(),
  routes
})

export default router
