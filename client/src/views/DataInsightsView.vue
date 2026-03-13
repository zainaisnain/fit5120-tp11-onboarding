<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'

// pageState tracks the current display state and can be idle, locating, loading, success, or error
const pageState = ref('idle')

// This array defines the color legend entries for the UV index chart
const uvBands = [
  { label: 'Low (0–2)', color: 'bg-green-500' },
  { label: 'Moderate (3–5)', color: 'bg-yellow-400' },
  { label: 'High (6–7)', color: 'bg-orange-500' },
  { label: 'Very High (8–10)', color: 'bg-red-500' },
  { label: 'Extreme (11+)', color: 'bg-purple-600' },
]
const errorMessage = ref('')
const locationName = ref('')
const todayLabel = ref('')

// These refs hold the DOM elements and ECharts instances for both charts
const uvChartRef = ref(null)
const tempChartRef = ref(null)
let uvChart = null
let tempChart = null

// This function requests geolocation permission and begins fetching weather data
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
      await fetchData(pos.coords.latitude, pos.coords.longitude)
    },
    (err) => {
      pageState.value = 'error'
      if (err.code === 1) {
        errorMessage.value = 'Location permission denied. Please allow location access and try again.'
      } else {
        errorMessage.value = 'Unable to determine your location. Please try again.'
      }
    },
    { timeout: 10000, enableHighAccuracy: true },
  )
}

// This function fetches hourly UV index and temperature data from Open-Meteo and renders the charts
async function fetchData(lat, lng) {
  pageState.value = 'loading'
  try {
    const weatherRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lng,
        hourly: 'uv_index,temperature_2m',
        timezone: 'auto',
        forecast_days: 1,
      },
    })
    const geoRes = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon: lng, format: 'json' },
      headers: { 'Accept-Language': 'en' },
    })

    // This block extracts the most specific available location name from the geocoding response
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
      locationName.value = 'Your Location'
    }

    const hourly = weatherRes.data.hourly
    const times = hourly.time           // times is an array of ISO datetime strings such as 2025-03-12T00:00
    const uvData = hourly.uv_index      // uvData contains the hourly UV index values
    const tempData = hourly.temperature_2m

    if (!times || times.length === 0) {
      pageState.value = 'error'
      errorMessage.value = 'No data available for today.'
      return
    }

    // This loop converts each ISO timestamp to a human-readable hour label such as 12am or 6pm
    const labels = []
    for (let i = 0; i < times.length; i++) {
      const h = parseInt(times[i].split('T')[1].split(':')[0])
      if (h === 0) {
        labels.push('12am')
      } else if (h < 12) {
        labels.push(h + 'am')
      } else if (h === 12) {
        labels.push('12pm')
      } else {
        labels.push((h - 12) + 'pm')
      }
    }

    // This block formats today's date as a readable string for display
    const d = new Date(times[0])
    todayLabel.value = d.toLocaleDateString('en-AU', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

    pageState.value = 'success'

    // nextTick waits for the DOM to update before initializing the charts
    await nextTick()
    initUVChart(labels, uvData)
    initTempChart(labels, tempData)
  } catch (e) {
    pageState.value = 'error'
    errorMessage.value = 'Failed to fetch data. Please check your connection and try again.'
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
      type: 'category',
      data: labels,
      axisLabel: { color: '#6b7280', fontSize: 11 },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value',
      name: 'UV Index',
      nameTextStyle: { color: '#6b7280', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLabel: { color: '#6b7280', fontSize: 11 },
    },
    series: [
      {
        name: 'UV Index',
        type: 'line',
        data: data,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#f97316', width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(249,115,22,0.35)' },
            { offset: 1, color: 'rgba(249,115,22,0.02)' },
          ]),
        },
        markArea: {
          silent: true,
          itemStyle: { opacity: 0.06 },
          data: [
            [{ yAxis: 3 }, { yAxis: 6, itemStyle: { color: '#facc15' } }],
            [{ yAxis: 6 }, { yAxis: 8, itemStyle: { color: '#f97316' } }],
            [{ yAxis: 8 }, { yAxis: 999, itemStyle: { color: '#ef4444' } }],
          ],
        },
      },
    ],
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
      type: 'category',
      data: labels,
      axisLabel: { color: '#6b7280', fontSize: 11 },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value',
      name: '°C',
      nameTextStyle: { color: '#6b7280', fontSize: 11 },
      min: Math.floor(minTemp),
      max: Math.ceil(maxTemp),
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLabel: { color: '#6b7280', fontSize: 11, formatter: '{value}°' },
    },
    series: [
      {
        name: 'Temperature',
        type: 'line',
        data: data,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#3b82f6', width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59,130,246,0.30)' },
            { offset: 1, color: 'rgba(59,130,246,0.02)' },
          ]),
        },
      },
    ],
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

    <!-- Page heading and subtitle -->
    <div class="max-w-4xl mx-auto px-4 pt-10 pb-6">
      <h1 class="text-2xl font-bold text-gray-900">Data Insights</h1>
      <p class="text-gray-500 text-sm mt-1">
        Today's UV Index and temperature trends for your location
      </p>
    </div>

    <!-- Loading state shown while locating or fetching data -->
    <div v-if="pageState === 'locating' || pageState === 'loading'"
      class="flex flex-col items-center justify-center py-32 gap-4">
      <svg class="w-12 h-12 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <p class="text-gray-600 font-medium">
        {{ pageState === 'locating' ? 'Requesting location…' : "Loading today's data…" }}
      </p>
    </div>

    <!-- Error state shown when location or data fetching fails -->
    <div v-else-if="pageState === 'error'" class="max-w-md mx-auto px-4 py-20 text-center">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-gray-800 mb-2">Unable to load data</h2>
      <p class="text-gray-500 text-sm mb-6">{{ errorMessage }}</p>
      <button class="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 transition"
        @click="requestLocation">
        Try Again
      </button>
    </div>

    <!-- Success state showing the location bar and both charts -->
    <div v-else-if="pageState === 'success'" class="max-w-4xl mx-auto px-4 pb-12 space-y-6">

      <!-- Location name and today date info bar -->
      <div
        class="flex flex-wrap items-center justify-between gap-2 bg-white shadow-sm border border-gray-100 px-5 py-3">
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

      <!-- First chart showing hourly UV index values -->
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

      <!-- Second chart showing hourly temperature values -->
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

    </div>

    <!-- Idle state shown before geolocation has been requested -->
    <div v-else class="flex flex-col items-center justify-center py-32 gap-4 text-center px-4">
      <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
        <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-gray-800">View Today's UV & Temperature Data</h2>
      <p class="text-gray-500 text-sm max-w-xs">Enable location access to load charts for your area.</p>
      <button class="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 transition"
        @click="requestLocation">
        Load Data
      </button>
    </div>

  </div>
</template>
