<script setup lang="ts">
const { project, maxCoins } = defineProps<{
  project: APIProject
  maxCoins: number
}>()

const value = computed(() => Number(project.coin_value))

const project2 = computed(() => ({
  ...project,
  value: value.value,
}))

const week = computed(() => parseInt(project.week_badge_text.substring(5)))

const tileColor = computed(() => {
  switch (project.status) {
    case 'building':
      return 'var(--color-gray-400)'
    case 'submitted':
      return 'var(--color-blue-500)'
    case 'pending_voting':
      return 'var(--color-violet-500)'
    case 'waiting_for_review':
      return 'var(--color-teal-500)'
    case 'finished':
      return `color-mix(in srgb, yellow ${
        10 + (value.value / maxCoins) * 90
      }%, black 5%)`
  }
})
</script>

<template>
  <UModal>
    <UTooltip>
      <ColoredSquare class="text-3xl" :color="tileColor" />
    </UTooltip>

    <template #title>
      <span>{{ project.name }} - {{ project.week_badge_text }}</span>
    </template>

    <template #body>
      <p>Status: <ProjectStatus :project="project2" /></p>
    </template>
  </UModal>
</template>
