<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

// These refs store the current UV index, location name, loading state, and error state
const uvIndex = ref(null)
const locationName = ref('')
const uvLoading = ref(false)
const uvError = ref(false)

// These refs store the reminder configuration including the toggle state, interval, and start time
const reminderOn = ref(false)
const intervalMinutes = ref(120)  // default interval is 2 hours
const startTime = ref('')

// These refs hold the active timer handle and the next scheduled reminder time
const timerHandle = ref(null)
const nextReminderTime = ref(null)

// This array defines the three available reminder interval options
const intervalOptions = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour',     value: 60 },
  { label: '2 hours',    value: 120 },
]

function getUVLabel(uv) {
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

function needsReminder() {
  if (uvIndex.value === null) return false
  return uvIndex.value >= 3
}

function formatNextTime() {
  if (!nextReminderTime.value) return '—'
  return nextReminderTime.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function fetchUV() {
  uvLoading.value = true
  uvError.value = false
  try {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
    })
    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    const uvRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: { latitude: lat, longitude: lng, current: 'uv_index', timezone: 'auto' },
    })
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
    uvError.value = true
  } finally {
    uvLoading.value = false
  }
}

// This function sends a browser notification and calculates when the next reminder will fire
function triggerReminder() {
  if (Notification.permission === 'granted') {
    new Notification('☀️ Sunscreen Reminder', {
      body: 'Time to reapply your sunscreen! Stay protected.',
    })
  }

  // This block calculates and stores the next reminder time for display
  const next = new Date()
  next.setMinutes(next.getMinutes() + intervalMinutes.value)
  nextReminderTime.value = next
}

async function startReminder() {
  // This block requests browser notification permission before activating the reminder
  if ('Notification' in window) {
    await Notification.requestPermission()
  }

  if (timerHandle.value) clearInterval(timerHandle.value)

  // This block calculates the delay in milliseconds until the configured start time
  let delay = 0
  if (startTime.value) {
    const parts = startTime.value.split(':')
    const h = Number(parts[0])
    const m = Number(parts[1])
    const start = new Date()
    start.setHours(h, m, 0, 0)
    delay = start - Date.now()
    if (delay < 0) delay = 0
  }

  // This block calculates when the first reminder will fire and stores it for display
  const next = new Date()
  next.setMilliseconds(next.getMilliseconds() + delay + intervalMinutes.value * 60 * 1000)
  nextReminderTime.value = next

  setTimeout(() => {
    triggerReminder()
    timerHandle.value = setInterval(triggerReminder, intervalMinutes.value * 60 * 1000)
  }, delay)

  reminderOn.value = true
}

function stopReminder() {
  if (timerHandle.value) {
    clearInterval(timerHandle.value)
    timerHandle.value = null
  }
  reminderOn.value = false
  nextReminderTime.value = null
}

function toggleReminder() {
  if (reminderOn.value) {
    stopReminder()
  } else {
    startReminder()
  }
}

onUnmounted(() => {
  if (timerHandle.value) clearInterval(timerHandle.value)
})

onMounted(() => {
  fetchUV()
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  startTime.value = h + ':' + m
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Page heading and subtitle -->
    <div class="max-w-2xl mx-auto px-4 pt-10 pb-6">
      <h1 class="text-2xl font-bold text-gray-900">Sunscreen Reminder</h1>
      <p class="text-gray-500 text-sm mt-1">
        Set reminders to reapply sunscreen and stay protected throughout the day
      </p>
    </div>

    <div class="max-w-2xl mx-auto px-4 pb-12 space-y-5">

      <!-- Card showing the current UV index and location -->
      <div class="bg-white border border-gray-100 shadow-sm p-5">
        <h2 class="text-sm font-semibold text-gray-600 mb-3">Current UV Index</h2>

        <div v-if="uvLoading" class="flex items-center gap-2 text-gray-400 text-sm">
          <svg class="w-4 h-4 animate-spin text-orange-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Fetching UV data…
        </div>

        <div v-else-if="uvError" class="flex items-center gap-3">
          <span class="text-sm text-red-500">Location unavailable</span>
          <button class="text-xs text-orange-500 underline" @click="fetchUV">Retry</button>
        </div>

        <div v-else-if="uvIndex !== null" class="flex items-center gap-4">
          <div class="text-5xl font-black text-gray-900">{{ uvIndex }}</div>
          <div>
            <span :class="['text-sm font-semibold px-3 py-1', getUVBadgeClass(uvIndex)]">
              {{ getUVLabel(uvIndex) }}
            </span>
            <p class="text-xs text-gray-400 mt-1">{{ locationName }}</p>
          </div>
        </div>

        <div
          v-if="uvIndex !== null && !needsReminder()"
          class="mt-3 bg-green-50 border border-green-200 px-4 py-3 text-xs text-green-700"
        >
          ✅ UV is currently low. Sunscreen reminders are generally not needed, but you can still enable one if going outdoors for extended periods.
        </div>

        <div
          v-if="needsReminder()"
          class="mt-3 bg-orange-50 border border-orange-200 px-4 py-3 text-xs text-orange-700"
        >
          ☀️ UV is elevated. It is recommended to reapply sunscreen every 2 hours.
        </div>
      </div>

      <!-- Card containing the reminder interval and start time settings -->
      <div class="bg-white border border-gray-100 shadow-sm p-6">
        <h2 class="text-sm font-semibold text-gray-800 mb-5">Reminder Settings</h2>

        <!-- Toggle switch for enabling or disabling the reminder -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <p class="text-sm font-medium text-gray-700">Enable Reminder</p>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ reminderOn ? 'Reminder is active' : 'Reminder is off' }}
            </p>
          </div>
          <button
            class="relative w-12 h-6 rounded-full transition-colors"
            :class="reminderOn ? 'bg-orange-500' : 'bg-gray-200'"
            @click="toggleReminder"
          >
            <span
              class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
              :class="reminderOn ? 'translate-x-6' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Button group for selecting the reminder interval -->
        <div class="mb-5">
          <label class="block text-xs font-semibold text-gray-600 mb-2">Reminder Interval</label>
          <div class="flex gap-2">
            <button
              v-for="opt in intervalOptions"
              :key="opt.value"
              class="flex-1 py-2 border-2 text-xs text-center transition"
              :class="intervalMinutes === opt.value
                ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                : 'border-gray-100 text-gray-600 hover:border-gray-300'"
              :disabled="reminderOn"
              @click="intervalMinutes = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Time input for configuring when the first reminder fires -->
        <div class="mb-5">
          <label class="block text-xs font-semibold text-gray-600 mb-2">Start Time</label>
          <input
            v-model="startTime"
            type="time"
            :disabled="reminderOn"
            class="border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-orange-400 disabled:opacity-50"
          />
          <p class="text-xs text-gray-400 mt-1">
            First reminder fires at this time, then every {{ intervalMinutes }} minutes
          </p>
        </div>

        <!-- Note explaining how browser notifications work -->
        <div class="bg-gray-50 px-4 py-3 text-xs text-gray-500 leading-relaxed mb-5">
          When the reminder fires, you will receive a browser notification. Make sure to allow notifications when prompted.
        </div>

        <button
          v-if="!reminderOn"
          class="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition"
          @click="toggleReminder"
        >
          Start Reminder
        </button>
        <button
          v-else
          class="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm transition"
          @click="toggleReminder"
        >
          Stop Reminder
        </button>
      </div>

      <!-- Active reminder status card shown when reminder is enabled -->
      <div v-if="reminderOn" class="bg-orange-500 text-white shadow p-6">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-2xl">⏰</span>
          <p class="font-bold">Reminder Active</p>
        </div>
        <p class="text-orange-100 text-sm">
          Next reminder at <strong class="text-white">{{ formatNextTime() }}</strong>
        </p>
        <p class="text-orange-100 text-xs mt-1">
          Repeating every {{ intervalMinutes }} minutes
        </p>
      </div>

    </div>
  </div>
</template>
