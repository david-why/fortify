<script setup lang="ts">
const toast = useToast()

const { data: rawProjects, error } = await useFetch('/api/projects')
if (error.value) {
  toast.add({
    color: 'error',
    title: 'Failed to get all projects',
    description: error.value.message,
  })
  throw navigateTo('/')
}

const projects = computed(
  () =>
    rawProjects.value?.map((p) => ({
      ...p,
      week: parseInt(p.week_badge_text.substring(5)),
      value: Number(p.coin_value),
      efficiency: p.hours === 0 ? 0 : Number(p.coin_value) / p.hours,
    })) ?? []
)

const maxValue = computed(() =>
  projects.value
    .map((p) => {
      switch (colorAttr.value) {
        case 'efficiency':
          return p.efficiency
        default:
          return p.value
      }
    })
    .reduce((a, b) => Math.max(a, b), 0)
)

const displayProjects = computed(() =>
  projects.value.toSorted((a, b) => {
    switch (sortBy.value) {
      case 'coins':
        return b.value - a.value
      case 'user':
        return a.user.id - b.user.id
      case 'efficiency':
        return b.efficiency - a.efficiency
      default:
        return b.id - a.id
    }
  })
)

const displayGroups = computed(() => {
  if (groupBy.value === 'week') {
    const groups = new Map<number, (typeof displayProjects)['value']>()
    for (const project of displayProjects.value) {
      groups.set(project.week, groups.get(project.week) ?? [])
      const group = groups.get(project.week)!
      group.push(project)
    }
    return groups
      .keys()
      .toArray()
      .sort((a, b) => b - a)
      .map((week) => ({ title: `Week ${week}`, projects: groups.get(week) }))
  }
  return [{ title: '', projects: displayProjects.value }]
})

const sortByItems = computed(() => [
  { label: 'Week', value: 'week' },
  { label: 'Coins gained', value: 'coins' },
  { label: 'Efficiency', value: 'efficiency' },
  { label: 'User ID', value: 'user' },
])
const sortBy = ref('week')

const groupByItems = computed(() => [
  { label: 'None', value: 'none' },
  { label: 'Week', value: 'week' },
])
const groupBy = ref('none')

const colorAttrItems = computed(() => [
  { label: 'Coins', value: 'coins' },
  { label: 'Efficiency', value: 'efficiency' },
])
const colorAttr = ref('coins')
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">Explore projects</h1>

  <h2 class="text-lg font-bold mb-2">Grid View Settings</h2>
  <div class="mb-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    <UFormField label="Sort by">
      <USelect v-model="sortBy" :items="sortByItems" class="w-full" />
    </UFormField>
    <UFormField label="Group by">
      <USelect v-model="groupBy" :items="groupByItems" class="w-full" />
    </UFormField>
    <UFormField label="Color by">
      <USelect v-model="colorAttr" :items="colorAttrItems" class="w-full" />
    </UFormField>
  </div>

  <ul>
    <li class="mb-4" v-for="group in displayGroups" :key="group.title">
      <h2 v-if="group.title" class="text-2xl font-bold mb-4">
        {{ group.title }}
      </h2>
      <ul class="flex flex-wrap gap-1">
        <li
          class="leading-none"
          v-for="project in group.projects"
          :key="project.id"
        >
          <ExploreProject
            :project="project"
            :color-attr="colorAttr"
            :max-value="maxValue"
          />
        </li>
      </ul>
    </li>
  </ul>
</template>
