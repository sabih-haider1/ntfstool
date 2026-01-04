<template>
  <router-view />
</template>

<script>
const Store = require('electron-store');
const store = new Store();

export default {
  name: 'App',
  mounted() {
    // Apply saved theme on app mount
    try {
      const theme = store.get("theme") !== undefined ? store.get("theme") : "2";
      const themes = ['theme-system', 'theme-dark', 'theme-light'];
      const themeClass = themes[parseInt(theme)];
      
      if (themeClass) {
        document.body.classList.add(themeClass);
        console.log('[App.vue] Applied theme on startup:', themeClass);
      }
    } catch (e) {
      console.error('[App.vue] Error applying theme:', e);
    }
  }
}
</script>
