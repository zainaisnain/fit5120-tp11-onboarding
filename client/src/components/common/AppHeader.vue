<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const showProfileMenu = ref(false)

// This computed property returns the first letter of the user name as an uppercase avatar initial
const userInitial = computed(() => {
  if (authStore.user && authStore.user.name) {
    return authStore.user.name.charAt(0).toUpperCase()
  }
  return 'U'
})

// These computed properties provide safe values for template display without optional chaining
const userName = computed(() => {
  if (authStore.user) return authStore.user.name
  return ''
})
const userUsername = computed(() => {
  if (authStore.user) return authStore.user.username
  return ''
})


function handleLogout() {
  authStore.logout()
  showProfileMenu.value = false
  router.push('/login')
}
</script>

<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

      <!-- Left: Logo + Title -->
      <RouterLink to="/home" class="flex items-center gap-2 flex-shrink-0">
        <svg class="w-7 h-7 text-amber-400" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="20" fill="currentColor"/>
          <line x1="50" y1="8" x2="50" y2="22" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
          <line x1="50" y1="78" x2="50" y2="92" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
          <line x1="8"  y1="50" x2="22" y2="50" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
          <line x1="78" y1="50" x2="92" y2="50" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
          <line x1="22" y1="22" x2="32" y2="32" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
          <line x1="68" y1="68" x2="78" y2="78" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
          <line x1="78" y1="22" x2="68" y2="32" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
          <line x1="22" y1="78" x2="32" y2="68" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
        </svg>
        <span class="font-bold text-gray-900 text-base leading-tight hidden sm:block">
          UV Protection Assistant
        </span>
      </RouterLink>

      <!-- Right: Location + Profile -->
      <div class="flex items-center gap-4 text-sm text-gray-600">

        <!-- Location -->
        <div class="hidden sm:flex items-center gap-1 text-gray-600">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>Australia</span>
        </div>

        <!-- Profile -->
        <div class="relative">
          <button
            class="w-8 h-8 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center hover:bg-gray-700 transition"
            @click="showProfileMenu = !showProfileMenu"
          >
            {{ userInitial }}
          </button>
          <!-- Profile dropdown -->
          <div v-if="showProfileMenu" class="absolute right-0 mt-2 w-40 bg-white shadow-lg border border-gray-100 py-1 z-50">
            <div class="px-4 py-2 border-b border-gray-100">
              <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
              <p class="text-xs text-gray-500">{{ userUsername }}</p>
            </div>
            <button
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              @click="handleLogout"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Click outside to close dropdowns -->
    <div
      v-if="showProfileMenu"
      class="fixed inset-0 z-40"
      @click="showProfileMenu = false"
    />
  </header>
</template>
