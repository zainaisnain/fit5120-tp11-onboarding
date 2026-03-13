<script setup>
// This is a static informational page with no API calls

const keyFacts = [
  'Skin cancer is mainly caused by exposure to UV radiation from the sun or artificial sources such as solaria.',
  'In 2020, approximately 1.5 million cases of skin cancer were detected globally, with over 120,000 deaths reported.',
  'An estimated 18 million people worldwide are blind due to cataracts, of which about 10% may be caused by UV exposure.',
  'Sun exposure in childhood and adolescence significantly increases the risk of developing skin cancer later in life.',
  'Moderate UV exposure has health benefits, particularly for vitamin D synthesis.',
  'When the UV Index reaches 3 or above, sun protection measures are recommended.',
]

const shortTermEffects = [
  {
    title: 'Sunburn',
    desc: 'Sunburn is the most immediate sign of UV overexposure. It causes redness, pain, and skin peeling. Severe sunburn can lead to blistering and, over time, substantially increases the risk of developing skin cancer. A single severe blistering sunburn in childhood or adolescence doubles the lifetime risk of melanoma.',
  },
  {
    title: 'Heat Exhaustion',
    desc: 'Prolonged exposure to high temperatures and direct sunlight can overwhelm the body\'s ability to regulate its core temperature. Symptoms include dizziness, nausea, heavy sweating, and fatigue. If untreated, heat exhaustion can progress to heat stroke, a life-threatening medical emergency.',
  },
  {
    title: 'Photokeratitis (Eye Irritation)',
    desc: 'UV rays can cause acute inflammation of the cornea and conjunctiva, known as photokeratitis — essentially a sunburn of the eye. Symptoms include pain, redness, blurred vision, and sensitivity to light. The condition is temporary but extremely uncomfortable.',
  },
  {
    title: 'Dehydration',
    desc: 'Sweating during sun exposure causes significant fluid and electrolyte loss. Without adequate water intake, dehydration can develop rapidly, impairing physical and cognitive performance and increasing the risk of heat-related illness.',
  },
]

const longTermEffects = [
  {
    title: 'Skin Cancer',
    desc: 'Cumulative UV exposure is the primary environmental cause of melanoma and non-melanoma skin cancers. Australia records one of the world\'s highest incidence rates of skin cancer. Ultraviolet B (UVB) radiation is most directly linked to DNA damage in skin cells, while UVA penetrates deeper and contributes to both ageing and carcinogenesis.',
  },
  {
    title: 'DNA Damage',
    desc: 'UV radiation induces direct damage to the DNA of skin cells by forming pyrimidine dimers, which are abnormal bonds between adjacent nucleotides. Although the body has repair mechanisms, repeated exposure overwhelms these systems and accumulated mutations may eventually trigger malignant transformation.',
  },
  {
    title: 'Premature Skin Ageing (Photoageing)',
    desc: 'UV radiation breaks down collagen and elastin fibres in the dermis, leading to premature wrinkles, loss of skin elasticity, leathery texture, and pigmented lesions. Unlike chronological ageing, photoageing is largely preventable through consistent sun protection. It is estimated that up to 90% of visible skin ageing is caused by UV exposure.',
  },
  {
    title: 'Hyperpigmentation',
    desc: 'Repeated UV exposure stimulates melanocytes to overproduce melanin, resulting in dark spots (solar lentigines), uneven skin tone, and persistent discolouration. These changes are chronic and difficult to reverse once established.',
  },
  {
    title: 'Cataracts and Ocular Damage',
    desc: 'The lens of the eye is particularly sensitive to UV radiation. Long-term UV exposure is a well-established risk factor for the development of cortical and posterior subcapsular cataracts, which cloud the lens and cause vision loss. UV exposure also contributes to pterygium and macular degeneration.',
  },
  {
    title: 'Immune Suppression',
    desc: 'UV radiation has immunosuppressive effects on the skin\'s local immune defences, reducing the ability of the immune system to detect and destroy early skin cancer cells. This mechanism is thought to contribute to both the initiation and progression of UV-induced skin cancers.',
  },
]

const protectionMeasures = [
  {
    title: 'Sunscreen',
    desc: 'Apply broad-spectrum SPF 30+ sunscreen to all exposed skin at least 20 minutes before going outdoors. Reapply every 2 hours, and immediately after swimming or heavy sweating. SPF 50+ is recommended when the UV Index is 6 or above.',
  },
  {
    title: 'Protective Clothing',
    desc: 'Wear tightly woven, full-coverage clothing with a UPF (Ultraviolet Protection Factor) rating of 30 or higher. Long-sleeved shirts, long trousers, and UV-protective swimwear provide a physical barrier that sunscreen alone cannot match.',
  },
  {
    title: 'Sun-Protective Hats',
    desc: 'A broad-brimmed hat (minimum 7.5 cm brim) shades the face, ears, and neck — areas highly susceptible to sun damage and often missed by sunscreen application. Baseball caps are insufficient as they leave the ears and neck exposed.',
  },
  {
    title: 'UV-Protective Eyewear',
    desc: 'Sunglasses rated UV400 block 99–100% of UVA and UVB radiation. Wrap-around styles offer the best protection by preventing UV light from entering around the lens edges. Eye protection is essential even on overcast days.',
  },
  {
    title: 'Seek Shade',
    desc: 'Avoid direct sun exposure between 10 am and 4 pm when UV radiation is most intense. Seek shade under trees, umbrellas, or built structures. Note that shade reduces UV exposure by 50–95% depending on density, but reflected UV from surfaces like sand and water still reaches shaded areas.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Page heading section with title and source credit -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-6 pt-10 pb-8">
        <p class="text-xs text-orange-500 font-semibold uppercase tracking-widest mb-2">Health Education</p>
        <h1 class="text-3xl font-bold text-gray-900 leading-snug">Effects of UV Radiation on Human Health</h1>
        <p class="text-gray-500 text-sm mt-3 leading-relaxed max-w-2xl">
          Ultraviolet (UV) radiation is a form of electromagnetic radiation emitted by the sun and artificial sources. While essential for vitamin D synthesis, excessive UV exposure is the primary preventable cause of skin cancer and numerous other health conditions.
        </p>
        <p class="text-xs text-gray-400 mt-4">Last reviewed: June 2022 · Sources: WHO, Cancer Council Australia, ARPANSA</p>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-6 py-10 space-y-12">

      <!-- Key facts bullet list -->
      <div>
        <h2 class="text-lg font-bold text-gray-900 border-l-4 border-orange-500 pl-4 mb-5">Key Facts</h2>
        <ul class="space-y-3">
          <li
            v-for="fact in keyFacts"
            :key="fact"
            class="flex items-start gap-3 text-sm text-gray-700 leading-relaxed"
          >
            <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
            {{ fact }}
          </li>
        </ul>
      </div>

      <!-- Statistics strip with three key figures -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-orange-500 text-white px-6 py-5">
          <p class="text-3xl font-black">2 in 3</p>
          <p class="text-orange-100 text-xs mt-2 leading-relaxed">Australians will be diagnosed with skin cancer in their lifetime</p>
        </div>
        <div class="bg-orange-500 text-white px-6 py-5">
          <p class="text-3xl font-black">UV 11+</p>
          <p class="text-orange-100 text-xs mt-2 leading-relaxed">Extreme UV levels are common during Australian summers</p>
        </div>
        <div class="bg-orange-500 text-white px-6 py-5">
          <p class="text-3xl font-black">95%</p>
          <p class="text-orange-100 text-xs mt-2 leading-relaxed">of all skin cancers in Australia are attributable to UV exposure</p>
        </div>
      </div>

      <!-- Short-term health effects table -->
      <div>
        <h2 class="text-lg font-bold text-gray-900 border-l-4 border-orange-500 pl-4 mb-2">Short-Term Health Effects</h2>
        <p class="text-sm text-gray-500 mb-6 pl-5">
          The following effects may occur within hours or days of UV overexposure and are directly related to acute sun damage.
        </p>
        <div class="space-y-0 divide-y divide-gray-100 bg-white border border-gray-200 overflow-hidden">
          <div
            v-for="item in shortTermEffects"
            :key="item.title"
            class="px-6 py-5"
          >
            <p class="text-sm font-semibold text-gray-900 mb-1">{{ item.title }}</p>
            <p class="text-sm text-gray-600 leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Long-term health effects table -->
      <div>
        <h2 class="text-lg font-bold text-gray-900 border-l-4 border-orange-500 pl-4 mb-2">Long-Term Health Effects</h2>
        <p class="text-sm text-gray-500 mb-6 pl-5">
          Repeated and cumulative UV exposure over months and years leads to serious, often irreversible health consequences.
        </p>
        <div class="space-y-0 divide-y divide-gray-100 bg-white border border-gray-200 overflow-hidden">
          <div
            v-for="item in longTermEffects"
            :key="item.title"
            class="px-6 py-5"
          >
            <p class="text-sm font-semibold text-gray-900 mb-1">{{ item.title }}</p>
            <p class="text-sm text-gray-600 leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Skin cancer risk section specific to Australia -->
      <div class="bg-red-50 border border-red-200 p-6">
        <h2 class="text-base font-bold text-red-800 mb-3">Skin Cancer Risk in Australia</h2>
        <p class="text-sm text-red-700 leading-relaxed mb-4">
          Australia is among the countries with the highest UV radiation levels in the world, partly due to its geographic proximity to the equator, the thinning of the ozone layer over the Southern Hemisphere, and outdoor lifestyle habits. Melanoma is the third most common cancer among Australians. Despite this, research indicates that approximately 74% of young adults hold an "invincibility misconception" — underestimating their personal skin cancer risk.
        </p>
        <p class="text-sm text-red-700 leading-relaxed">
          The critical message is that most skin cancers are preventable. Early detection through regular skin checks is associated with a 90% five-year survival rate for melanoma. Consistent application of sun protection measures, beginning in childhood, has been shown to significantly reduce lifetime risk.
        </p>
        <div class="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="bg-white px-4 py-4 border border-red-100 text-center">
            <p class="text-2xl font-black text-red-600">#1</p>
            <p class="text-xs text-gray-500 mt-1 leading-relaxed">Most common cancer in Australians aged 15–44</p>
          </div>
          <div class="bg-white px-4 py-4 border border-red-100 text-center">
            <p class="text-2xl font-black text-red-600">90%</p>
            <p class="text-xs text-gray-500 mt-1 leading-relaxed">Survival rate when melanoma is detected early</p>
          </div>
          <div class="bg-white px-4 py-4 border border-red-100 text-center">
            <p class="text-2xl font-black text-red-600">74%</p>
            <p class="text-xs text-gray-500 mt-1 leading-relaxed">Young adults underestimate their personal risk</p>
          </div>
        </div>
      </div>

      <!-- Recommended protection measures list -->
      <div>
        <h2 class="text-lg font-bold text-gray-900 border-l-4 border-orange-500 pl-4 mb-2">Recommended Protection Measures</h2>
        <p class="text-sm text-gray-500 mb-6 pl-5">
          The following five measures are endorsed by the Cancer Council Australia and the World Health Organization. Using them in combination provides the most effective protection.
        </p>
        <div class="space-y-0 divide-y divide-gray-100 bg-white border border-gray-200 overflow-hidden">
          <div
            v-for="(item, index) in protectionMeasures"
            :key="item.title"
            class="px-6 py-5 flex items-start gap-4"
          >
            <span class="shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center mt-0.5">
              {{ index + 1 }}
            </span>
            <div>
              <p class="text-sm font-semibold text-gray-900 mb-1">{{ item.title }}</p>
              <p class="text-sm text-gray-600 leading-relaxed">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom important note panel -->
      <div class="bg-amber-50 border border-amber-200 px-6 py-5 text-sm text-amber-800 leading-relaxed">
        <p class="font-semibold mb-1">Important Note</p>
        <p>
          UV radiation is invisible and cannot be perceived as heat. Significant UV exposure can occur on cool, overcast, or cloudy days. The UV Index is the most reliable indicator of UV risk — always check it before going outdoors, and apply sun protection whenever the index reaches 3 or above.
        </p>
      </div>

    </div>
  </div>
</template>
