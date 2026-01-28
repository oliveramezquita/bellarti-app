<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'VSVolumetria',
  },
})
import { loadState, saveState } from '@/utils/storage'
import DataTable from '@/views/apps/volumetry/DataTable.vue'
import FormData from '@/views/apps/volumetry/FormData.vue'
import TrendMaterialsFormData from '@/views/apps/volumetry/TrendMaterialsFormData.vue'

const breadcrumbItems = ref([{ title: 'Vivienda en Serie', class: 'text-primary' }, { title: 'Volumetría' }])
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const isViewVolumetry = ref(false)
const notificationMessage = ref('')
const notificationColor = ref('info')
const { data: clients } = await useApi('api/clients/VS?itemsPerPage=1000')
const client = ref()
const front = ref()
const fronts = ref([])
const prototypes = ref([])
const prototype = ref()
const trend = ref()
const trends = ref({ melamines: [], granites: [] })
const melamine = ref()
const granite = ref()
const volumetry = ref([])
const volumetryItemDeleted = ref()
const responseUploadedFile = ref()
const type = ref()

const types = [
  { value: 'prototype', label: 'Prototipo' },
  { value: 'trend', label: 'Tendencia' },
]

client.value = loadState('volumetry_client')
front.value = loadState('volumetry_front')
type.value = loadState('volumetry_type')
prototype.value = loadState('volumetry_prototype')
trend.value = loadState('volumetry_trend')
fronts.value = loadState('volumetry_fronts') || []
prototypes.value = loadState('volumetry_prototypes') || []
trends.value = loadState('volumetry_trends') || []

const clientChange = async value => {
  // Guardar el cliente seleccionado
  saveState('volumetry_client', value)

  // 🔹 Limpiar dependencias
  front.value = null
  prototype.value = null
  fronts.value = []
  prototypes.value = []
  resetVolumetry()

  // 🔹 Actualizar almacenamiento persistente
  saveState('volumetry_type', null)
  saveState('volumetry_front', null)
  saveState('volumetry_prototype', null)
  saveState('volumetry_trend', null)
  saveState('volumetry_fronts', [])
  saveState('volumetry_prototypes', [])
  saveState('volumetry_trends', { melamines: [], granites: [] })

  // 🔹 Llamada API
  await $api(`api/prototypes?itemsPerPage=100&client_id=${value}`, {
    method: 'GET',
    onResponse({ response }) {
      if (response.status === 200) {
        fronts.value = getUniqueValues(response._data.data, 'front')
        saveState('volumetry_fronts', fronts.value)
      } else {
        notificationColor.value = getStatusColor(response.status)
        notificationMessage.value = response._data
        isNotificationVisible.value = true
      }
    },
  })
}

const getUniqueValues = (array, key) => {
  if (!Array.isArray(array) || array.length === 0) return []
  if (!key) return []

  // Extrae los valores del campo especificado y elimina los duplicados
  return [...new Set(array.map(item => item[key]).filter(Boolean))]
}

const frontChange = async () => {
  saveState('volumetry_front', front.value)

  // 🔹 Limpiar dependencias del prototipo
  prototype.value = null
  prototypes.value = []
  trend.value = null
  trends.value = []

  resetVolumetry()
  saveState('volumetry_prototype', null)
  saveState('volumetry_prototypes', [])
  saveState('volumetry_trend', null)
  saveState('volumetry_trends', { melamines: [], granites: [] })
}

const prototypeChange = async () => {
  if (!prototype.value) return

  saveState('volumetry_prototype', prototype.value)
  isLoadingDialogVisible.value = true
  try {
    await $api(`api/volumetries?client_id=${client.value}&front=${front.value}&prototype=${prototype.value}`, {
      method: 'GET',
      onResponse({ response }) {
        if (response.status === 200) {
          isViewVolumetry.value = true
          volumetry.value = response._data.volumetry
        } else {
          resetVolumetry()
        }
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const resetVolumetry = () => {
  isViewVolumetry.value = false
  volumetry.value = []
}

// ✅ Si hay un prototipo guardado, ejecuta la carga automática
watch(
  prototype,
  async newVal => {
    if (newVal) {
      await prototypeChange()
    }
  },
  { immediate: true }, // ✅ ejecuta una vez al montar si prototype ya tiene valor
)

const addVolumetry  = async volumetryData => {
  if (!parseFloat(volumetryData.volumetry[0]?.total_x || 0)) {
    notificationColor.value = 'error'
    notificationMessage.value = 'No se ingresó al menos una cantidad por fábrica, instalación y/o entrega.'
    isNotificationVisible.value = true
    
    return
  }

  isLoadingDialogVisible.value = true

  try {
    await $api('api/volumetries', {
      method: 'POST',
      body: {
        client_id: client.value,
        front: front.value,
        prototype: prototype.value,
        material_id: volumetryData.material_id,
        volumetry: volumetryData.volumetry,
      },
      onResponse({ response }) {
        notificationColor.value = getStatusColor(response.status)
        if (response.status === 200) {
          volumetry.value = response._data.data
          notificationMessage.value = response._data.message
        } else {
          notificationMessage.value = response._data
        }
        isNotificationVisible.value = true
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const uploadVolumetry = async formsData => {
  isLoadingDialogVisible.value = true

  try {
    await $api(`api/upload_volumetry?client_id=${client.value}&front=${front.value}&prototype=${prototype.value}`, {
      method: 'POST',
      body: formsData,
      onResponse({ response }) {
        notificationColor.value = getStatusColor(response.status)
        if (response.status !== 200) {
          notificationMessage.value = response._data
          isNotificationVisible.value = true
        } else {
          if (response._data.volumetry.length > 0)
            volumetry.value = response._data.volumetry
          responseUploadedFile.value = response._data
        }
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const deleteVolumetry = async i => {
  await $api(`api/volumetry/${i.id}`, { 
    method: 'DELETE',
    onResponse({ response }) {
      notificationColor.value = getStatusColor(response.status)
      if (response.status === 200) {
        volumetry.value = volumetry.value.filter(item => item.id !== i.id)
        volumetryItemDeleted.value = i.material_id
      } else {
        isNotificationVisible.value = true
        notificationMessage.value = response._data 
      }
    },
  })
}

const buildMaterials = obj => ({
  melamines: obj?.melamines ?? [],
  granites: obj?.granites ?? [],
})

const typeChange = async () => {
  isViewVolumetry.value = false  
  saveState('volumetry_type', type.value)
  prototype.value = null
  trend.value = null
  melamine.value = null
  granite.value = null
  saveState('volumetry_prototype', null)
  saveState('volumetry_trend', null)
  
  isLoadingDialogVisible.value = true
  if (type.value === 'prototype') {
    try {
      await $api(`api/prototypes?itemsPerPage=100&client_id=${client.value}&front=${front.value}`, {
        method: 'GET',
        onResponse({ response }) {
          if (response.status === 200) {
            prototypes.value = getUniqueValues(response._data.data, 'name')
            saveState('volumetry_prototypes', prototypes.value)
          }
        },
      })
    } finally {
      isLoadingDialogVisible.value = false
    }
  }
  if (type.value === 'trend') {
    try {
      await $api(`api/trends?itemsPerPage=100&client_id=${client.value}&front=${front.value}`, {
        method: 'GET',
        onResponse({ response }) {
          if (response.status === 200) {
            trends.value = buildMaterials(response._data[0])
            saveState('volumetry_trends', trends.value)
          }
        },
      })
    } finally {
      isLoadingDialogVisible.value = false
    }
  }
}

const trendChange = trendType => {
  isViewVolumetry.value = true

  if (trendType === "melamine")
    granite.value = null
  if (trendType === "granite")
    melamine.value = null
  
  volumetry.value = []
}
</script>

<template>
  <Breadcrumb
    :items="breadcrumbItems"
    :return="false"
    icon="home-stats"
  />
  <section>
    <VCard class="mb-2">
      <VCardText class="d-flex align-center justify-space-between py-4">
        <VRow>
          <!-- 👉 Clients -->
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="client"
              label="Ciente"
              placeholder="Cliente"
              :item-title="item => item.name"
              :item-value="item => item._id"
              :items="clients.data"
              @update:model-value="clientChange"
            />
          </VCol>
          <!-- 👉 Fronts -->
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="front"
              label="Frente / Fraccionamiento"
              placeholder="Frente / Fraccionamiento"
              :items="fronts"
              @update:model-value="frontChange"
            />
          </VCol>
          <!-- 👉 Type -->
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="type"
              label="Tipo"
              placeholder="Tipo"
              :item-title="item => item.label"
              :item-value="item => item.value"
              :items="types"
              @update:model-value="typeChange"
            />
          </VCol>
          <!-- 👉 Prototypes -->
          <VCol
            v-if="type === 'prototype'"
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="prototype"
              label="Prototipos"
              placeholder="Prototipos"
              :items="prototypes"
              class="font-weight-bold"
              @update:model-value="prototypeChange"
            />
          </VCol>
          <!-- 👉 Malemines -->
          <VCol
            v-if="type === 'trend'"
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="melamine"
              label="Maleminas"
              placeholder="Maleminas"
              :item-title="item => item.name"
              :item-value="item => item.name"
              :items="trends.melamines"
              @update:model-value="trendChange('melamine')"
            />
          </VCol>
          <!-- 👉 Granites -->
          <VCol
            v-if="type === 'trend'"
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="granite"
              label="Granitos"
              placeholder="Granitos"
              :item-title="item => item.name"
              :item-value="item => item.name"
              :items="trends.granites"
              @update:model-value="trendChange('granite')"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
    <FormData
      v-if="isViewVolumetry && type === 'prototype'"
      key="form"
      :volumetry="volumetry"
      :response-uploaded-file="responseUploadedFile"
      @volumetry-data="addVolumetry"
      @file-data="uploadVolumetry"
    />
    <DataTable
      v-if="isViewVolumetry && type === 'prototype'"
      :volumetry="volumetry"
      @volumetry-data="deleteVolumetry"
    />
    <TrendMaterialsFormData
      v-if="isViewVolumetry && type === 'trend' && (melamine || granite)"
      v-model:volumetry="volumetry"
      :trend-type="melamine ? 'melamine' : 'granite'"
      :trend-value="melamine ?? granite"
    />
    <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
    <Notification
      v-model:is-notification-visible="isNotificationVisible"
      :message="notificationMessage"
      :color="notificationColor"
    />
  </section>
</template>

<style lang="scss">
.more-info {
  inline-size: 100%;
  padding-block: 10px;
}
</style>
