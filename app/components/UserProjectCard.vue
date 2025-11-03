<script setup lang="ts">
defineProps<{
  project: UserProject
}>()
</script>

<template>
  <UCard variant="subtle">
    <template #header>
      <h2 class="text-xl font-semibold">{{ project.title }}</h2>
      <h3>Week {{ project.week }}</h3>
    </template>

    <p class="whitespace-pre-wrap mb-4">{{ project.description }}</p>

    <div class="flex flex-wrap gap-2 mb-4">
      <ProjectLinks :project="project" />
    </div>

    <div class="text-sm"><ProjectStatus :project="project" /></div>
  </UCard>
</template>
