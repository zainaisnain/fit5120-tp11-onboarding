<script setup>
import MelanomaChart from '@/components/MelanomaChart.vue'
import UVHeatTrendChart from '@/components/UVHeatTrendChart.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Page header -->
    <div class="max-w-4xl mx-auto px-4 pt-10 pb-6">
      <h1 class="text-2xl font-bold text-gray-900">Data Insights</h1>
      <p class="text-gray-500 text-sm mt-1">
        Explore the relationship between UV exposure and skin cancer in young Australians
      </p>
    </div>

    <div class="max-w-4xl mx-auto px-4 pb-12 space-y-10">

      <!-- ── Section 1: Melanoma ── -->
      <section>
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-2">Melanoma in Young Australians</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            Australia has one of the highest rates of melanoma in the world<sup class="text-orange-500 font-medium">[1]</sup>, a direct consequence of its high UV environment and outdoor culture.
            Among young Australians aged 15 to 29, melanoma remains a significant concern, with incidence rates rising across the decades since records began in 1982.<sup class="text-orange-500 font-medium">[2]</sup>
            Sun exposure accumulated during childhood and early adulthood is a key driver of lifetime melanoma risk.
            <span class="font-medium text-gray-700">Males in this age group consistently show higher rates than females across both incidence and mortality.</span><sup class="text-orange-500 font-medium">[2]</sup>
          </p>
        </div>

        <!-- Key stat callouts -->
        <div class="grid grid-cols-3 gap-3 mb-5">
          <div class="bg-orange-50 border border-orange-100 rounded p-4 text-center">
            <p class="text-2xl font-bold text-orange-500">2×</p>
            <p class="text-xs text-gray-500 mt-1">Males diagnosed at nearly twice the rate of females at peak years<sup class="text-orange-500">[2]</sup></p>
          </div>
          <div class="bg-indigo-50 border border-indigo-100 rounded p-4 text-center">
            <p class="text-2xl font-bold text-indigo-500">4th</p>
            <p class="text-xs text-gray-500 mt-1">Most common cancer in Australia by total incidence count<sup class="text-orange-500">[2]</sup></p>
          </div>
          <div class="bg-green-50 border border-green-100 rounded p-4 text-center">
            <p class="text-2xl font-bold text-green-600">↑ Rising</p>
            <p class="text-xs text-gray-500 mt-1">Incidence has trended upward for over 35 years<sup class="text-orange-500">[2]</sup></p>
          </div>
        </div>

        <MelanomaChart />

        <p class="text-xs text-gray-400 mt-3 leading-relaxed">
          Rates shown are the average age-specific rate per 100,000 population across the 15–19, 20–24, and 25–29 age groups. Toggle between
          <span class="font-medium text-gray-500">Incidence</span>,
          <span class="font-medium text-gray-500">Mortality</span>, and
          <span class="font-medium text-gray-500">Both</span> to see how the gap has grown over time.
          Switch between sex groups to compare trends.
        </p>
      </section>

      <!-- Connector narrative -->
      <div class="border-l-4 border-orange-300 pl-4 py-1">
        <p class="text-sm text-gray-600 leading-relaxed italic">
          "So what's driving this rise? The answer lies in how much UV radiation Australians are exposed to
          and how that exposure has changed over the decades."
        </p>
      </div>

      <!-- ── Section 2: UV Trend ── -->
      <section>
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-2">UV Exposure During Summer</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            Melbourne's summer UV levels tell a clear story. Measuring daytime UV readings across December, January and February
            from 2007 to 2024, peak UV have remained consistently high, often reaching
            <span class="font-medium text-gray-700">Extreme levels (UV 11+)</span> during peak summer.<sup class="text-orange-500 font-medium">[3]</sup>
            UV at these levels can cause sunburn in as little as 10 minutes for fair-skinned individuals,<sup class="text-orange-500 font-medium">[4]</sup>
            and repeated exposure is the leading preventable cause of melanoma.<sup class="text-orange-500 font-medium">[1]</sup> Average UV levels has also shown no significant decline, indicating that the overall UV environment has not improved.
            The data shows there is no "safe" summer in Melbourne.
          </p>
        </div>

        <!-- Key stat callouts -->
        <div class="grid grid-cols-3 gap-3 mb-5">
          <div class="bg-yellow-50 border border-yellow-100 rounded p-4 text-center">
            <p class="text-2xl font-bold text-yellow-500">11+</p>
            <p class="text-xs text-gray-500 mt-1">Peak UV regularly reaches Extreme levels in Melbourne summers<sup class="text-orange-500">[3]</sup></p>
          </div>
          <div class="bg-red-50 border border-red-100 rounded p-4 text-center">
            <p class="text-2xl font-bold text-red-500">10 min</p>
            <p class="text-xs text-gray-500 mt-1">Time to sunburn at UV 11+ for fair skin without protection<sup class="text-orange-500">[4]</sup></p>
          </div>
          <div class="bg-orange-50 border border-orange-100 rounded p-4 text-center">
            <p class="text-2xl font-bold text-orange-500">18 yrs</p>
            <p class="text-xs text-gray-500 mt-1">Of continuous high UV summers captured in this dataset<sup class="text-orange-500">[3]</sup></p>
          </div>
        </div>

        <UVHeatTrendChart />

        <p class="text-xs text-gray-400 mt-3 leading-relaxed">
          Data collected at Burwood, VIC. Only daytime readings (UV &gt; 0) during Australian summer months (Dec–Feb) are included.
          Toggle between <span class="font-medium text-gray-500">Average UV</span> and
          <span class="font-medium text-gray-500">Peak UV</span> to see both the typical and worst-case daily exposure each year.
        </p>
      </section>

<!-- ── Sources ── -->
      <section class="border-t border-gray-200 pt-6">
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sources</h3>
        <ol class="space-y-2 text-xs text-gray-500">
          <li>
            <span class="font-medium text-gray-600">[1]</span>
            Cancer Council Australia. <em>Melanoma of the skin.</em>
            <a href="https://www.cancer.org.au/cancer-information/types-of-cancer/melanoma" target="_blank" rel="noopener"
              class="text-orange-500 hover:underline ml-1">cancer.org.au</a>
          </li>
          <li>
            <span class="font-medium text-gray-600">[2]</span>
            Australian Institute of Health and Welfare (AIHW). <em>Cancer in Australia 2023. Cancer incidence data by diagnosis (CDiA).</em>
            AIHW Cat. No. CAN 122.
            <a href="https://www.aihw.gov.au/reports/cancer/cancer-data-in-australia" target="_blank" rel="noopener"
              class="text-orange-500 hover:underline ml-1">aihw.gov.au</a>
            &middot;
            <a href="https://data.gov.au/dataset/ds-dga-84b03a21-2f6a-4d5d-ab24-1130e0d06f8e" target="_blank" rel="noopener"
              class="text-orange-500 hover:underline">data.gov.au</a>
            &middot;
            <a href="https://creativecommons.org/licenses/by/2.5/au/" target="_blank" rel="noopener"
              class="text-orange-500 hover:underline">CC BY 2.5 AU</a>
          </li>
          <li>
            <span class="font-medium text-gray-600">[3]</span>
            Australian Radiation Protection and Nuclear Safety Agency (ARPANSA). <em>Solar UV data, Melbourne (Burwood), VIC, 2007–2024.</em>
            <a href="https://www.arpansa.gov.au/our-services/monitoring/ultraviolet-radiation-monitoring" target="_blank" rel="noopener"
              class="text-orange-500 hover:underline ml-1">arpansa.gov.au</a>
            &middot;
            <a href="https://data.gov.au/dataset/ds-dga-6d934200-75a3-41bc-8936-01cac1ab84dc" target="_blank" rel="noopener"
              class="text-orange-500 hover:underline">data.gov.au</a>
            &middot;
            <a href="https://creativecommons.org/licenses/by/2.5/au/" target="_blank" rel="noopener"
              class="text-orange-500 hover:underline">CC BY 2.5 AU</a>
          </li>
          <li>
            <span class="font-medium text-gray-600">[4]</span>
            World Health Organization (WHO). <em>Ultraviolet radiation and health.</em>
            <a href="https://www.who.int/news-room/fact-sheets/detail/ultraviolet-radiation" target="_blank" rel="noopener"
              class="text-orange-500 hover:underline ml-1">who.int</a>
          </li>
        </ol>
        <p class="text-xs text-gray-400 mt-3">
          Datasets [2] and [3] are made available under the
          <a href="https://creativecommons.org/licenses/by/2.5/au/" target="_blank" rel="noopener"
            class="text-orange-500 hover:underline">Creative Commons Attribution 2.5 Australia (CC BY 2.5 AU)</a>
          licence via
          <a href="https://data.gov.au" target="_blank" rel="noopener"
            class="text-orange-500 hover:underline">data.gov.au</a>.
        </p>
      </section>

    </div>
  </div>
</template>
