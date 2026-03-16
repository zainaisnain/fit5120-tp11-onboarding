<script setup>
import MelanomaChart from '@/components/MelanomaChart.vue'
import UVHeatTrendChart from '@/components/UVHeatTrendChart.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <div class="max-w-4xl mx-auto px-4 pt-10 pb-6">
      <h1 class="text-2xl font-bold text-gray-900">Data Insights</h1>
      <p class="text-gray-500 text-sm mt-1">
        Melanoma incidence and mortality trends across Australia
      </p>
    </div>

    <div class="max-w-4xl mx-auto px-4 pb-12 space-y-6">
      <MelanomaChart />
      <UVHeatTrendChart />
    </div>

  </div>
</template>
