<script setup lang="ts">
const props = defineProps<{
  project: APIProject
  colorAttr?: string
  maxValue: number
}>()

const value = computed(() => Number(props.project.coin_value))
const efficiency = computed(() =>
  props.project.hours ? value.value / props.project.hours : 0
)

const attrValue = computed(() => {
  switch (props.colorAttr) {
    case 'efficiency':
      return efficiency.value
    default:
      return value.value
  }
})

const tileColor = computed(() => {
  switch (props.project.status) {
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
        25 + (attrValue.value / props.maxValue) * 75
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
        }}, {{ project.hours }}h,
        <ProjectStatus :project="{ ...project, value }" />)</span
      >
    </template>
  </UTooltip>
</template>
