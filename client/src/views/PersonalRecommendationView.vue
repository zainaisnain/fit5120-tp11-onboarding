<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// This array contains skin tone definitions based on the Fitzpatrick scale
const SKIN_TONES = [
  {
    id: 1,
    label: 'Type I',
    name: 'Very Fair',
    color: '#f5e6d3',
    borderColor: '#e0c4a0',
    description: 'Always burns, never tans. Highest UV sensitivity.',
    uvAbsorption: 'Very Low melanin. UV radiation penetrates deeply, causing rapid DNA damage. Risk of burning within minutes at high UV.',
    sensitivity: 2.5,
    minSPF: { low: 30, moderate: 50, high: 50, veryHigh: 50, extreme: 50 },
  },
  {
    id: 2,
    label: 'Type II',
    name: 'Fair',
    color: '#f0d0a0',
    borderColor: '#d4a86a',
    description: 'Usually burns, sometimes tans. High UV sensitivity.',
    uvAbsorption: 'Low melanin content. Skin absorbs UV quickly. Sunburn can occur within 15–20 minutes at high UV levels.',
    sensitivity: 2.0,
    minSPF: { low: 30, moderate: 50, high: 50, veryHigh: 50, extreme: 50 },
  },
  {
    id: 3,
    label: 'Type III',
    name: 'Medium',
    color: '#c8956c',
    borderColor: '#a0714a',
    description: 'Sometimes burns, gradually tans. Moderate sensitivity.',
    uvAbsorption: 'Moderate melanin. Provides some natural protection but UV still causes cumulative skin damage over time.',
    sensitivity: 1.5,
    minSPF: { low: 15, moderate: 30, high: 50, veryHigh: 50, extreme: 50 },
  },
  {
    id: 4,
    label: 'Type IV',
    name: 'Olive',
    color: '#a0714a',
    borderColor: '#7a5235',
    description: 'Rarely burns, tans easily. Lower but real UV risk.',
    uvAbsorption: 'Higher melanin offers more natural protection. However, UV still causes skin ageing and cancer risk — protection is essential.',
    sensitivity: 1.0,
    minSPF: { low: 15, moderate: 30, high: 30, veryHigh: 50, extreme: 50 },
  },
  {
    id: 5,
    label: 'Type V',
    name: 'Brown',
    color: '#7a4a28',
    borderColor: '#5a3318',
    description: 'Very rarely burns, tans deeply. Do not skip protection.',
    uvAbsorption: 'High melanin. Often underestimated — UV damage still occurs, contributing to premature ageing and skin cancer over time.',
    sensitivity: 0.8,
    minSPF: { low: 15, moderate: 15, high: 30, veryHigh: 50, extreme: 50 },
  },
  {
    id: 6,
    label: 'Type VI',
    name: 'Dark',
    color: '#3d1f0d',
    borderColor: '#261208',
    description: 'Never visibly burns. UV damage still accumulates.',
    uvAbsorption: 'Highest melanin. Though burning is rare, UV-induced DNA damage, vitamin D concerns, and cancer risk remain real. Protection is still recommended.',
    sensitivity: 0.5,
    minSPF: { low: 15, moderate: 15, high: 30, veryHigh: 30, extreme: 50 },
  },
]

// This array defines available activity types and their duration multiplier for safe exposure calculation
const PREFERENCES = [
  { id: 'casual', label: '🚶 Casual Outdoor',  durationMult: 1.0 },
  { id: 'sport',  label: '🏃 Sport / Exercise', durationMult: 0.75 },
  { id: 'beach',  label: '🏖️ Beach / Swimming', durationMult: 0.5 },
  { id: 'work',   label: '👷 Outdoor Work',      durationMult: 0.6 },
]

// These refs store the selected skin tone, activity preference, UV index, location, and loading state
const selectedTone = ref(null)
const selectedPref = ref(PREFERENCES[0])
const uvIndex = ref(null)
const locationName = ref('')
const uvLoading = ref(false)
const uvError = ref(false)

// This function returns the UV level key string for a given UV index value
function getUVLevelKey(uv) {
  if (uv === null) return null
  if (uv <= 2) return 'low'
  if (uv <= 5) return 'moderate'
  if (uv <= 7) return 'high'
  if (uv <= 10) return 'veryHigh'
  return 'extreme'
}

// This function returns the display label text for a given UV level key
function getUVLevelLabel(key) {
  if (key === 'low') return 'Low'
  if (key === 'moderate') return 'Moderate'
  if (key === 'high') return 'High'
  if (key === 'veryHigh') return 'Very High'
  if (key === 'extreme') return 'Extreme'
  return '—'
}

// This function returns the Tailwind color classes for a given UV level key
function getUVLevelColor(key) {
  if (key === 'low') return 'bg-green-100 text-green-700'
  if (key === 'moderate') return 'bg-yellow-100 text-yellow-700'
  if (key === 'high') return 'bg-orange-100 text-orange-700'
  if (key === 'veryHigh') return 'bg-red-100 text-red-700'
  if (key === 'extreme') return 'bg-purple-100 text-purple-700'
  return 'bg-gray-100 text-gray-500'
}

// This function returns the background color class for the UV level card
function getUVCardBg(key) {
  if (key === 'low') return 'bg-green-500'
  if (key === 'moderate') return 'bg-yellow-400'
  if (key === 'high') return 'bg-orange-500'
  if (key === 'veryHigh') return 'bg-red-500'
  return 'bg-purple-600'
}

const uvLevelKey = computed(() => getUVLevelKey(uvIndex.value))
const uvLevelLabel = computed(() => getUVLevelLabel(uvLevelKey.value))
const uvLevelColor = computed(() => getUVLevelColor(uvLevelKey.value))

// This object maps each UV level key to its corresponding clothing recommendation data
const CLOTHING_BY_UV = {
  low: {
    summary: 'Regular casual clothing',
    items: [
      { icon: '👕', label: 'T-shirt or light top', detail: 'Any fabric is fine for short outdoor time' },
      { icon: '👟', label: 'Comfortable footwear', detail: 'Open shoes or trainers are suitable' },
    ],
  },
  moderate: {
    summary: 'Light sun-protective clothing',
    items: [
      { icon: '👕', label: 'Light long-sleeve top', detail: 'Loose, light-coloured fabric to reflect heat' },
      { icon: '👒', label: 'Wide-brim hat', detail: 'Protect face, neck and ears' },
      { icon: '🕶️', label: 'Sunglasses (UV400)', detail: 'Shield eyes from UV radiation' },
    ],
  },
  high: {
    summary: 'UV-protective clothing recommended',
    items: [
      { icon: '👕', label: 'Long-sleeve UV shirt (UPF 30+)', detail: 'Tightly woven fabric blocks UV effectively' },
      { icon: '👖', label: 'Long trousers or skirt', detail: 'Cover legs to reduce UV exposure' },
      { icon: '👒', label: 'Wide-brim hat (≥ 7.5 cm brim)', detail: 'Essential for face and neck coverage' },
      { icon: '🕶️', label: 'Wrap-around sunglasses', detail: 'Full UV400 protection, wraparound style preferred' },
    ],
  },
  veryHigh: {
    summary: 'Full UV protection required',
    items: [
      { icon: '👕', label: 'Long-sleeve UPF 50+ shirt', detail: 'Choose dark or bright colours for better UV blocking' },
      { icon: '👖', label: 'Long trousers / UV leggings', detail: 'Cover all limbs; lightweight breathable fabric' },
      { icon: '🎩', label: 'Full-brim or legionnaire hat', detail: 'Neck flap provides extra protection' },
      { icon: '🕶️', label: 'Wrap-around sunglasses (UV400)', detail: 'Side shields recommended' },
      { icon: '🧤', label: 'UV-protective gloves (optional)', detail: 'For extended outdoor work or activities' },
    ],
  },
  extreme: {
    summary: 'Stay indoors — full coverage if outside',
    items: [
      { icon: '🏠', label: 'Stay indoors if possible', detail: 'Extreme UV — outdoor activity is not recommended' },
      { icon: '👕', label: 'Full-coverage UPF 50+ clothing', detail: 'Cover every exposed area of skin' },
      { icon: '🎩', label: 'Legionnaire hat with neck flap', detail: 'Maximum coverage for head, face and neck' },
      { icon: '🕶️', label: 'Wrap-around UV400 sunglasses', detail: 'Full eye protection essential' },
      { icon: '☂️', label: 'UV-protective umbrella', detail: 'Additional overhead shielding when walking outdoors' },
    ],
  },
}

// This computed property calculates the personalised recommendation based on selected skin tone, activity type, and UV index
const recommendation = computed(() => {
  if (!selectedTone.value || uvIndex.value === null) return null

  const tone = selectedTone.value
  const pref = selectedPref.value
  const uv = uvIndex.value
  const key = uvLevelKey.value

  // This block calculates the safe outdoor exposure time in minutes without sunscreen
  let baseMinutes = 999
  if (uv > 0) {
    baseMinutes = Math.round(200 / (uv * tone.sensitivity))
  }
  const adjustedMinutes = Math.min(Math.round(baseMinutes * pref.durationMult), 180)

  // This line retrieves the clothing recommendation for the current UV level
  const clothing = CLOTHING_BY_UV[key]

  // This block builds a list of contextual outdoor activity tips based on the UV index and activity type
  const tips = []
  if (uv >= 3) tips.push({ icon: '🌳', text: 'Seek shade under trees, umbrellas or shelters' })
  if (uv >= 3) tips.push({ icon: '🕐', text: 'Avoid going out between 10am – 4pm when UV peaks' })
  if (uv >= 6) tips.push({ icon: '💧', text: 'Drink plenty of water to stay hydrated outdoors' })
  if (uv >= 6) tips.push({ icon: '🔄', text: 'Take regular breaks indoors or in deep shade' })
  if (uv >= 8) tips.push({ icon: '🚫', text: 'Limit outdoor activities to early morning or late afternoon only' })
  if (uv >= 11) tips.push({ icon: '🏠', text: 'Strongly advised to remain indoors during peak UV hours' })
  if (pref.id === 'beach') tips.push({ icon: '🌊', text: 'Sand and water reflect UV — protection is needed even in shade near water' })
  if (pref.id === 'sport') tips.push({ icon: '🏃', text: 'Plan outdoor exercise before 9am or after 5pm to avoid peak UV' })
  if (pref.id === 'work') tips.push({ icon: '🦺', text: 'Use portable shade structures and rotate workers exposed to direct sun' })
  if (uv <= 2) tips.push({ icon: '✅', text: 'UV is low today — short outdoor activities are generally safe' })

  return { adjustedMinutes, clothing, tips }
})

// This array contains melanin level labels indexed to match each Fitzpatrick skin tone id
const melaninLabels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High', 'Highest']

// This function requests geolocation and fetches the current UV index and location name
async function fetchUV() {
  uvLoading.value = true
  uvError.value = false
  try {
    const pos = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
    )
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
    } else if (addr.county) {
      locationName.value = addr.county
    } else {
      locationName.value = 'Your Location'
    }
  } catch (e) {
    uvError.value = true
  } finally {
    uvLoading.value = false
  }
}

onMounted(() => {
  fetchUV()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Page heading and subtitle -->
    <div class="max-w-4xl mx-auto px-4 pt-10 pb-6">
      <h1 class="text-2xl font-bold text-gray-900">Personal Recommendation</h1>
      <p class="text-gray-500 text-sm mt-1">
        Personalised sun protection advice based on your skin tone and current UV level
      </p>
    </div>

    <div class="max-w-4xl mx-auto px-4 pb-12 space-y-6">

      <!-- Input section with skin tone selector, UV display, and activity type selector -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <!-- Skin tone selection grid using the Fitzpatrick scale -->
        <div class="bg-white shadow-sm border border-gray-100 p-6">
          <h2 class="text-sm font-semibold text-gray-700 mb-4">
            Select Your Skin Tone
            <span class="text-gray-400 font-normal">(Fitzpatrick Scale)</span>
          </h2>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="tone in SKIN_TONES"
              :key="tone.id"
              class="flex flex-col items-center gap-2 p-3 border-2 transition"
              :class="selectedTone && selectedTone.id === tone.id
                ? 'border-orange-500 bg-orange-50 shadow-sm'
                : 'border-gray-100 hover:border-gray-300'"
              @click="selectedTone = tone"
            >
              <div
                class="w-10 h-10 rounded-full border-2 shadow-sm"
                :style="{ backgroundColor: tone.color, borderColor: tone.borderColor }"
              />
              <div class="text-center">
                <p class="text-xs font-semibold text-gray-700 leading-none">{{ tone.label }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ tone.name }}</p>
              </div>
            </button>
          </div>
          <p v-if="!selectedTone" class="mt-3 text-xs text-gray-400 text-center">
            Please select your skin tone to receive recommendations
          </p>
          <p v-else class="mt-3 text-xs text-gray-500 text-center">{{ selectedTone.description }}</p>
        </div>

        <!-- Right column with UV index card and activity type selector -->
        <div class="flex flex-col gap-5">

          <!-- Card showing the current UV index and location -->
          <div class="bg-white shadow-sm border border-gray-100 p-5">
            <h2 class="text-sm font-semibold text-gray-700 mb-3">Current UV Level</h2>
            <div v-if="uvLoading" class="flex items-center gap-2 text-gray-400 text-sm">
              <svg class="w-4 h-4 animate-spin text-orange-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Fetching UV data…
            </div>
            <div v-else-if="uvError" class="flex items-center gap-2">
              <span class="text-xs text-red-500">Location unavailable</span>
              <button class="text-xs text-orange-500 underline" @click="fetchUV">Retry</button>
            </div>
            <div v-else-if="uvIndex !== null" class="flex items-center gap-4">
              <div class="text-5xl font-black text-gray-900">{{ uvIndex }}</div>
              <div>
                <span :class="['text-xs font-semibold px-2 py-0.5', uvLevelColor]">
                  {{ uvLevelLabel }}
                </span>
                <p class="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  {{ locationName }}
                </p>
              </div>
            </div>
          </div>

          <!-- Button group for selecting the current activity type -->
          <div class="bg-white shadow-sm border border-gray-100 p-5">
            <h2 class="text-sm font-semibold text-gray-700 mb-3">Activity Type</h2>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="pref in PREFERENCES"
                :key="pref.id"
                class="text-xs py-2 px-3 border-2 text-left transition"
                :class="selectedPref && selectedPref.id === pref.id
                  ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                  : 'border-gray-100 text-gray-600 hover:border-gray-300'"
                @click="selectedPref = pref"
              >
                {{ pref.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- UV absorption info panel shown after a skin tone is selected -->
      <div
        v-if="selectedTone"
        class="bg-white shadow-sm border border-gray-100 p-6 transition-all"
      >
        <h2 class="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <div
            class="w-5 h-5 rounded-full border-2 shrink-0"
            :style="{ backgroundColor: selectedTone.color, borderColor: selectedTone.borderColor }"
          />
          {{ selectedTone.name }} Skin — UV Absorption
        </h2>
        <p class="text-sm text-gray-600 leading-relaxed mt-2">{{ selectedTone.uvAbsorption }}</p>

        <!-- Progress bar visualising the melanin level for the selected skin tone -->
        <div class="mt-4">
          <div class="flex justify-between text-xs text-gray-400 mb-1">
            <span>Melanin Level</span>
            <span>{{ melaninLabels[selectedTone.id - 1] }}</span>
          </div>
          <div class="h-2.5 bg-gray-100 overflow-hidden">
            <div
              class="h-full transition-all duration-500"
              :style="{
                width: `${(selectedTone.id / 6) * 100}%`,
                backgroundColor: selectedTone.color,
                border: `1px solid ${selectedTone.borderColor}`,
              }"
            />
          </div>
        </div>

        <div class="mt-4 bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 leading-relaxed">
          ⚠️ <strong>Important:</strong> No skin tone provides full UV protection. People with darker skin often underestimate their risk — UV-induced skin cancer and premature ageing affect all skin types.
        </div>
      </div>

      <!-- Placeholder shown before a skin tone has been selected -->
      <div
        v-else
        class="bg-white shadow-sm border border-gray-100 p-8 text-center text-gray-400"
      >
        <span class="text-3xl">👆</span>
        <p class="mt-2 text-sm">Select your skin tone above to see UV absorption information</p>
      </div>

      <!-- Recommendations section shown when both skin tone and UV data are available -->
      <div v-if="recommendation" class="space-y-5">
        <h2 class="text-base font-semibold text-gray-900 px-1">Your Recommendations</h2>

        <!-- Two-column card row showing safe exposure time and UV risk level -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Card showing the maximum safe outdoor exposure time -->
          <div class="bg-sky-500 text-white p-6 shadow">
            <p class="text-xs font-medium text-sky-100 uppercase tracking-wide">Max Safe Exposure Time</p>
            <p class="text-6xl font-black mt-2">
              {{ recommendation.adjustedMinutes >= 180 ? '3h+' : recommendation.adjustedMinutes + 'm' }}
            </p>
            <p class="text-xs text-sky-100 mt-2">
              Without protection · {{ selectedTone.name }} skin · {{ selectedPref.label }}
            </p>
          </div>
          <!-- Card showing the recommended SPF for the selected skin tone and UV level -->
          <div class="bg-amber-500 text-white p-6 shadow">
            <p class="text-xs font-medium text-amber-100 uppercase tracking-wide">Recommended SPF</p>
            <p class="text-6xl font-black mt-2">{{ selectedTone.minSPF[uvLevelKey] }}</p>
            <p class="text-xs text-amber-100 mt-2">
              Minimum SPF · {{ selectedTone.name }} skin · {{ uvLevelLabel }} UV
            </p>
          </div>
          <!-- Card showing the current UV index and risk level -->
          <div :class="['p-6 shadow flex flex-col justify-between', getUVCardBg(uvLevelKey)]">
            <div>
              <p class="text-xs font-medium text-white/80 uppercase tracking-wide">UV Risk Today</p>
              <p class="text-6xl font-black text-white mt-2">{{ uvIndex }}</p>
              <p class="text-lg font-bold text-white">{{ uvLevelLabel }}</p>
            </div>
            <p class="text-xs text-white/70 mt-2">{{ locationName }}</p>
          </div>
        </div>

        <!-- Card listing recommended clothing items for the current UV level -->
        <div class="bg-white shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xl">👗</span>
            <h3 class="text-base font-semibold text-gray-900">Recommended Clothing</h3>
          </div>
          <p class="text-xs text-gray-400 mb-4">{{ recommendation.clothing.summary }}</p>
          <div class="space-y-3">
            <div
              v-for="item in recommendation.clothing.items"
              :key="item.label"
              class="flex items-start gap-3 bg-gray-50 px-4 py-3"
            >
              <span class="text-2xl leading-none shrink-0">{{ item.icon }}</span>
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ item.label }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ item.detail }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Card listing contextual outdoor activity tips -->
        <div class="bg-white shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-xl">🗺️</span>
            <h3 class="text-sm font-semibold text-gray-800">Outdoor Activity Tips</h3>
          </div>
          <div class="space-y-3">
            <div
              v-for="tip in recommendation.tips"
              :key="tip.text"
              class="flex items-start gap-3 text-sm text-gray-700"
            >
              <span class="text-xl leading-none shrink-0">{{ tip.icon }}</span>
              <span class="leading-relaxed">{{ tip.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Placeholder shown when skin tone is selected but UV data is still loading or has failed -->
      <div
        v-else-if="selectedTone && (uvLoading || uvError)"
        class="bg-white shadow-sm border border-gray-100 p-8 text-center text-gray-400"
      >
        <span class="text-3xl">{{ uvLoading ? '⏳' : '❌' }}</span>
        <p class="mt-2 text-sm">
          {{ uvLoading ? 'Waiting for UV data to generate recommendations…' : 'UV data unavailable. Retry to get recommendations.' }}
        </p>
      </div>

      <!-- Placeholder shown in the recommendations area before a skin tone is selected -->
      <div
        v-else-if="!selectedTone"
        class="bg-white shadow-sm border border-gray-100 p-8 text-center text-gray-400"
      >
        <span class="text-3xl">📋</span>
        <p class="mt-2 text-sm">Your personalised recommendations will appear here once you select your skin tone</p>
      </div>

    </div>
  </div>
</template>
