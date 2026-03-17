<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'

// pageState tracks the current UI state and can be idle, locating, loading, success, or error
const pageState = ref('idle')
const errorMessage = ref('')
const coords = ref(null)
const locationName = ref('')
const uvIndex = ref(null)
const updatedAt = ref('')
const todayLabel = ref('')

// This array defines the color legend entries for the UV index chart
const uvBands = [
  { label: 'Low (0–2)', color: 'bg-green-500' },
  { label: 'Moderate (3–5)', color: 'bg-yellow-400' },
  { label: 'High (6–7)', color: 'bg-orange-500' },
  { label: 'Very High (8–10)', color: 'bg-red-500' },
  { label: 'Extreme (11+)', color: 'bg-purple-600' },
]

// These refs hold the DOM elements and ECharts instances for both charts
const uvChartRef = ref(null)
const tempChartRef = ref(null)
let uvChart = null
let tempChart = null

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

// This function fetches the UV index and hourly data from Open-Meteo and resolves the location name using Nominatim
async function fetchUVData() {
  pageState.value = 'loading'
  try {
    const lat = coords.value.lat
    const lng = coords.value.lng

    const uvRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat, longitude: lng,
        current: 'uv_index',
        hourly: 'uv_index,temperature_2m',
        timezone: 'auto',
        forecast_days: 1,
      },
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

    // This block processes hourly data to build chart labels and today's date label
    const hourly = uvRes.data.hourly
    const times = hourly.time
    const labels = []
    for (let i = 0; i < times.length; i++) {
      const h = parseInt(times[i].split('T')[1].split(':')[0])
      if (h === 0) labels.push('12am')
      else if (h < 12) labels.push(h + 'am')
      else if (h === 12) labels.push('12pm')
      else labels.push((h - 12) + 'pm')
    }
    const d = new Date(times[0])
    todayLabel.value = d.toLocaleDateString('en-AU', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

    pageState.value = 'success'

    // nextTick waits for the DOM to update before initializing the charts
    await nextTick()
    initUVChart(labels, hourly.uv_index)
    initTempChart(labels, hourly.temperature_2m)
  } catch (e) {
    pageState.value = 'error'
    errorMessage.value = 'Failed to fetch UV data. Please check your connection and try again.'
  }
}

// This function initializes the UV index ECharts line chart with color zones and tooltip
function initUVChart(labels, data) {
  if (uvChart) uvChart.dispose()
  uvChart = echarts.init(uvChartRef.value)
  uvChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const p = params[0]
        return '<b>' + p.name + '</b><br/>UV Index: <b>' + p.value + '</b>'
      },
    },
    grid: { left: 40, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category', data: labels,
      axisLabel: { color: '#6b7280', fontSize: 11 },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value', name: 'UV Index',
      nameTextStyle: { color: '#6b7280', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLabel: { color: '#6b7280', fontSize: 11 },
    },
    series: [{
      name: 'UV Index', type: 'line', data, smooth: true, symbol: 'none',
      lineStyle: { color: '#f97316', width: 2.5 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(249,115,22,0.35)' },
          { offset: 1, color: 'rgba(249,115,22,0.02)' },
        ]),
      },
      markArea: {
        silent: true, itemStyle: { opacity: 0.06 },
        data: [
          [{ yAxis: 3 }, { yAxis: 6, itemStyle: { color: '#facc15' } }],
          [{ yAxis: 6 }, { yAxis: 8, itemStyle: { color: '#f97316' } }],
          [{ yAxis: 8 }, { yAxis: 999, itemStyle: { color: '#ef4444' } }],
        ],
      },
    }],
  })
}

// This function initializes the temperature ECharts line chart
function initTempChart(labels, data) {
  if (tempChart) tempChart.dispose()
  tempChart = echarts.init(tempChartRef.value)
  const minTemp = Math.min(...data) - 2
  const maxTemp = Math.max(...data) + 2
  tempChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const p = params[0]
        return '<b>' + p.name + '</b><br/>Temperature: <b>' + p.value + '°C</b>'
      },
    },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category', data: labels,
      axisLabel: { color: '#6b7280', fontSize: 11 },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value', name: '°C',
      nameTextStyle: { color: '#6b7280', fontSize: 11 },
      min: Math.floor(minTemp), max: Math.ceil(maxTemp),
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLabel: { color: '#6b7280', fontSize: 11, formatter: '{value}°' },
    },
    series: [{
      name: 'Temperature', type: 'line', data, smooth: true, symbol: 'none',
      lineStyle: { color: '#3b82f6', width: 2.5 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59,130,246,0.30)' },
          { offset: 1, color: 'rgba(59,130,246,0.02)' },
        ]),
      },
    }],
  })
}

// This function resizes both charts when the browser window size changes
function onResize() {
  if (uvChart) uvChart.resize()
  if (tempChart) tempChart.resize()
}

onMounted(() => {
  requestLocation()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (uvChart) uvChart.dispose()
  if (tempChart) tempChart.dispose()
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

      <!-- ── Sun Protection & Sunscreen Guide ── -->
      <div class="bg-white shadow-sm border border-orange-100">

        <!-- Section header -->
        <div class="flex items-center gap-3 px-6 py-4 border-b border-orange-100 bg-orange-50">
          <span class="text-xl">🧴</span>
          <div>
            <h2 class="text-base font-bold text-gray-900">Sun Protection & Sunscreen Guide</h2>
            <p class="text-xs text-gray-500 mt-0.5">Personalised recommendations based on your current UV level</p>
          </div>
        </div>

        <div class="p-6 space-y-6">

          <!-- Recommended protective actions -->
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Recommended Actions</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                v-for="action in actions"
                :key="action.label"
                class="flex flex-col items-center gap-2 bg-orange-50 border border-orange-100 p-3"
              >
                <span class="text-2xl">{{ action.icon }}</span>
                <span class="text-xs text-gray-600 text-center font-medium">{{ action.label }}</span>
              </div>
              <div
                v-if="uvIndex < 3"
                class="col-span-2 sm:col-span-4 flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700"
              >
                <span class="text-base">✅</span>
                UV levels are currently low — no special precautions needed for short outdoor activities.
              </div>
            </div>
          </div>

          <!-- Divider -->
          <hr class="border-gray-100" />

          <!-- HIGH UV: sunscreen amount + body parts + tips -->
          <template v-if="needsSunscreen">

            <!-- Recommended amount banner -->
            <div class="bg-orange-500 text-white p-5 flex items-center gap-6">
              <div class="text-center shrink-0">
                <p class="text-6xl font-black leading-none">7</p>
                <p class="text-sm font-semibold mt-1">teaspoons</p>
                <p class="text-orange-200 text-xs">≈ 35 ml</p>
              </div>
              <div>
                <p class="text-sm font-semibold text-orange-100 mb-1">Recommended Amount — Full Body</p>
                <p class="text-xs text-orange-200 leading-relaxed">
                  Apply 20 minutes before going outdoors. Reapply every 2 hours, or every 40–80 minutes if swimming or sweating.
                </p>
              </div>
            </div>

            <!-- Body area breakdown + application tips side by side on larger screens -->
            <div class="grid sm:grid-cols-2 gap-6">

              <!-- Amount by body area -->
              <div>
                <h3 class="text-sm font-semibold text-gray-700 mb-3">Amount by Body Area</h3>
                <div class="space-y-1">
                  <div
                    v-for="part in bodyParts"
                    :key="part.name"
                    class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <span class="text-sm text-gray-700">{{ part.name }}</span>
                    <span class="text-sm font-semibold text-orange-500">{{ part.amount }} tsp</span>
                  </div>
                </div>
                <p class="text-xs text-gray-400 mt-3">1 tsp ≈ 5 ml · for adults of average body size</p>
              </div>

              <!-- Application tips -->
              <div>
                <h3 class="text-sm font-semibold text-gray-700 mb-3">Application Tips</h3>
                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <span class="text-base shrink-0">⏱️</span>
                    <p class="text-sm text-gray-600">Apply <strong>20 minutes before</strong> going outdoors.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-base shrink-0">🔄</span>
                    <p class="text-sm text-gray-600">Reapply every <strong>2 hours</strong>, or <strong>40–80 min</strong> if swimming or sweating.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-base shrink-0">🧴</span>
                    <p class="text-sm text-gray-600">Use <strong>SPF 30+</strong>. SPF 50+ when UV Index is 6 or above.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-base shrink-0">👀</span>
                    <p class="text-sm text-gray-600">Don't miss: <strong>ears, back of neck, tops of feet</strong>, and back of hands.</p>
                  </div>
                </div>
              </div>

            </div>

          </template>

          <!-- LOW UV: still-consider + good habits -->
          <template v-else-if="uvIndex !== null">

            <div class="grid sm:grid-cols-2 gap-6">

              <!-- Still consider sunscreen if... -->
              <div>
                <h3 class="text-sm font-semibold text-gray-700 mb-1">Still Consider Sunscreen If…</h3>
                <p class="text-xs text-gray-400 mb-3">Some situations increase exposure risk even at low UV:</p>
                <div class="space-y-2">
                  <div class="flex items-start gap-3 bg-gray-50 px-3 py-2.5">
                    <span class="text-lg shrink-0">👷</span>
                    <div>
                      <p class="text-sm font-semibold text-gray-800">Outdoor work</p>
                      <p class="text-xs text-gray-500">Hours outside let cumulative UV exposure add up.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3 bg-gray-50 px-3 py-2.5">
                    <span class="text-lg shrink-0">🚵</span>
                    <div>
                      <p class="text-sm font-semibold text-gray-800">Extended outdoor activities</p>
                      <p class="text-xs text-gray-500">Hiking or sports sessions over 2 hours warrant protection.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3 bg-gray-50 px-3 py-2.5">
                    <span class="text-lg shrink-0">❄️</span>
                    <div>
                      <p class="text-sm font-semibold text-gray-800">Reflective surfaces nearby</p>
                      <p class="text-xs text-gray-500">Snow, sand, and water reflect up to 80% of UV rays.</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Good habits -->
              <div>
                <h3 class="text-sm font-semibold text-gray-700 mb-3">Good Habits at Any UV Level</h3>
                <div class="space-y-2.5">
                  <div class="flex items-center gap-3 text-sm text-gray-600">
                    <span>👒</span><span>Wear a hat for extended outdoor periods</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm text-gray-600">
                    <span>🕶️</span><span>Sunglasses protect your eyes even on cloudy days</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm text-gray-600">
                    <span>🌡️</span><span>UV can rise quickly — check before long outdoor trips</span>
                  </div>
                </div>
              </div>

            </div>

          </template>

        </div>
      </div>
      <!-- ── End Sun Protection & Sunscreen Guide ── -->

      <!-- Hourly UV index chart -->
      <div class="bg-white shadow-sm border border-gray-100 p-6">
        <div class="mb-4">
          <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
            UV Index — Today
          </h2>
          <p class="text-xs text-gray-400 mt-0.5">Hourly UV Index values throughout the day</p>
        </div>
        <!-- Color legend for the UV risk bands on the chart -->
        <div class="flex flex-wrap gap-3 mb-4">
          <span v-for="band in uvBands" :key="band.label" class="flex items-center gap-1.5 text-xs text-gray-500">
            <span :class="['w-2.5 h-2.5 rounded-full', band.color]" />
            {{ band.label }}
          </span>
        </div>
        <div ref="uvChartRef" class="w-full" style="height: 280px;" />
      </div>

      <!-- Hourly temperature chart -->
      <div class="bg-white shadow-sm border border-gray-100 p-6">
        <div class="mb-4">
          <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
            Temperature — Today
          </h2>
          <p class="text-xs text-gray-400 mt-0.5">Hourly temperature in °C throughout the day</p>
        </div>
        <div ref="tempChartRef" class="w-full" style="height: 280px;" />
      </div>

      <!-- Location and date info bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 bg-white shadow-sm border border-gray-100 px-5 py-3">
        <div class="flex items-center gap-2 text-gray-700">
          <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="font-medium text-sm">{{ locationName }}</span>
        </div>
        <span class="text-gray-400 text-xs">{{ todayLabel }}</span>
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
