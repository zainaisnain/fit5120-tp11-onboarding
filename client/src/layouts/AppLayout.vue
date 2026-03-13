<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
import AppNavbar from '@/components/common/AppNavbar.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <AppHeader />
    <AppNavbar />
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>
