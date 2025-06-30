<!-- eslint-disable camelcase -->
<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'VSODs',
    navActiveLink: 'apps-ods-list',
  },
})
import excelPath from '@/assets/documents/FORMATO_LOTES_OD.xlsx'
import LotStatusDialog from '@/views/apps/ods/LotStatusDialog.vue'
import MaterialTable from '@/views/apps/ods/MaterialTable.vue'

const lotesFormat = excelPath

const route = useRoute('apps-ods-view-id')

const { 
  data: homeProductionData,
  execute: fetchHomeProduction } = await useApi(`api/home-production/${ route.params.id }`)

const { data: lotsData, execute: fetchLots } = useApi(`api/lots/${ homeProductionData.value._id }`)
const { data: prototypeCatalog }= await useApi('api/prototypes?itemsPerPage=1000')

const {
  data: materialsData,
  execute: fetchMaterials,
} = await useApi(createUrl(`api/explosion/${homeProductionData.value._id}`))

const prototypes = prototypeCatalog.value.data.filter(d => d.front === homeProductionData.value.front).map(d => d.name)
const lots = ref(lotsData.value ? lotsData.value : [])
const isLoadingDialogVisible = ref(false)
const isNotificationVisible = ref(false)
const notificationMessage = ref('')
const isLotStatusDialogVisible = ref(false)
const currentTab = ref('tab-1')
const excelFile = ref()
const successful = ref([])
const warnings = ref([])
const errors = ref()
const lotId = ref()
const progressSelected = ref([])

const addNewLot = () => {
  lots.value.push({
    block: null,
    lot: null,
    laid: null,
    prototype: null,
    percentage: '0.00',
  })
}

const removeLot = async idx => {
  if(lots.value[idx].hasOwnProperty('_id')) {
    isLoadingDialogVisible.value = true
    try {
      await $api(`api/lot/${lots.value[idx]._id}`, {
        method: 'DELETE',
        onResponse({ response }) {
          if (response.status === 200) {
            lots.value.splice(idx, 1)
          } else {
            isNotificationVisible.value = true
            notificationMessage.value = response._data
          }
        },
      })
    } finally {
      isLoadingDialogVisible.value = false
    }
  } else {
    lots.value.splice(idx, 1)
  }
}

const saveLots = async () => {
  if (isValid()) {
    isLoadingDialogVisible.value = true

    try {
      const keysToExclude = ['home_production_id']
      const filtered = lots.value.map(obj => Object.fromEntries(Object.entries(obj).filter(([k, v]) => !keysToExclude.includes(k) && v !== null)))

      await $api(`api/lots/${homeProductionData.value._id}`, {
        method: 'POST',
        body: {
          lots: filtered,
        }, onResponse({ response }) {
          if (response.status === 200 && response._data.hasOwnProperty('success')) {
            lots.value = response._data.success
            isNotificationVisible.value = true
            notificationMessage.value = "Lotes guardados de manera correcta."
            fetchMaterials()
          } else {
            isNotificationVisible.value = true
            notificationMessage.value = response._data
          }
        },
      })
    } finally {
      isLoadingDialogVisible.value = false
    }
  } else {
    isNotificationVisible.value = true
    notificationMessage.value = "Error: Algunos campos obligatorios están vacíos. Por favor, asegúrese de completar los siguientes valores: Manzana, Lote, Sembrado y Prototipo."
  }
}

const isValid = () => {
  let valid = true
  lots.value.forEach((obj, _) => {
    const rawObj = toRaw(obj)

    const check = ['block', 'lot', 'laid', 'prototype'].every(
      key => rawObj[key] !== null && rawObj[key] !== '',
    )

    if (!check)
      valid = false
  })
  
  return valid
}

const saveProgress = async data => {
  isLoadingDialogVisible.value = true
  
  try {
    await $api(`api/lot/${data.id}`, {
      method: 'PATCH',
      body: {
        percentage: data.total_percentage,
        progress: data.progress,
      },
      onResponse({ response }) {
        if (response.status === 200)
          fetchLots()
        isNotificationVisible.value = true
        notificationMessage.value = response._data
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const uploadLots = async () => {
  isLoadingDialogVisible.value = true

  try {
    const formData = new FormData()

    formData.append('file', excelFile.value)
    formData.append('client_id', homeProductionData.value.client_id)
    formData.append('front', homeProductionData.value.front)

    await $api(`api/lots/${homeProductionData.value._id}`, {
      method: 'PATCH',
      body: formData,
      onResponse({ response }) {
        if (response.status === 200 && response._data.hasOwnProperty('success')) {
          lots.value = response._data.success
          successful.value = response._data.success
          warnings.value = response._data.errors
          fetchMaterials()
        } else {
          errors.value = response._data
        }
      },
    })
  } finally {
    isLoadingDialogVisible.value = false
  }
}

const setLotProgress = (id, progress) => {
  lotId.value = id
  progressSelected.value = progress
  isLotStatusDialogVisible.value = true
}

watch(lotsData, newData => {
  lots.value = [...newData]
})
</script>

<template>
  <Breadcrumb
    :items="[{ title: 'Vivienda en Serie', class: 'text-primary' }, { title: `OD's`, to: { name: 'apps-ods-list' }, class: 'text-underline' }, { title: `${homeProductionData.front} - ${homeProductionData.od}` }]"
    icon="home-stats"
  />
  <VCard>
    <VCardItem class="pb-4">
      <VCardTitle>Información</VCardTitle>
    </VCardItem>
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="homeProductionData.client"
            label="Cliente"
            placeholder="Cliente"
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="homeProductionData.front"
            label="Frente / Fraccionamiento"
            placeholder="Frente / Fraccionamiento"
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="homeProductionData.od"
            label="OD"
            placeholder="OD"
          />
        </VCol>
      </VRow>
    </VCardText>
    <VDivider />
    <VTabs
      v-model="currentTab"
      grow
      stacked
    >
      <VTab>
        <VIcon
          icon="tabler-home"
          class="mb-2"
        />
        <span>Lotes</span>
      </VTab>

      <VTab>
        <VIcon
          icon="tabler-package"
          class="mb-2"
        />
        <span>Materiales</span>
      </VTab>
    </VTabs>
    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem style="padding-block: 15px;">
          <VRow
            v-for="(_, i) in lots"
            :key="i"
            class="row-table"
            style="margin-inline-start: 0;"
          >
            <VCol
              cols="12"
              md="2"
              class="narrow-column"
            >
              <AppTextField
                v-model="lots[i].block"
                placeholder="Manzana"
              />
            </VCol>
            <VCol
              cols="12"
              md="2"
              class="narrow-column"
            >
              <AppTextField
                v-model="lots[i].lot"
                placeholder="Lote"
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
              class="narrow-column"
            >
              <AppSelect
                v-model="lots[i].laid"
                placeholder="Sembrado"
                :items="['IZQUIERDO', 'DERECHO']"
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
              class="narrow-column"
            >
              <AppSelect
                v-model="lots[i].prototype"
                placeholder="Prototipo"
                :items="prototypes"
              />
            </VCol>
            <VCol
              cols="12"
              md="1"
              class="narrow-column"
            >
              <AppTextField
                :model-value="`${lots[i].percentage}%`"
                readonly
              />
            </VCol>
            <VCol
              cols="12"
              md="1"
              class="d-flex align-center"
            >
              <IconBtn
                v-if="lots[i].hasOwnProperty('_id') && lots[i]._id"
                @click="setLotProgress(lots[i]._id, lots[i].progress)"
              >
                <VIcon icon="tabler-list-check" />
              </IconBtn>
              <IconBtn v-if="lots[i].percentage === '0.00'">
                <VIcon
                  icon="tabler-trash"
                  @click="removeLot(i)"
                />
              </IconBtn>
            </VCol>
          </VRow>
          <VRow v-if="homeProductionData.progress < 100">
            <VCol
              cols="12"
              class="mt-3"
            >
              <div class="d-flex align-center flex-wrap gap-4">
                <VBtn
                  prepend-icon="tabler-plus"
                  variant="outlined"
                  @click="addNewLot"
                >
                  Añadir Lote
                </VBtn>
                <VBtn
                  prepend-icon="tabler-device-floppy"
                  :disabled="lots.length > 0 ? false : true"
                  @click="saveLots"
                >
                  Guardar Lotes
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VWindowItem>
        <VWindowItem>
          <MaterialTable :materials="materialsData" />
        </VWindowItem>
      </VWindow>
    </VCardText>
    <VDivider v-if="homeProductionData.progress < 100" />
    <VCardItem
      v-if="homeProductionData.progress < 100"
      class="pb-4"
    >
      <VCardTitle>Subir por archivo</VCardTitle>
    </VCardItem>
    <VCardText v-if="homeProductionData.progress < 100">
      <VRow>
        <VCol cols="12">
          <p>
            Para cargar información a través de un archivo debe ser de formato <b>EXCEL</b> y debe tener un formato en específico, el cual para los materiales es el siguiente: <a
              :href="lotesFormat"
              target="_blank"
              rel="noopener noreferrer"
            >FORMATO LOTES</a>
          </p>
        </VCol>
        <VCol
          cols="12"
          md="8"
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
        <VCol cols="12">
          <VBtn
            color="primary"
            :disabled="excelFile ? false : true"
            type="submit"
            prepend-icon="tabler-file-upload"
            @click="uploadLots"
          >
            Cargar archivo
          </VBtn>
        </VCol>
        <VCol cols="12">
          <VAlert
            v-if="successful.length > 0"
            border="start"
            border-color="success"
            class="mb-2"
            closable
          >
            Archivo cargado correctamente, total de lotes creados: <b>{{ successful.length }}</b>
          </VAlert>
          <VAlert
            v-if="warnings.length > 0"
            border="start"
            border-color="warning"
            class="mb-2"
            closable
          >
            Advertencias:
            <ul
              v-for="(warning, idx) in warnings"
              :key="idx"
            >
              <li>Fila: {{ warning.row }} - {{ warning.errors[0] }}</li>
            </ul>
          </VAlert>
          <VAlert
            v-if="errors"
            border="start"
            border-color="error"
            closable
          >
            Ocurrió un error al procesaro el archivo: 
            <br>
            {{ errors }}
          </VAlert>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
  <LoadingDataDialog v-model:is-dialog-visible="isLoadingDialogVisible" />
  <Notification
    v-model:is-notification-visible="isNotificationVisible"
    :message="notificationMessage"
  />
  <LotStatusDialog
    v-model:is-dialog-visible="isLotStatusDialogVisible"
    v-model:lot-id="lotId"
    v-model:progress-data="progressSelected"
    @save-progress="saveProgress"
  />
</template>

<style lang="scss">
.row-table {
  .v-col-12 {
    padding-block: 1px !important;
  }
}

.narrow-column {
  padding-inline: 1px !important;

  .v-field {
    border-radius: 0 !important;
  }
}

.more-info {
  inline-size: 100%;
  padding-block: 10px;
}
</style>
