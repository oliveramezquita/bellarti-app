<script setup>
const props = defineProps({
  data: {
    type: Array,
    required: true, 
  },
})

const chartColors = {
  donut: {
    series1: '#28C76F',
    series2: '#FF9F43',
    series3: '#808390',
  },
}

const headingColor = 'rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity))'
const labelColor = 'rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity))'

const deliveryExceptionsChartSeries = props.data[0]

const deliveryExceptionsChartConfig = {
  labels: [
    'Activos',
    'Pendientes',
    'Desactivados',
  ],
  colors: [
    chartColors.donut.series1,
    chartColors.donut.series2,
    chartColors.donut.series3,
  ],
  stroke: { width: 0 },
  dataLabels: {
    enabled: false,
    formatter(val) {
      return `${ Number.parseInt(val) }%`
    },
  },
  legend: {
    show: true,
    position: 'bottom',
    offsetY: 10,
    markers: {
      width: 8,
      height: 8,
      offsetX: -3,
    },
    itemMargin: {
      horizontal: 15,
      vertical: 5,
    },
    fontSize: '13px',
    fontWeight: 400,
    labels: {
      colors: labelColor,
      useSeriesColors: false,
    },
  },
  tooltip: { theme: false },
  grid: { padding: { top: 15 } },
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          value: {
            fontSize: '38px',
            color: headingColor,
            fontWeight: 500,
            offsetY: -15,
            formatter(val) {
              return `${ Number.parseInt(val) }`
            },
          },
          name: { offsetY: 30 },
          total: {
            show: true,
            fontSize: '0.9375rem',
            label: 'Total',
            color: labelColor,
            formatter() {
              return props.data[1]
            },
          },
        },
      },
    },
  },
  responsive: [{
    breakpoint: 420,
    options: {
      chart: { height: 400 },
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              value: {
                fontSize: '24px',
                color: headingColor,
                fontWeight: 500,
                offsetY: -15,
                formatter(val) {
                  return `${ Number.parseInt(val) }`
                },
              },
              name: { offsetY: 30 },
              total: {
                show: true,
                fontSize: '0.9375rem',
                label: 'Total',
                color: labelColor,
                formatter() {
                  return props.data[1]
                },
              },
            },
          },
        },
      },
    },
  }],
}
</script>

<template>
  <VCard>
    <VCardItem title="Usuarios">
      <template #append>
        <MoreBtn />
      </template>
    </VCardItem>
    <VCardText>
      <VueApexCharts
        type="donut"
        height="300"
        :options="deliveryExceptionsChartConfig"
        :series="deliveryExceptionsChartSeries"
      />
    </VCardText>
  </VCard>
</template>
