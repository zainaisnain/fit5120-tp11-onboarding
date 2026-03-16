<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'

const svgRef     = ref(null)
const data       = ref(null)
const activeType = ref('both')
const tooltip    = ref({ visible: false, x: 0, y: 0, html: '' })

const typeOptions = [
  { value: 'incidence', label: 'Incidence' },
  { value: 'mortality', label: 'Mortality' },
  { value: 'both',      label: 'Both' },
]

const SEX = 'Persons'

const COLORS = { incidence: '#f97316', mortality: '#6366f1' }

async function loadData() {
  const res = await fetch('/data/melanoma_rates.json')
  data.value = await res.json()
}

function draw() {
  if (!data.value || !svgRef.value) return

  const W = svgRef.value.parentElement.clientWidth || 700
  const H = 340
  const m = { top: 20, right: 30, bottom: 40, left: 54 }
  const iW = W - m.left - m.right
  const iH = H - m.top - m.bottom

  d3.select(svgRef.value).selectAll('*').remove()

  const svg = d3.select(svgRef.value).attr('width', W).attr('height', H)
  const g   = svg.append('g').attr('transform', `translate(${m.left},${m.top})`)

  const sex = SEX
  const series = []
  if (activeType.value !== 'mortality') series.push({ key: 'incidence', rows: data.value.incidence, color: COLORS.incidence })
  if (activeType.value !== 'incidence') series.push({ key: 'mortality', rows: data.value.mortality, color: COLORS.mortality })

  const allYears = series.flatMap(s => s.rows.map(d => d.year))
  const allRates = series.flatMap(s => s.rows.map(d => d[sex]).filter(v => v != null))

  const xScale = d3.scaleLinear().domain(d3.extent(allYears)).range([0, iW])
  const yScale = d3.scaleLinear().domain([0, d3.max(allRates) * 1.1]).nice().range([iH, 0])

  // grid
  g.append('g')
    .call(d3.axisLeft(yScale).ticks(6).tickSize(-iW).tickFormat(''))
    .call(el => el.select('.domain').remove())
    .call(el => el.selectAll('line').attr('stroke', '#f3f4f6'))

  // x axis
  g.append('g')
    .attr('transform', `translate(0,${iH})`)
    .call(d3.axisBottom(xScale).ticks(8).tickFormat(d3.format('d')))
    .call(el => el.select('.domain').attr('stroke', '#e5e7eb'))
    .call(el => el.selectAll('text').attr('fill', '#6b7280').attr('font-size', 11))
    .call(el => el.selectAll('line').attr('stroke', '#e5e7eb'))

  // y axis
  g.append('g')
    .call(d3.axisLeft(yScale).ticks(6))
    .call(el => el.select('.domain').remove())
    .call(el => el.selectAll('text').attr('fill', '#6b7280').attr('font-size', 11))
    .call(el => el.selectAll('line').remove())

  // y label
  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -iH / 2).attr('y', -44)
    .attr('text-anchor', 'middle')
    .attr('fill', '#9ca3af').attr('font-size', 11)
    .text('Rate per 100,000 population')

  // area + line per series
  series.forEach(s => {
    g.append('path')
      .datum(s.rows)
      .attr('fill', s.color).attr('opacity', 0.08)
      .attr('d', d3.area().defined(d => d[sex] != null)
        .x(d => xScale(d.year)).y0(iH).y1(d => yScale(d[sex])).curve(d3.curveMonotoneX))

    g.append('path')
      .datum(s.rows)
      .attr('fill', 'none').attr('stroke', s.color).attr('stroke-width', 2.5)
      .attr('d', d3.line().defined(d => d[sex] != null)
        .x(d => xScale(d.year)).y(d => yScale(d[sex])).curve(d3.curveMonotoneX))
  })

  // hover overlay
  const hoverLine = g.append('line')
    .attr('stroke', '#9ca3af').attr('stroke-width', 1).attr('stroke-dasharray', '4,3')
    .attr('y1', 0).attr('y2', iH).attr('opacity', 0)

  const dots = series.map(s =>
    g.append('circle').attr('r', 5)
      .attr('fill', s.color).attr('stroke', '#fff').attr('stroke-width', 2).attr('opacity', 0)
  )

  g.append('rect')
    .attr('width', iW).attr('height', iH)
    .attr('fill', 'none').attr('pointer-events', 'all')
    .on('mousemove', function (event) {
      const [mx] = d3.pointer(event, this)
      const year = Math.round(xScale.invert(mx))
      hoverLine.attr('x1', xScale(year)).attr('x2', xScale(year)).attr('opacity', 1)

      const lines = []
      series.forEach((s, i) => {
        const row = s.rows.find(d => d.year === year)
        const val = row?.[sex]
        if (val != null) {
          dots[i].attr('cx', xScale(year)).attr('cy', yScale(val)).attr('opacity', 1)
          lines.push(`<span style="color:${s.color}">&#9632;</span> ${s.key[0].toUpperCase() + s.key.slice(1)}: <b>${val}</b>`)
        } else {
          dots[i].attr('opacity', 0)
        }
      })

      const rect = svgRef.value.getBoundingClientRect()
      tooltip.value = {
        visible: lines.length > 0,
        x: event.clientX - rect.left + 14,
        y: event.clientY - rect.top - 12,
        html: `<div class="font-semibold mb-1">${year}</div>${lines.join('<br/>')}`,
      }
    })
    .on('mouseleave', () => {
      hoverLine.attr('opacity', 0)
      dots.forEach(d => d.attr('opacity', 0))
      tooltip.value.visible = false
    })
}

onMounted(async () => {
  await loadData()
  draw()
  window.addEventListener('resize', draw)
})

onUnmounted(() => window.removeEventListener('resize', draw))

watch(activeType, draw)
</script>

<template>
  <div class="bg-white border border-gray-100 shadow-sm p-6">
    <div class="mb-4">
      <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
        Melanoma of the Skin — Rates in Young Australians (Ages 15–29)
      </h2>
      <p class="text-xs text-gray-400 mt-0.5">
        Average age-specific rate per 100,000 population across ages 15–19, 20–24, 25–29 · Australia
      </p>
    </div>

    <!-- Controls -->
    <div class="flex flex-wrap gap-3 mb-5">
      <div class="flex items-center gap-1 bg-gray-100 p-1 rounded">
        <button
          v-for="opt in typeOptions" :key="opt.value"
          @click="activeType = opt.value"
          :class="['px-3 py-1 text-xs font-medium rounded transition',
            activeType === opt.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
        >{{ opt.label }}</button>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex gap-4 mb-3">
      <span v-if="activeType !== 'mortality'" class="flex items-center gap-1.5 text-xs text-gray-500">
        <span class="inline-block w-5 h-0.5 bg-orange-500 rounded"></span> Incidence
      </span>
      <span v-if="activeType !== 'incidence'" class="flex items-center gap-1.5 text-xs text-gray-500">
        <span class="inline-block w-5 h-0.5 bg-indigo-500 rounded"></span> Mortality
      </span>
    </div>

    <!-- Chart -->
    <div class="relative w-full">
      <svg ref="svgRef" class="w-full block" />
      <div
        v-if="tooltip.visible"
        class="absolute pointer-events-none bg-white border border-gray-200 shadow text-xs text-gray-700 px-3 py-2 rounded z-10"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
        v-html="tooltip.html"
      />
    </div>
  </div>
</template>
