<script setup>
import { ref } from 'vue'

function scrollDown() {
  document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth' })
}

const features = ref([
  {
    icon: '☀️',
    title: 'UV Index',
    description: 'Get real-time UV Index data for your location and know when the sun becomes dangerous.',
    to: '/uv-index',
    color: 'bg-orange-50 border-orange-200',
    iconBg: 'bg-orange-100',
  },
  {
    icon: '🔔',
    title: 'Screen Reminder',
    description: 'Set customisable sunscreen reminders so you never miss a reapplication.',
    to: '/screen-reminder',
    color: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100',
  },
  {
    icon: '👤',
    title: 'Personal Recommendation',
    description: 'Personalised advice based on your skin tone, UV level, and outdoor plans.',
    to: '/personal-recommendation',
    color: 'bg-rose-50 border-rose-200',
    iconBg: 'bg-rose-100',
  },
  {
    icon: '📊',
    title: 'Data Insights',
    description: 'Visualise UV trends and temperature data to understand your sun exposure risk.',
    to: '/data-insights',
    color: 'bg-emerald-50 border-emerald-200',
    iconBg: 'bg-emerald-100',
  },
  {
    icon: '🧴',
    title: 'Sunscreen Calculator',
    description: 'Find out exactly how much sunscreen to apply based on the current UV Index.',
    to: '/sunscreen-calculator',
    color: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100',
  },
  {
    icon: '☀️',
    title: 'Effects Of Sun Exposure',
    description: 'Learn how UV radiation affects your skin in the short and long term.',
    to: '/effects-of-sun-exposure',
    color: 'bg-violet-50 border-violet-200',
    iconBg: 'bg-violet-100',
  },
])
</script>

<template>
  <div>
    <!-- ── Hero Banner ── -->
    <section
      class="relative w-full flex items-center justify-center overflow-hidden"
      style="height: calc(100vh - 112px);"
    >
      <!-- GIF background -->
      <img
        src="/images/home-bg.gif"
        alt=""
        class="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      />

      <!-- Hero text -->
      <div class="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <h1
          class="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
          style="text-shadow: 0 2px 12px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9);"
        >
          Every tool you could want to manage your UV exposure
        </h1>
        <p
          class="mt-5 text-base md:text-lg text-white leading-relaxed"
          style="text-shadow: 0 1px 6px rgba(0,0,0,0.8);"
        >
          Stay informed about the UV Index, set reminders, and learn about skin protection and statistics.
        </p>
      </div>

      <!-- Scroll down chevron -->
      <button
        class="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 hover:text-white transition animate-bounce"
        aria-label="Scroll down"
        @click="scrollDown"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
    </section>

    <!-- ── Feature Cards ── -->
    <section id="content-section" class="py-16 px-6 bg-gray-50">
      <div class="max-w-screen-xl mx-auto">
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Explore Our Features</h2>
          <p class="mt-2 text-gray-500 text-sm md:text-base">
            Everything you need to stay sun-safe in Australia
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <RouterLink
            v-for="feature in features"
            :key="feature.title"
            :to="feature.to"
            :class="['group border p-6 transition hover:shadow-md hover:-translate-y-0.5', feature.color]"
          >
            <div :class="['w-12 h-12 flex items-center justify-center text-2xl mb-4', feature.iconBg]">
              {{ feature.icon }}
            </div>
            <h3 class="font-semibold text-gray-900 text-base mb-1 group-hover:text-orange-500 transition">
              {{ feature.title }}
            </h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ feature.description }}</p>
          </RouterLink>
        </div>
      </div>
    </section>


    <!-- ── Footer ── -->
    <footer class="bg-gray-700 py-5 px-6">
      <div class="flex items-center justify-center gap-5">
        <span class="text-white text-sm font-medium">Contact Us</span>
        <!-- Facebook -->
        <a href="#" class="text-white/80 hover:text-white transition" aria-label="Facebook">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
          </svg>
        </a>
        <!-- Twitter / X -->
        <a href="#" class="text-white/80 hover:text-white transition" aria-label="Twitter">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
          </svg>
        </a>
        <!-- Pinterest -->
        <a href="#" class="text-white/80 hover:text-white transition" aria-label="Pinterest">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
          </svg>
        </a>
        <!-- LinkedIn -->
        <a href="#" class="text-white/80 hover:text-white transition" aria-label="LinkedIn">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
            <circle cx="4" cy="4" r="2"/>
          </svg>
        </a>
      </div>
    </footer>
  </div>
</template>
