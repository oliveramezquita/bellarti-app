<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'VSVolumetria',
  },
})
import { loadState, saveState } from '@/utils/storage'
import DataForm from '@/views/apps/volumetry/DataForm.vue'
import FileUpload from '@/views/apps/volumetry/FileUpload.vue'

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
const volumetry = ref([])
const responseUploadedFile = ref()
const currentTab = ref('tab-1')

client.value = loadState('volumetry_client')
front.value = loadState('volumetry_front')
prototype.value = loadState('volumetry_prototype')
fronts.value = loadState('volumetry_fronts') || []
prototypes.value = loadState('volumetry_prototypes') || []

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
  saveState('volumetry_fronts', [])
  saveState('volumetry_prototypes', [])

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

  resetVolumetry()
  saveState('volumetry_prototype', null)
  saveState('volumetry_prototypes', [])

  isLoadingDialogVisible.value = true
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
          volumetry.value = response._data
        } else {
          notificationColor.value = 'error'
          notificationMessage.value = response._data
          isNotificationVisible.value = true
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
  if (volumetryData.every(item => Number(item.total) === 0)) {
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
        volumetry: volumetryData,
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
          console.log(response._data)
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
          <!-- 👉 Prototypes -->
          <VCol
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
        </VRow>
      </VCardText>
    </VCard>
    <VCard v-if="isViewVolumetry">
      <VTabs
        v-model="currentTab"
        grow
        stacked
      >
        <VTab>
          <VIcon
            icon="tabler-package"
            class="mb-2"
          />
          <span>Subir por material</span>
        </VTab>

        <VTab>
          <VIcon
            icon="tabler-file-plus"
            class="mb-2"
          />
          <span>Subir por archivo</span>
        </VTab>
      </VTabs>

      <VWindow v-model="currentTab">
        <!-- ================================================= -->
        <!-- ✅ TAB 1: Subir por material -->
        <!-- ================================================= -->
        <VWindowItem>
          <VCardText style="padding-inline: 0;">
            <DataForm
              v-model:volumetry="volumetry"
              @add-volumetry="addVolumetry"
            />
          </VCardText>
        </VWindowItem>
        <VWindowItem>
          <VCardText>
            <FileUpload
              v-model:response-uploaded-file="responseUploadedFile"
              @file-data="uploadVolumetry"
            />
          </VCardText>
        </VWindowItem>
      </vwindow>
    </VCard>
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
