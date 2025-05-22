<!-- eslint-disable camelcase -->
<script setup>
const props = defineProps({
  refreshRate: {
    type: Object,
    required: true,
    default: () => ({
      value: '',
      next_date: new Date().toISOString().split('T')[0],
    }),
  },
})

const emit = defineEmits([
  'update:refreshRate',
  'refreshRateData',
])

const isFormValid = ref(false)
const refForm = ref()
const refreshRate = ref(props.refreshRate)
const { data: refreshRateOptions } = await useApi('api/catalogs?name=Frecuencia de actualización')
const today = new Date()
const yesterday = new Date(today)

yesterday.setDate(today.getDate() - 1)

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) 
      emit('refreshRateData', refreshRate.value)
  })
}
</script>

<template>
  <VForm
    ref="refForm"
    v-model="isFormValid"
    @submit.prevent="onSubmit"
  >
    <VRow>
      <VCol
        cols="12"
        md="6"
      >
        <AppSelect
          v-model="refreshRate.value"
          label="Frecuencua de actualización de precios"
          placeholder="Frecuencua de actualización de precios"
          :rules="[requiredValidator]"
          :items="refreshRateOptions.values"
          class="font-weight-bold"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <AppDateTimePicker
          v-model="refreshRate.next_date"
          :config="{ dateFormat: 'Y-m-d', disable: [{ from: `1900-01-01`, to: yesterday.toISOString().split('T')[0] }] }"
          label="Próxima actualización"
          placeholder="Seleccione una fecha"
        />
      </VCol>
      <VCol
        cols="12"
        class="d-flex gap-4"
      >
        <VBtn type="submit">
          Guardar
        </VBtn>

        <VBtn
          type="reset"
          color="secondary"
          variant="tonal"
          :to="{name:'apps-suppliers-list'}"
        >
          Cancelar
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
  <VCard class="mt-10">
    <VCardItem>
      <VCardTitle>Última actualización</VCardTitle>
    </VCardItem>
    <VCardText>
      Materiales actualizados
    </VCardText>
  </VCard>
</template>
