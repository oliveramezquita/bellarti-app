<script setup>
const props = defineProps({
  taxDataInfo: {
    type: Object,
    required: true,
    default: () => ({
      rfc: '',
      name: '',
      constancy: null,
    }),
  },
  supplierInfo: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'update:taxDataInfo',
  'update:supplierInfo',
  'taxDataInfo',
])

const isFormValid = ref(false)
const refForm = ref()
const { data: taxRegimes } = await useApi('api/catalogs?name=Regimen Fiscal')
const taxDataInfo = ref(props.taxDataInfo)
const constancyFile = ref()

const onSubmit = () => {
  const formData = new FormData()

  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      for (const key in taxDataInfo.value) {
        if (taxDataInfo.value.hasOwnProperty(key)) {
          formData.append(key, taxDataInfo.value[key])
        }
      }
      if (constancyFile.value)
        formData.append('constancy', constancyFile.value)
  
      emit('taxDataInfo', formData)
    }
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
        md="4"
      >
        <AppTextField
          v-model="taxDataInfo.rfc"
          label="RFC"
          placeholder="RFC"
          :rules="[requiredValidator]"
          class="font-weight-bold"
        />
      </VCol>

      <VCol
        cols="12"
        md="8"
      >
        <AppTextField
          v-model="taxDataInfo.name"
          label="Nombre o Razón Social"
          :placeholder="props.supplierInfo.name"
          :rules="[requiredValidator]"
          class="font-weight-bold"
        />
      </VCol>

      <VCol
        cols="12"
        md="9"
      >
        <AppTextField
          v-model="taxDataInfo.address"
          label="Domicilio Fiscal"
          placeholder="Domicilio Fiscal"
        />
      </VCol>

      <VCol
        cols="12"
        md="3"
      >
        <AppTextField
          v-model="taxDataInfo.postal_code"
          label="Código Postal"
          placeholder="Código Postal"
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <AppSelect
          v-model="taxDataInfo.regime"
          label="Regímen Fiscal"
          placeholder="Regímen Fiscal"
          :items="taxRegimes.values"
          clearable
        />
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <VFileInput
          v-if="!taxDataInfo.constancy"
          v-model="constancyFile"
          label="Constancia de Situación Fiscal"
          accept=".pdf"
          outlined
          dense
          required
          style="margin-block-start: 25px;"
        />
        <div v-if="taxDataInfo.constancy">
          <label>Constancia de Situación Fiscal</label>
          <br>
          <VChip
            v-if="taxDataInfo.constancy"
            closable
            class="mt-1"
            @click:close="taxDataInfo.constancy = null"
          >
            <a
              :href="taxDataInfo.constancy"
              target="_blank"
              rel="noopener noreferrer"
            >{{ taxDataInfo.constancy.split('/').pop() }}</a>
          </VChip>
        </div>
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
</template>
