<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const showLangMenu = ref(false)
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

const languages = ['English', 'Chinese', 'Vietnamese', 'Arabic']
const selectedLang = ref('English')

function selectLang(lang) {
  selectedLang.value = lang
  showLangMenu.value = false
}

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

      <!-- Center: Search -->
      <div class="flex-1 max-w-xs hidden md:block">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search"
            class="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-100 border border-transparent focus:outline-none focus:bg-white focus:border-gray-300 transition"
          />
        </div>
      </div>

      <!-- Right: Language + Location + Profile -->
      <div class="flex items-center gap-4 text-sm text-gray-600">

        <!-- Language selector -->
        <div class="relative hidden sm:block">
          <button
            class="flex items-center gap-1.5 hover:text-gray-900 transition"
            @click="showLangMenu = !showLangMenu"
          >
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
            </svg>
            <span>Language - {{ selectedLang }}</span>
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
          <!-- Language dropdown -->
          <div v-if="showLangMenu" class="absolute right-0 mt-2 w-36 bg-white shadow-lg border border-gray-100 py-1 z-50">
              <button
                v-for="lang in languages"
                :key="lang"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition"
                :class="lang === selectedLang ? 'text-orange-500 font-medium' : 'text-gray-700'"
                @click="selectLang(lang)"
              >
                {{ lang }}
              </button>
            </div>
        </div>

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
      v-if="showLangMenu || showProfileMenu"
      class="fixed inset-0 z-40"
      @click="showLangMenu = false; showProfileMenu = false"
    />
  </header>
</template>
