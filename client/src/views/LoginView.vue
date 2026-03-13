<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const form = reactive({
  username: '',
  password: '',
})

// UI state
const showPassword = ref(false)
const loading = ref(false)
const errors = reactive({
  username: '',
  password: '',
  general: '',
})

// Mock credentials (replace with real API later)
const MOCK_USER = { username: 'admin', password: 'admin123', name: 'Admin User' }

function validate() {
  let valid = true
  errors.username = ''
  errors.password = ''
  errors.general = ''

  if (!form.username.trim()) {
    errors.username = 'Username is required.'
    valid = false
  }
  if (!form.password) {
    errors.password = 'Password is required.'
    valid = false
  }
  return valid
}

async function handleLogin() {
  if (!validate()) return

  loading.value = true
  errors.general = ''

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    // Mock authentication
    if (
      form.username.trim() === MOCK_USER.username &&
      form.password === MOCK_USER.password
    ) {
      authStore.login({ username: MOCK_USER.username, name: MOCK_USER.name })
      router.push('/home')
    } else {
      errors.general = 'Incorrect username or password. Please try again.'
    }
  } catch {
    errors.general = 'Login failed. Please check your connection and try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left panel: branding -->
    <div class="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
      <!-- Background image -->
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style="background-image: url('/images/login-bg.png');" />
      <!-- Very subtle overlay just for text contrast -->
      <div class="absolute inset-0 bg-black/10" />

      <div class="relative z-10 text-center text-white" style="text-shadow: 0 2px 8px rgba(0,0,0,0.6);">
        <!-- Sun icon -->
        <div class="flex justify-center mb-6">
          <svg class="w-24 h-24 drop-shadow-lg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="22" fill="white" fill-opacity="0.95" />
            <!-- Rays -->
            <line x1="50" y1="8" x2="50" y2="20" stroke="white" stroke-width="5" stroke-linecap="round" />
            <line x1="50" y1="80" x2="50" y2="92" stroke="white" stroke-width="5" stroke-linecap="round" />
            <line x1="8" y1="50" x2="20" y2="50" stroke="white" stroke-width="5" stroke-linecap="round" />
            <line x1="80" y1="50" x2="92" y2="50" stroke="white" stroke-width="5" stroke-linecap="round" />
            <line x1="21" y1="21" x2="30" y2="30" stroke="white" stroke-width="5" stroke-linecap="round" />
            <line x1="70" y1="70" x2="79" y2="79" stroke="white" stroke-width="5" stroke-linecap="round" />
            <line x1="79" y1="21" x2="70" y2="30" stroke="white" stroke-width="5" stroke-linecap="round" />
            <line x1="21" y1="79" x2="30" y2="70" stroke="white" stroke-width="5" stroke-linecap="round" />
          </svg>
        </div>
        <h1 class="text-4xl font-bold mb-3 drop-shadow">UV Protection Assistant</h1>
        <p class="text-lg font-medium text-white/90 max-w-xs mx-auto leading-relaxed">
          Stay safe under the Australian sun. Know your UV. Protect your skin.
        </p>

        <div class="mt-10 flex flex-col gap-3 text-sm text-white/80">
          <div class="flex items-center gap-2">
            <span class="text-xl">☀️</span>
            <span>Real-time UV Index tracking</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xl">🧴</span>
            <span>Personalised sunscreen recommendations</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xl">📊</span>
            <span>Data insights on sun exposure</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel: login form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
      <div class="w-full max-w-md">

        <!-- Mobile logo -->
        <div class="flex lg:hidden justify-center mb-8">
          <div class="flex items-center gap-3">
            <svg class="w-10 h-10 text-orange-400" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="22" fill="currentColor" fill-opacity="0.9" />
              <line x1="50" y1="8" x2="50" y2="20" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
              <line x1="50" y1="80" x2="50" y2="92" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
              <line x1="8" y1="50" x2="20" y2="50" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
              <line x1="80" y1="50" x2="92" y2="50" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
              <line x1="21" y1="21" x2="30" y2="30" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
              <line x1="70" y1="70" x2="79" y2="79" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
              <line x1="79" y1="21" x2="70" y2="30" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
              <line x1="21" y1="79" x2="30" y2="70" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
            </svg>
            <span class="text-xl font-bold text-gray-800">UV Protection Assistant</span>
          </div>
        </div>

        <!-- Heading -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p class="mt-1 text-sm text-gray-500">Sign in to your account to continue</p>
        </div>

        <!-- General error banner -->
        <div v-if="errors.general"
          class="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 px-4 py-3">
          <svg class="mt-0.5 w-4 h-4 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd" />
          </svg>
          <p class="text-sm text-red-700">{{ errors.general }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" novalidate class="space-y-5">

          <!-- Username field -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input id="username" v-model="form.username" type="text" autocomplete="username" :disabled="loading"
              placeholder="Enter your username" :class="[
                'w-full border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition',
                'focus:ring-2 focus:ring-orange-400 focus:border-orange-400',
                errors.username ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white',
                loading ? 'opacity-60 cursor-not-allowed' : '',
              ]" @input="errors.username = ''" />
            <p v-if="errors.username" class="mt-1 text-xs text-red-500 flex items-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
              {{ errors.username }}
            </p>
          </div>

          <!-- Password field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div class="relative">
              <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password" :disabled="loading" placeholder="Enter your password" :class="[
                  'w-full border px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder-gray-400 outline-none transition',
                  'focus:ring-2 focus:ring-orange-400 focus:border-orange-400',
                  errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white',
                  loading ? 'opacity-60 cursor-not-allowed' : '',
                ]" @input="errors.password = ''" />
              <!-- Show/hide password toggle -->
              <button type="button" :disabled="loading"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                @click="showPassword = !showPassword">
                <!-- Eye icon (visible) -->
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <!-- Eye-off icon (hidden) -->
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-xs text-red-500 flex items-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
              {{ errors.password }}
            </p>
          </div>

          <!-- Login button -->
          <button type="submit" :disabled="loading"
            class="w-full flex items-center justify-center gap-2 bg-orange-400 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-500 active:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed">
            <!-- Loading spinner -->
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>

      </div>
    </div>
  </div>
</template>

