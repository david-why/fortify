<script setup lang="ts">
const { project, maxCoins } = defineProps<{
  project: APIProject
  maxCoins: number
}>()

const value = computed(() => Number(project.coin_value))

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
        20 + (value.value / maxCoins) * 80
      }%, black 5%)`
  }
})
</script>

<template>
  <UTooltip>
    <ULink :href="`/armory/${project.id}`">
      <ColoredSquare class="text-3xl" :color="tileColor" />
    </ULink>

    <template #content>
      <span
        >{{ project.name }} - {{ project.user.display_name }} ({{
          project.week_badge_text
        }}, <ProjectStatus :project="{ ...project, value }" />)</span
      >
    </template>
  </UTooltip>
</template>
