<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// pageState tracks the current UI state and can be idle, locating, loading, success, or error
const pageState = ref('idle')
const errorMessage = ref('')
const coords = ref(null)
const locationName = ref('')
const uvIndex = ref(null)
const updatedAt = ref('')

// This function returns the color, gradient, and safety tip configuration for a given UV index value
function getUVConfig(uv) {
  if (uv <= 2) {
    return {
      label: 'Low', bg: 'bg-green-500', bgLight: 'bg-green-50',
      text: 'text-green-700', border: 'border-green-400', ring: 'ring-green-400',
      gradient: 'from-green-400 to-green-600',
      tip: 'UV levels are low. Enjoy the outdoors safely — sunscreen is optional for short trips.',
    }
  }
  if (uv <= 5) {
    return {
      label: 'Moderate', bg: 'bg-yellow-400', bgLight: 'bg-yellow-50',
      text: 'text-yellow-700', border: 'border-yellow-400', ring: 'ring-yellow-400',
      gradient: 'from-yellow-400 to-yellow-500',
      tip: 'Moderate UV. Apply SPF 30+ sunscreen, wear a hat and seek shade during midday.',
    }
  }
  if (uv <= 7) {
    return {
      label: 'High', bg: 'bg-orange-500', bgLight: 'bg-orange-50',
      text: 'text-orange-700', border: 'border-orange-400', ring: 'ring-orange-400',
      gradient: 'from-orange-400 to-orange-600',
      tip: 'High UV. Reduce time in the sun between 10am–4pm. Use SPF 50+, sunglasses and protective clothing.',
    }
  }
  if (uv <= 10) {
    return {
      label: 'Very High', bg: 'bg-red-500', bgLight: 'bg-red-50',
      text: 'text-red-700', border: 'border-red-400', ring: 'ring-red-400',
      gradient: 'from-red-500 to-red-600',
      tip: 'Very High UV. Minimise sun exposure. SPF 50+ is essential — reapply every 2 hours. Seek shade.',
    }
  }
  return {
    label: 'Extreme', bg: 'bg-purple-600', bgLight: 'bg-purple-50',
    text: 'text-purple-700', border: 'border-purple-500', ring: 'ring-purple-500',
    gradient: 'from-purple-500 to-purple-700',
    tip: 'Extreme UV — avoid going outdoors if possible. Full protective gear required if you must go outside.',
  }
}

// This computed property returns a filtered list of protective actions based on the current UV index
const actions = computed(() => {
  const all = [
    { icon: '🧴', label: 'Apply SPF 50+', minUV: 3 },
    { icon: '👒', label: 'Wear a hat',    minUV: 3 },
    { icon: '🕶️', label: 'Use sunglasses', minUV: 3 },
    { icon: '🌳', label: 'Seek shade',    minUV: 6 },
  ]
  const result = []
  for (let i = 0; i < all.length; i++) {
    if (uvIndex.value >= all[i].minUV) {
      result.push(all[i])
    }
  }
  return result
})

// This computed property returns the style configuration for the current UV index
const uvConfig = computed(() => {
  if (uvIndex.value === null) return getUVConfig(0)
  return getUVConfig(uvIndex.value)
})

// This computed property returns true when UV is 6 or above to show the danger banner
const isDangerous = computed(() => {
  if (uvIndex.value === null) return false
  return uvIndex.value >= 6
})

// This array defines the segments of the UV risk scale color bar
const scaleSegments = [
  { label: '0–2', color: 'bg-green-500', level: 'Low' },
  { label: '3–5', color: 'bg-yellow-400', level: 'Moderate' },
  { label: '6–7', color: 'bg-orange-500', level: 'High' },
  { label: '8–10', color: 'bg-red-500', level: 'Very High' },
  { label: '11+', color: 'bg-purple-600', level: 'Extreme' },
]

// This function requests geolocation permission from the browser and starts the loading process
async function requestLocation() {
  pageState.value = 'locating'
  errorMessage.value = ''

  if (!navigator.geolocation) {
    pageState.value = 'error'
    errorMessage.value = 'Your browser does not support geolocation.'
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      coords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      await fetchUVData()
    },
    (err) => {
      pageState.value = 'error'
      if (err.code === 1) {
        errorMessage.value = 'Location permission was denied. Please allow location access in your browser and try again.'
      } else if (err.code === 2) {
        errorMessage.value = 'Unable to determine your location. Please try again.'
      } else {
        errorMessage.value = 'Location request timed out. Please try again.'
      }
    },
    { timeout: 10000, enableHighAccuracy: true },
  )
}

// This function fetches the UV index from Open-Meteo and resolves the location name using Nominatim
async function fetchUVData() {
  pageState.value = 'loading'
  try {
    const lat = coords.value.lat
    const lng = coords.value.lng

    const uvRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: { latitude: lat, longitude: lng, current: 'uv_index', timezone: 'auto' },
    })
    const geoRes = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon: lng, format: 'json' },
      headers: { 'Accept-Language': 'en' },
    })

    uvIndex.value = Math.round(uvRes.data.current.uv_index * 10) / 10

    // This block extracts the most specific available place name from the geocoding response
    const addr = geoRes.data.address
    if (addr.city) {
      locationName.value = addr.city
    } else if (addr.town) {
      locationName.value = addr.town
    } else if (addr.suburb) {
      locationName.value = addr.suburb
    } else if (addr.county) {
      locationName.value = addr.county
    } else if (addr.state) {
      locationName.value = addr.state
    } else {
      locationName.value = 'Unknown Location'
    }

    updatedAt.value = new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
    pageState.value = 'success'
  } catch (e) {
    pageState.value = 'error'
    errorMessage.value = 'Failed to fetch UV data. Please check your connection and try again.'
  }
}

onMounted(() => {
  requestLocation()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Warning banner displayed when UV index reaches 6 or above -->
    <div
      v-if="isDangerous"
      class="bg-red-600 text-white text-center py-3 px-4 text-sm font-medium flex items-center justify-center gap-2"
    >
      <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      </svg>
      ⚠️ UV levels in {{ locationName }} are dangerously high — take sun protection measures immediately!
    </div>

    <!-- Page heading and subtitle -->
    <div class="max-w-3xl mx-auto px-4 pt-10 pb-6">
      <h1 class="text-2xl font-bold text-gray-900">UV Index</h1>
      <p class="text-gray-500 text-sm mt-1">Real-time UV levels based on your current location</p>
    </div>

    <!-- Loading spinner shown while locating or fetching UV data -->
    <div
      v-if="pageState === 'locating' || pageState === 'loading'"
      class="flex flex-col items-center justify-center py-32 gap-4"
    >
      <svg class="w-12 h-12 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
      <p class="text-gray-600 font-medium">
        {{ pageState === 'locating' ? 'Requesting location permission…' : 'Fetching UV data…' }}
      </p>
    </div>

    <!-- Error message shown when geolocation or data fetching fails -->
    <div
      v-else-if="pageState === 'error'"
      class="max-w-md mx-auto px-4 py-20 text-center"
    >
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-gray-800 mb-2">Unable to load UV data</h2>
      <p class="text-gray-500 text-sm mb-6">{{ errorMessage }}</p>
      <button
        class="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 transition"
        @click="requestLocation"
      >
        Try Again
      </button>
    </div>

    <!-- Success state showing the full UV data panel -->
    <div v-else-if="pageState === 'success'" class="max-w-3xl mx-auto px-4 pb-12 space-y-6">

      <!-- Main UV index card with gradient background -->
      <div :class="['rounded-2xl p-8 text-white shadow-lg bg-gradient-to-br', uvConfig.gradient]">
        <!-- Location name and refresh button row -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="text-lg font-semibold">{{ locationName }}</span>
          </div>
          <button
            class="text-white/70 hover:text-white transition flex items-center gap-1 text-xs"
            @click="fetchUVData"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
        </div>

        <!-- UV index number and risk level label -->
        <div class="flex items-end gap-6 mb-6">
          <div class="bg-white/20 px-8 py-5 backdrop-blur-sm">
            <span class="text-7xl font-black leading-none">{{ uvIndex }}</span>
          </div>
          <div>
            <p class="text-white/80 text-sm uppercase tracking-widest">UV Index</p>
            <p class="text-3xl font-bold">{{ uvConfig.label }}</p>
          </div>
        </div>

        <!-- Safety tip text for the current UV level -->
        <div class="bg-white/15 px-4 py-3 text-sm text-white/90 leading-relaxed">
          {{ uvConfig.tip }}
        </div>

        <!-- Last updated timestamp -->
        <p class="mt-4 text-white/60 text-xs text-right">Updated at {{ updatedAt }}</p>
      </div>

      <!-- UV risk scale color bar with level labels -->
      <div class="bg-white shadow-sm border border-gray-100 p-6">
        <h2 class="text-base font-semibold text-gray-800 mb-4">UV Risk Scale</h2>
        <div class="flex overflow-hidden mb-3 h-5">
          <div v-for="seg in scaleSegments" :key="seg.label" :class="[seg.color, 'flex-1']" />
        </div>
        <div class="flex">
          <div
            v-for="seg in scaleSegments"
            :key="seg.label + '-label'"
            class="flex-1 text-center"
          >
            <p class="text-xs font-semibold text-gray-700">{{ seg.label }}</p>
            <p class="text-xs text-gray-400">{{ seg.level }}</p>
          </div>
        </div>

        <!-- Highlight showing the user current risk level -->
        <div class="mt-4 flex items-center gap-2">
          <span class="text-sm text-gray-500">Your current level:</span>
          <span :class="['text-sm font-semibold px-2 py-0.5 text-white', uvConfig.bg]">
            {{ uvConfig.label }}
          </span>
        </div>
      </div>

      <!-- Recommended protective actions grid -->
      <div class="bg-white shadow-sm border border-gray-100 p-6">
        <h2 class="text-base font-semibold text-gray-800 mb-4">Recommended Actions</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <!-- Action items shown when UV index is 3 or above -->
          <div
            v-for="action in actions"
            :key="action.label"
            class="flex flex-col items-center gap-2 bg-gray-50 p-3"
          >
            <span class="text-2xl">{{ action.icon }}</span>
            <span class="text-xs text-gray-600 text-center font-medium">{{ action.label }}</span>
          </div>
          <!-- Message shown when UV index is below 3 -->
          <div
            v-if="uvIndex < 3"
            class="col-span-2 sm:col-span-4 text-center text-gray-400 text-sm py-2"
          >
            UV levels are currently low — no special precautions needed for short outdoor activities.
          </div>
        </div>
      </div>
    </div>

    <!-- Idle state shown before any location request has been made -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-32 gap-4 text-center px-4"
    >
      <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
        <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-gray-800">Enable Location Access</h2>
      <p class="text-gray-500 text-sm max-w-xs">
        We need your location to show real-time UV data for your area.
      </p>
      <button
        class="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 transition"
        @click="requestLocation"
      >
        Get My UV Index
      </button>
    </div>

  </div>
</template>
