<script setup lang="ts">
const { app } = useRuntimeConfig()
const base = app.baseURL.replace(/\/$/, '')

useHead({
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: `${base}/icon.svg` },
    { rel: 'apple-touch-icon', href: `${base}/icon.svg` },
  ],
})
</script>

<template>
  <div class="app">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  height: 100%;
  font-size: 16px;
}

body {
  height: 100%;
  background: #0a0a14;
  color: #e8e4ff;
  font-family: 'Noto Sans Khmer', system-ui, -apple-system, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

.app {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

button {
  font-family: inherit;
  cursor: pointer;
}

input {
  font-family: inherit;
}

::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}
</style>
