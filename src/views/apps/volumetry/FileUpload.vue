<!-- eslint-disable camelcase -->
<script setup>
import SelectorDialog from '@/views/apps/materials/SelectorDialog.vue'

const props = defineProps({
  responseUploadedFile: {
    type: Object,
    default: () => ({
      num_inserted: 0,
      num_updated: 0,
      warnings: [],
      error: null,
    }),
  },
})

const emit = defineEmits([
  'update:responseUploadedFile',
  'fileData',
])

const response =ref(structuredClone(toRaw(props.responseUploadedFile)))
const isSelectorDialogVisible = ref(false)
const excelFile = ref()
const viewResults = ref(false)

const uploadVolumetry = () => {
  const formData = new FormData()

  formData.append('file', excelFile.value)
  emit('fileData', formData)
}

const generateFormat = async selectedMaterials => {
  const blob = await $api('api/materials/download_format', {
    method: 'POST',
    body: {
      filename: 'FORMATO_VOLUMETRIA.xlsx',
      material_ids: selectedMaterials,
    },
    responseType: 'blob',
  })

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = 'FORMATO_VOLUMETRIA.xlsx'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

watch(() => props.responseUploadedFile, newValue => {
  const newResponse = structuredClone(toRaw(newValue))

  response.value = newResponse

  const hasInserts = (response.value?.num_inserted ?? 0) > 0
  const hasUpdates = (response.value?.num_updated ?? 0) > 0
  const hasErrors = (response.value?.errors?.length ?? 0) > 0

  viewResults.value = hasInserts || hasUpdates || hasErrors
}, { deep: true })
</script>

<template>
  <p>
    Para cargar información mediante un archivo, este debe estar en formato <b>Excel</b> y cumplir con una
    estructura específica, utilice el archivo: <a
      class="text-underline"
      @click.prevent="isSelectorDialogVisible = true"
    >
      FORMATO VOLUMETRÍA
    </a>.
  </p>
  <VRow class="mt-4">
    <VCol
      cols="12"
      md="6"
    >
      <VFileInput
        v-model="excelFile"
        label="Sube tu archivo excel"
        accept=".xlsx, .xls"
        outlined
        dense
        required
      />
    </VCol>

    <VCol
      cols="12"
      md="3"
    >
      <VBtn
        color="primary"
        :disabled="!excelFile"
        @click="uploadVolumetry"
      >
        Enviar
      </VBtn>
    </VCol>
  </VRow>

  <VCard
    v-if="viewResults"
    class="mt-5"
  >
    <VCardItem>
      <VCardTitle>Resultados</VCardTitle>
      <template #append>
        <div class="mt-n4 me-n2">
          <VBtn
            icon="tabler-x"
            variant="text"
            color="secondary"
            @click="viewResults = false"
          />
        </div>
      </template>
    </VCardItem>

    <VCardText>
      <VAlert
        v-if="(response.num_inserted || 0) + (response.num_updated || 0) > 0"
        border="start"
        border-color="success"
        class="mb-2"
      >
        Archivo cargado correctamente. Total registros cargados:
        <b>{{ response.num_inserted + response.num_updated }}</b>
        <ul>
          <li>Nuevos: {{ response.num_inserted }}</li>
          <li>Actualizados: {{ response.num_updated }}</li>
        </ul>
      </VAlert>

      <VAlert
        v-if="response.errors?.length > 0"
        border="start"
        border-color="error"
      >
        Ocurrió un error al procesar el archivo:
        <ul>
          <li
            v-for="error in response.errors"
            :key="error.row"
          >
            {{ error.message }}
          </li>
        </ul>
      </VAlert>
    </VCardText>
  </VCard>
  <SelectorDialog
    v-model:is-dialog-visible="isSelectorDialogVisible"
    action="generate"
    @generate-format="generateFormat"
  />
</template>
