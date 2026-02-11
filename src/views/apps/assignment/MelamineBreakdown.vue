<!-- eslint-disable camelcase -->
<script setup>
import { computed, ref, toRaw, watch } from 'vue'

const props = defineProps({
  explosionItem: { type: Object, required: true },
  granTotal: { type: [String, Number], required: true },
  melamineData: { type: Object, required: true },
})

const explosion = ref(structuredClone(toRaw(props.explosionItem)))
const melamine = ref(structuredClone(toRaw(props.melamineData)))

watch(() => props.explosionItem, v => {
  explosion.value = structuredClone(toRaw(v))
})

watch(() => props.melamineData, v => {
  melamine.value = structuredClone(toRaw(v))
})

const calculatePercentage = (amount, percentage, decimals = 2) => {
  const a = Number(amount)
  const p = Number(percentage)
  if (!Number.isFinite(a) || !Number.isFinite(p)) return 0
  
  return Number(((a * p) / 100).toFixed(decimals))
}

const bicolor = computed(() => {
  const name = melamine.value?.name
  if (typeof name !== 'string') return []

  const parts = name
    .split('/')
    .map(v => v.trim())
    .filter(Boolean)

  if (parts.length < 2) return []

  const colorKeys = ['color_a', 'color_b', 'color_c', 'color_d']

  return parts.map((n, index) => ({
    name: n,
    percentage: Number(melamine.value?.[colorKeys[index]]) || 0,
  }))
})

const bicolorBigAmount = computed(() =>
  calculatePercentage(props.granTotal, melamine.value?.percentage ?? 0),
)
</script>

<template>
  <VCol
    cols="12"
    md="6"
  >
    <AppTextField
      :model-value="melamine.name"
      label="Color"
      readonly
    />
  </VCol>

  <VCol
    cols="12"
    md="3"
  >
    <AppTextField
      :model-value="melamine.percentage"
      label="Porcentaje"
      readonly
    />
  </VCol>

  <VCol
    cols="12"
    md="3"
  >
    <AppTextField
      :model-value="bicolorBigAmount"
      label="Cantidad"
      readonly
    />
  </VCol>

  <template
    v-for="(bc, i) in bicolor"
    :key="`${bc.name}-${i}`"
  >
    <VCol
      cols="12"
      md="6"
      style="padding-block-start: 0;"
      class="d-flex align-end"
    >
      <VBtn
        icon="tabler-arrow-move-right"
        rounded
        disabled
        variant="plain"
        color="secondary"
      />
      <AppTextField
        :model-value="bc.name"
        :label="`Color ${i + 1}`"
        readonly
      />
    </VCol>

    <VCol
      cols="12"
      md="3"
      style="padding-block-start: 0;"
    >
      <AppTextField
        :model-value="bc.percentage"
        label="Porcentaje"
        readonly
      />
    </VCol>

    <VCol
      cols="12"
      md="3"
      style="padding-block-start: 0;"
    >
      <AppTextField
        :model-value="calculatePercentage(bicolorBigAmount, bc.percentage)"
        label="Cantidad"
        readonly
      />
    </VCol>
  </template>
</template>
