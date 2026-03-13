<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { label: 'Home',                    to: '/home' },
  { label: 'UV Index',                to: '/uv-index' },
  { label: 'Screen Reminder',         to: '/screen-reminder' },
  { label: 'Personal Recommendation', to: '/personal-recommendation' },
  { label: 'Data Insights',           to: '/data-insights' },
  { label: 'Effects Of Sun Exposure', to: '/effects-of-sun-exposure' },
  { label: 'Sunscreen Calculator',    to: '/sunscreen-calculator' },
]

function isActive(path) {
  return route.path === path
}
</script>

<template>
  <nav class="bg-white border-b border-gray-200 sticky top-14 z-40">
    <div class="max-w-screen-xl mx-auto px-6">
      <ul class="flex items-center gap-0 overflow-x-auto scrollbar-hide">
        <li v-for="item in navItems" :key="item.to">
          <RouterLink
            :to="item.to"
            class="relative block px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors"
            :class="isActive(item.to)
              ? 'text-orange-500'
              : 'text-gray-600 hover:text-gray-900'"
          >
            {{ item.label }}
            <!-- Active underline -->
            <span
              v-if="isActive(item.to)"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
            />
          </RouterLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
