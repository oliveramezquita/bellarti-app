
<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  lotId: {
    type: String,
    required: true,
  },
  progressData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDialogVisible',
  'saveProgress',
])

const cocina = ref([])
const cocinaProgress = ref(0.0)
const closet = ref([])
const closetProgress = ref(0.0)
const puertas = ref([])
const puertasProgress = ref(0.0)
const mdeb = ref([])
const mdebProgress = ref(0.0)
const waldras = ref([])
const waldrasProgress = ref(0.0)
const instalacion = ref([])
const instalacionProgress = ref(0.0)
const generalProgress = ref(0.0)

const progressCatalog = ref({
  cocina: ['Material Listo', 'Corte Blanco', 'Corte Color', 'Enchape', 'Armado', 'Embarque'],
  closet: ['Material Listo', 'Corte Color', 'Enchape', 'Armado', 'Embarque'],
  puertas: ['Material Listo', 'Corte Color', 'Enchape', 'Armado', 'Embarque'],
  mdeb: ['Material Listo', 'Corte Color', 'Enchape', 'Armado', 'Embarque'],
  waldras: ['Material Listo', 'Corte', 'Entintado', 'Embarque'], 
  instalacion: ['Cocina', 'Granito', 'Closets', 'Vestidor', 'Mueble de Baño', 'Puertas Interior', 'Waldras', 'VoBo'],
})

const dialogVisibleUpdate = val => {
  emit('update:isDialogVisible', val)
}

const saveAdvance = () => {
  emit('saveProgress', {
    id: props.lotId,
    // eslint-disable-next-line camelcase
    total_percentage: generalProgress.value,
    progress: {
      cocina: {
        stages: cocina.value,
        percentage: cocinaProgress.value,
      },
      closet: {
        stages: closet.value,
        percentage: closetProgress.value,
      },
      puertas: {
        stages: puertas.value,
        percentage: puertasProgress.value,
      },
      mdeb: {
        stages: mdeb.value,
        percentage: mdebProgress.value,
      },
      waldras: {
        stages: waldras.value,
        percentage: waldrasProgress.value,
      },
      instalacion: {
        stages: instalacion.value,
        percentage: instalacionProgress.value,
      },
    },
  })
  emit('update:isDialogVisible', false)
}

const getPercentage = (progress, max) => {
  return parseFloat(((progress * 100) / max).toFixed(2))
} 

const getGeneralProgress = () => {
  const sum = cocinaProgress.value + closetProgress.value + puertasProgress.value + mdebProgress.value + waldrasProgress.value + instalacionProgress.value

  generalProgress.value = parseFloat(((sum * 100) / 600).toFixed(2))
}

watch(() => props.progressData, newValue => {
  if (newValue) {
    cocina.value = newValue.cocina.stages
    cocinaProgress.value = newValue.cocina.percentage
    closet.value = newValue.closet.stages
    closetProgress.value = newValue.closet.percentage
    puertas.value = newValue.puertas.stages
    puertasProgress.value = newValue.puertas.percentage
    mdeb.value = newValue.mdeb.stages
    mdebProgress.value = newValue.mdeb.percentage
    waldras.value = newValue.waldras.stages
    waldrasProgress.value = newValue.waldras.percentage
    instalacion.value = newValue.instalacion.stages
    instalacionProgress.value = newValue.instalacion.percentage
  } else {
    cocina.value = []
    cocinaProgress.value = 0.0
    closet.value = []
    closetProgress.value = 0.0
    puertas.value = []
    puertasProgress.value = 0.0
    mdeb.value = []
    mdebProgress.value = 0.0
    waldras.value = []
    waldrasProgress.value = 0.0
    instalacion.value = []
    instalacionProgress.value = 0.0
  }
})

watch(cocina, val => {
  cocinaProgress.value = getPercentage(val.length, 6)
  getGeneralProgress()
})
watch(closet, val => {
  closetProgress.value = getPercentage(val.length, 5)
  getGeneralProgress()
})
watch(puertas, val => {
  puertasProgress.value = getPercentage(val.length, 5)
  getGeneralProgress()
})
watch(mdeb, val => {
  mdebProgress.value = getPercentage(val.length, 5)
  getGeneralProgress()
})
watch(waldras, val => {
  waldrasProgress.value = getPercentage(val.length, 4)
  getGeneralProgress()
})
watch(instalacion, val => {
  instalacionProgress.value = getPercentage(val.length, 8)
  getGeneralProgress()
})
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    :width="$vuetify.display.smAndDown ? 'auto' : 1100"
    @update:model-value="dialogVisibleUpdate"
  >
    <!-- 👉 Dialog close btn -->
    <DialogCloseBtn @click="$emit('update:isDialogVisible', false)" />

    <VCard class="pa-1">
      <VCardText>
        <div class="text-center">
          <h4 class="text-h4 mb-2">
            AVANCE {{ generalProgress > 0 ? `(${generalProgress}%)` : '' }}
          </h4>
        </div>
        <h4>
          PRODUCCIÓN COCINA {{ cocinaProgress > 0 ? `(${cocinaProgress}%)` : '' }}
        </h4>
        <div class="demo-space-x mb-3">
          <VCheckbox
            v-model="cocina"
            label="Material Listo"
            :value="progressCatalog.cocina[0]"
          />
          <VCheckbox
            v-model="cocina"
            label="Corte Blanco"
            :value="progressCatalog.cocina[1]"
          />
          <VCheckbox
            v-model="cocina"
            label="Corte Color"
            :value="progressCatalog.cocina[2]"
          />
          <VCheckbox
            v-model="cocina"
            label="Enchape"
            :value="progressCatalog.cocina[3]"
          />
          <VCheckbox
            v-model="cocina"
            label="Armado"
            :value="progressCatalog.cocina[4]"
          />
          <VCheckbox
            v-model="cocina"
            label="Embarque"
            :value="progressCatalog.cocina[5]"
          />
        </div>
        <h4>
          PRODUCCIÓN CLOSET {{ closetProgress > 0 ? `(${closetProgress}%)` : '' }}
        </h4>
        <div class="demo-space-x mb-3">
          <VCheckbox
            v-model="closet"
            label="Material Listo"
            :value="progressCatalog.closet[0]"
          />
          <VCheckbox
            v-model="closet"
            label="Corte Color"
            :value="progressCatalog.closet[1]"
          />
          <VCheckbox
            v-model="closet"
            label="Enchape"
            :value="progressCatalog.closet[2]"
          />
          <VCheckbox
            v-model="closet"
            label="Armado"
            :value="progressCatalog.closet[3]"
          />
          <VCheckbox
            v-model="closet"
            label="Embarque"
            :value="progressCatalog.closet[4]"
          />
        </div>
        <h4>
          PRODUCCIÓN PUERTAS {{ puertasProgress > 0 ? `(${puertasProgress}%)` : '' }}
        </h4>
        <div class="demo-space-x mb-3">
          <VCheckbox
            v-model="puertas"
            label="Material Listo"
            :value="progressCatalog.puertas[0]"
          />
          <VCheckbox
            v-model="puertas"
            label="Corte Color"
            :value="progressCatalog.puertas[1]"
          />
          <VCheckbox
            v-model="puertas"
            label="Enchape"
            :value="progressCatalog.puertas[2]"
          />
          <VCheckbox
            v-model="puertas"
            label="Armado"
            :value="progressCatalog.puertas[3]"
          />
          <VCheckbox
            v-model="puertas"
            label="Embarque"
            :value="progressCatalog.puertas[4]"
          />
        </div>
        <h4>
          PRODUCCIÓN M. DE B. {{ mdebProgress > 0 ? `(${mdebProgress}%)` : '' }}
        </h4>
        <div class="demo-space-x mb-3">
          <VCheckbox
            v-model="mdeb"
            label="Material Listo"
            :value="progressCatalog.mdeb[0]"
          />
          <VCheckbox
            v-model="mdeb"
            label="Corte Color"
            :value="progressCatalog.mdeb[1]"
          />
          <VCheckbox
            v-model="mdeb"
            label="Enchape"
            :value="progressCatalog.mdeb[2]"
          />
          <VCheckbox
            v-model="mdeb"
            label="Armado"
            :value="progressCatalog.mdeb[3]"
          />
          <VCheckbox
            v-model="mdeb"
            label="Embarque"
            :value="progressCatalog.mdeb[4]"
          />
        </div>
        <h4>
          PRODUCCIÓN WALDRAS {{ waldrasProgress > 0 ? `(${waldrasProgress}%)` : '' }}
        </h4>
        <div class="demo-space-x mb-3">
          <VCheckbox
            v-model="waldras"
            label="Material Listo"
            :value="progressCatalog.waldras[0]"
          />
          <VCheckbox
            v-model="waldras"
            label="Corte"
            :value="progressCatalog.waldras[1]"
          />
          <VCheckbox
            v-model="waldras"
            label="Entintado"
            :value="progressCatalog.waldras[2]"
          />
          <VCheckbox
            v-model="waldras"
            label="Embarque"
            :value="progressCatalog.waldras[3]"
          />
        </div>
        <h4>
          INSTALACIÓN {{ instalacionProgress > 0 ? `(${instalacionProgress}%)` : '' }}
        </h4>
        <div class="demo-space-x mb-3">
          <VCheckbox
            v-model="instalacion"
            label="Cocina"
            :value="progressCatalog.instalacion[0]"
          />
          <VCheckbox
            v-model="instalacion"
            label="Granito"
            :value="progressCatalog.instalacion[1]"
          />
          <VCheckbox
            v-model="instalacion"
            label="Closets"
            :value="progressCatalog.instalacion[2]"
          />
          <VCheckbox
            v-model="instalacion"
            label="Vestidor"
            :value="progressCatalog.instalacion[3]"
          />
          <VCheckbox
            v-model="instalacion"
            label="Mueble de Baño"
            :value="progressCatalog.instalacion[4]"
          />
          <VCheckbox
            v-model="instalacion"
            label="Puertas Interior"
            :value="progressCatalog.instalacion[5]"
          />
          <VCheckbox
            v-model="instalacion"
            label="Waldras"
            :value="progressCatalog.instalacion[6]"
          />
          <VCheckbox
            v-model="instalacion"
            label="VoBo"
            :value="progressCatalog.instalacion[7]"
          />
        </div>
        <div class="d-flex align-center justify-center mt-7">
          <VBtn
            class="mr-4"
            prepend-icon="tabler-checkbox"
            @click="saveAdvance"
          >
            Guardar Avance
          </VBtn>
          <VBtn
            variant="outlined"
            color="secondary"
            prepend-icon="tabler-x"
            @click="$emit('update:isDialogVisible', false)"
          >
            Cancelar
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>
