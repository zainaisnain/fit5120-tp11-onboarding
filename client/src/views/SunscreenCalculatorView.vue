<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// These refs store the UV index, location name, and loading and error states
const uvIndex = ref(null)
const locationName = ref('')
const loading = ref(false)
const error = ref(false)
const errorMsg = ref('')

// This array defines the recommended sunscreen amount in teaspoons for each body area
const bodyParts = [
  { name: 'Face, Neck & Ears', amount: 1 },
  { name: 'Left Arm',          amount: 0.5 },
  { name: 'Right Arm',         amount: 0.5 },
  { name: 'Front Body',        amount: 1 },
  { name: 'Back Body',         amount: 1 },
  { name: 'Left Leg',          amount: 1.5 },
  { name: 'Right Leg',         amount: 1.5 },
]

// This computed property returns true when the UV index exceeds 3 and sunscreen is recommended
const needsSunscreen = computed(() => {
  if (uvIndex.value === null) return false
  return uvIndex.value > 3
})

// This function returns the text label for a given UV index value
function getUVLevelLabel(uv) {
  if (uv <= 2) return 'Low'
  if (uv <= 5) return 'Moderate'
  if (uv <= 7) return 'High'
  if (uv <= 10) return 'Very High'
  return 'Extreme'
}

function getUVBadgeClass(uv) {
  if (uv <= 2) return 'bg-green-100 text-green-700'
  if (uv <= 5) return 'bg-yellow-100 text-yellow-700'
  if (uv <= 7) return 'bg-orange-100 text-orange-700'
  if (uv <= 10) return 'bg-red-100 text-red-700'
  return 'bg-purple-100 text-purple-700'
}

// This function fetches the user GPS coordinates and retrieves the current UV index
async function fetchUV() {
  loading.value = true
  error.value = false
  errorMsg.value = ''

  try {
    // This block uses the browser Geolocation API to get the current latitude and longitude
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
    })

    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    // This call requests the current UV index from the Open-Meteo API
    const uvRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lng,
        current: 'uv_index',
        timezone: 'auto',
      },
    })

    // This call uses Nominatim reverse geocoding to convert coordinates to a city name
    const geoRes = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon: lng, format: 'json' },
      headers: { 'Accept-Language': 'en' },
    })

    uvIndex.value = Math.round(uvRes.data.current.uv_index * 10) / 10

    const addr = geoRes.data.address
    if (addr.city) {
      locationName.value = addr.city
    } else if (addr.town) {
      locationName.value = addr.town
    } else if (addr.suburb) {
      locationName.value = addr.suburb
    } else {
      locationName.value = 'Your Location'
    }

  } catch (e) {
    error.value = true
    // This check distinguishes a location permission denial from a network or API error
    if (e && e.code === 1) {
      errorMsg.value = 'Location permission denied. Please allow location access and try again.'
    } else {
      errorMsg.value = 'Failed to fetch UV data. Please check your connection and try again.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUV()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Page heading and subtitle -->
    <div class="max-w-3xl mx-auto px-4 pt-10 pb-6">
      <h1 class="text-2xl font-bold text-gray-900">Sunscreen Calculator</h1>
      <p class="text-gray-500 text-sm mt-1">
        Find out how much sunscreen you need based on today's UV Index
      </p>
    </div>

    <div class="max-w-3xl mx-auto px-4 pb-12 space-y-5">

      <!-- Loading spinner shown while detecting location and UV level -->
      <div
        v-if="loading"
        class="bg-white border border-gray-100 shadow-sm p-10 text-center"
      >
        <svg class="w-8 h-8 animate-spin text-orange-400 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <p class="mt-3 text-sm text-gray-400">Detecting your location and UV level…</p>
      </div>

      <!-- Error state shown when location or data fetching fails -->
      <div
        v-else-if="error"
        class="bg-white border border-red-100 shadow-sm p-8 text-center"
      >
        <p class="text-3xl">⚠️</p>
        <p class="mt-2 text-sm text-red-500">{{ errorMsg }}</p>
        <button
          class="mt-4 px-5 py-2 bg-orange-500 text-white text-sm hover:bg-orange-600 transition"
          @click="fetchUV"
        >
          Try Again
        </button>
      </div>

      <!-- Main content rendered after UV data is successfully loaded -->
      <template v-else-if="uvIndex !== null">

        <!-- Card showing the current UV index value and location -->
        <div class="bg-white border border-gray-100 shadow-sm p-6">
          <h2 class="text-sm font-semibold text-gray-600 mb-4">Current UV Index</h2>
          <div class="flex items-center gap-5">
            <div class="text-6xl font-black text-gray-900">{{ uvIndex }}</div>
            <div class="space-y-1">
              <span :class="['text-sm font-semibold px-3 py-1', getUVBadgeClass(uvIndex)]">
                {{ getUVLevelLabel(uvIndex) }}
              </span>
              <p class="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ locationName }}
              </p>
            </div>
          </div>
          <button
            class="mt-4 text-xs text-orange-500 hover:underline"
            @click="fetchUV"
          >
            Refresh
          </button>
        </div>

        <!-- Section shown when UV index is above 3 and sunscreen is recommended -->
        <template v-if="needsSunscreen">

          <!-- Card showing the total recommended sunscreen amount -->
          <div class="bg-orange-500 text-white shadow p-6">
            <p class="text-sm font-medium text-orange-100">Recommended Amount</p>
            <div class="flex items-end gap-3 mt-2">
              <span class="text-7xl font-black">7</span>
              <div class="pb-2">
                <p class="text-2xl font-bold">teaspoons</p>
                <p class="text-orange-200 text-sm">≈ 35 ml · for full body</p>
              </div>
            </div>
            <p class="text-orange-100 text-xs mt-3">
              Apply 20 minutes before going outdoors. Reapply every 2 hours.
            </p>
          </div>

          <!-- Card showing the recommended amount broken down by body area -->
          <div class="bg-white border border-gray-100 shadow-sm p-6">
            <h2 class="text-sm font-semibold text-gray-800 mb-4">Amount by Body Area</h2>
            <div class="space-y-2">
              <div
                v-for="part in bodyParts"
                :key="part.name"
                class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <span class="text-sm text-gray-700">{{ part.name }}</span>
                <span class="text-sm font-semibold text-orange-500">
                  {{ part.amount }} tsp
                </span>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-4">
              1 teaspoon = approx. 5 ml. Amounts above are for adults of average body size.
            </p>
          </div>

          <!-- Card listing sunscreen application tips -->
          <div class="bg-white border border-gray-100 shadow-sm p-6">
            <h2 class="text-sm font-semibold text-gray-800 mb-4">Application Tips</h2>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <span class="text-lg shrink-0">⏱️</span>
                <p class="text-sm text-gray-600">Apply sunscreen <strong>20 minutes before</strong> going outdoors to allow it to bond to your skin.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-lg shrink-0">🔄</span>
                <p class="text-sm text-gray-600">Reapply every <strong>2 hours</strong>, or every <strong>40–80 minutes</strong> if swimming or sweating.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-lg shrink-0">🧴</span>
                <p class="text-sm text-gray-600">Use <strong>SPF 30 or higher</strong>. SPF 50+ is recommended when UV Index is 6 or above.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-lg shrink-0">👀</span>
                <p class="text-sm text-gray-600">Don't forget often-missed areas: <strong>ears, back of neck, tops of feet</strong>, and the back of hands.</p>
              </div>
            </div>
          </div>

        </template>

        <!-- Section shown when UV index is 3 or below and sunscreen is not required -->
        <template v-else>

          <!-- Card confirming that UV levels are low and sunscreen is not needed -->
          <div class="bg-green-500 text-white shadow p-6">
            <p class="text-3xl font-black">UV is Low ✅</p>
            <p class="text-green-100 text-sm mt-2">
              Sunscreen is generally not required for everyday short outdoor activities at this UV level.
            </p>
          </div>

          <!-- Card listing situations where sunscreen may still be considered at low UV -->
          <div class="bg-white border border-gray-100 shadow-sm p-6">
            <h2 class="text-sm font-semibold text-gray-800 mb-1">Still Consider Sunscreen If…</h2>
            <p class="text-xs text-gray-400 mb-4">
              Even at low UV, some situations increase your skin's exposure risk:
            </p>
            <div class="space-y-3">
              <div class="flex items-start gap-3 bg-gray-50 px-4 py-3">
                <span class="text-xl shrink-0">👷</span>
                <div>
                  <p class="text-sm font-semibold text-gray-800">Outdoor work</p>
                  <p class="text-xs text-gray-500">If you spend several hours outside for work, cumulative UV exposure adds up.</p>
                </div>
              </div>
              <div class="flex items-start gap-3 bg-gray-50 px-4 py-3">
                <span class="text-xl shrink-0">🚵</span>
                <div>
                  <p class="text-sm font-semibold text-gray-800">Extended outdoor activities</p>
                  <p class="text-xs text-gray-500">Hiking, cycling, or sports sessions lasting more than 2 hours warrant protection.</p>
                </div>
              </div>
              <div class="flex items-start gap-3 bg-gray-50 px-4 py-3">
                <span class="text-xl shrink-0">❄️</span>
                <div>
                  <p class="text-sm font-semibold text-gray-800">Reflective surfaces nearby</p>
                  <p class="text-xs text-gray-500">Snow, sand, and water can reflect up to 80% of UV rays, intensifying exposure.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Card with general sun protection habits for any UV level -->
          <div class="bg-white border border-gray-100 shadow-sm p-6">
            <h2 class="text-sm font-semibold text-gray-800 mb-3">Good Habits at Any UV Level</h2>
            <div class="space-y-2">
              <div class="flex items-center gap-3 text-sm text-gray-600">
                <span>👒</span><span>Wear a hat if you plan to stay outdoors for extended periods</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-gray-600">
                <span>🕶️</span><span>Sunglasses protect your eyes from UV even on cloudy days</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-gray-600">
                <span>🌡️</span><span>UV levels can rise quickly — check again before long outdoor trips</span>
              </div>
            </div>
          </div>

        </template>

      </template>

    </div>
  </div>
</template>
