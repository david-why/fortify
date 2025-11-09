<script setup lang="ts">
defineProps<{
  id: number
  title: string
}>()
</script>

<template>
  <UModal fullscreen :title="title">
    <template #body>
      <ProjectDetailView :id="id" />
    </template>

    <template #footer="{ close }">
      <UButton
        class="cursor-pointer"
        icon="i-material-symbols-swords"
        variant="subtle"
        :href="`/armory/${id}`"
        @click.passive="close"
        >Open in armory</UButton
      >
    </template>
  </UModal>
</template>
