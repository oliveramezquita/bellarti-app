<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'AdmRoles',
  },
})
import RoleList from '@/views/apps/roles/RoleList.vue'
</script>

<template>
  <VRow>
    <VCol cols="12">
      <!-- 👉 User List  -->
      <RoleList />
    </VCol>
  </VRow>
</template>
