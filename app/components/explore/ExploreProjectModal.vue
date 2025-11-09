<script setup lang="ts">
defineProps<{
  id: number
  title: string
}>()
</script>

<template>
  <UModal fullscreen :title="title">
    <template #body>
      <ProjectDetailView class="max-w-lg" :id="id" />
    </template>
  </UModal>
</template>
