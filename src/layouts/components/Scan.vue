<script setup>
defineOptions({
  // 👉 Is App Search Bar Visible
  inheritAttrs: false,
})
</script>

<template>
  <div
    class="d-flex align-center cursor-pointer"
    v-bind="$attrs"
    style="user-select: none;"
  >
    <!-- 👉 Search Trigger button -->
    <!-- close active tour while opening search bar using icon -->
    <IconBtn :to="{ name: 'pages-scan' }">
      <VIcon icon="tabler-barcode" />
    </IconBtn>
  </div>
</template>
