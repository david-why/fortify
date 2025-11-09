<script setup lang="ts">
const { data: rawProjects } = await useFetch('/api/projects')
const projects = computed(
  () =>
    rawProjects.value?.map((p) => ({
      ...p,
      week: parseInt(p.week_badge_text.substring(5)),
      value: Number(p.coin_value),
    })) ?? []
)

const maxCoins = computed(() =>
  projects.value
    .map((p) => Number(p.coin_value))
    .reduce((a, b) => Math.max(a, b), 0)
)

const displayProjects = computed(() =>
  projects.value.toSorted((a, b) => b.week - a.week)
)
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">Explore projects</h1>

  <ul class="flex flex-wrap gap-1">
    <li
      class="leading-none"
      v-for="project in displayProjects"
      :key="project.id"
    >
      <ExploreProject :project="project" :max-coins="maxCoins" />
    </li>
  </ul>
</template>
