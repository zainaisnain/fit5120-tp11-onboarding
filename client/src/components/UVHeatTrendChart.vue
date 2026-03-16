<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'

const svgRef       = ref(null)
const data         = ref(null)
const activeMetric = ref('avg')   // 'avg' | 'peak'
const tooltip      = ref({ visible: false, x: 0, y: 0, html: '' })

async function loadData() {
  const res = await fetch('/data/uv_heat_trend.json')
  data.value = await res.json()
}

function draw() {
  if (!data.value || !svgRef.value) return

  const W = svgRef.value.parentElement.clientWidth || 700
  const H = 340
  const m = { top: 20, right: 30, bottom: 40, left: 50 }
  const iW = W - m.left - m.right
  const iH = H - m.top - m.bottom

  d3.select(svgRef.value).selectAll('*').remove()

  const svg = d3.select(svgRef.value).attr('width', W).attr('height', H)
  const g   = svg.append('g').attr('transform', `translate(${m.left},${m.top})`)

  const rows = data.value[activeMetric.value]

  const xScale = d3.scaleLinear()
    .domain(d3.extent(rows, d => d.year))
    .range([0, iW])

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(rows, d => d.value) * 1.1])
    .nice()
    .range([iH, 0])

  // grid
  g.append('g')
    .call(d3.axisLeft(yScale).ticks(6).tickSize(-iW).tickFormat(''))
    .call(el => el.select('.domain').remove())
    .call(el => el.selectAll('line').attr('stroke', '#f3f4f6'))

  // x axis
  g.append('g')
    .attr('transform', `translate(0,${iH})`)
    .call(d3.axisBottom(xScale).ticks(rows.length).tickFormat(d3.format('d')))
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
    .attr('x', -iH / 2).attr('y', -40)
    .attr('text-anchor', 'middle')
    .attr('fill', '#9ca3af').attr('font-size', 11)
    .text('UV Index')

  // area fill
  g.append('path')
    .datum(rows)
    .attr('fill', '#f97316').attr('opacity', 0.08)
    .attr('d', d3.area()
      .x(d => xScale(d.year))
      .y0(iH).y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX))

  // line
  g.append('path')
    .datum(rows)
    .attr('fill', 'none')
    .attr('stroke', '#f97316').attr('stroke-width', 2.5)
    .attr('d', d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX))

  // dots
  g.selectAll('circle')
    .data(rows)
    .join('circle')
    .attr('cx', d => xScale(d.year))
    .attr('cy', d => yScale(d.value))
    .attr('r', 4)
    .attr('fill', '#f97316')
    .attr('stroke', '#fff').attr('stroke-width', 2)

  // hover overlay
  const hoverLine = g.append('line')
    .attr('stroke', '#9ca3af').attr('stroke-width', 1).attr('stroke-dasharray', '4,3')
    .attr('y1', 0).attr('y2', iH).attr('opacity', 0)

  const hoverDot = g.append('circle')
    .attr('r', 6).attr('fill', '#f97316')
    .attr('stroke', '#fff').attr('stroke-width', 2).attr('opacity', 0)

  g.append('rect')
    .attr('width', iW).attr('height', iH)
    .attr('fill', 'none').attr('pointer-events', 'all')
    .on('mousemove', function (event) {
      const [mx] = d3.pointer(event, this)
      const year = Math.round(xScale.invert(mx))
      const row  = rows.find(d => d.year === year)
      if (!row) return

      hoverLine.attr('x1', xScale(year)).attr('x2', xScale(year)).attr('opacity', 1)
      hoverDot.attr('cx', xScale(year)).attr('cy', yScale(row.value)).attr('opacity', 1)

      const rect = svgRef.value.getBoundingClientRect()
      tooltip.value = {
        visible: true,
        x: event.clientX - rect.left + 14,
        y: event.clientY - rect.top - 12,
        html: `<div class="font-semibold mb-1">${year}</div>UV Index: <b>${row.value}</b>`,
      }
    })
    .on('mouseleave', () => {
      hoverLine.attr('opacity', 0)
      hoverDot.attr('opacity', 0)
      tooltip.value.visible = false
    })
}

onMounted(async () => {
  await loadData()
  draw()
  window.addEventListener('resize', draw)
})

onUnmounted(() => window.removeEventListener('resize', draw))

watch(activeMetric, draw)
</script>

<template>
  <div class="bg-white border border-gray-100 shadow-sm p-6">
    <div class="mb-4">
      <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
        Summer UV Index Over the Years — Melbourne (2007–2024)
      </h2>
      <p class="text-xs text-gray-400 mt-0.5">Australian summer (Dec–Feb) daytime readings only · Burwood, VIC</p>
    </div>

    <!-- Metric toggle -->
    <div class="flex items-center gap-1 bg-gray-100 p-1 rounded w-fit mb-5">
      <button
        @click="activeMetric = 'avg'"
        :class="['px-3 py-1 text-xs font-medium rounded transition',
          activeMetric === 'avg' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
      >Average UV</button>
      <button
        @click="activeMetric = 'peak'"
        :class="['px-3 py-1 text-xs font-medium rounded transition',
          activeMetric === 'peak' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
      >Peak UV</button>
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
