<script setup lang="ts">
const { data, error } = await useFetch('/api/users/me/projects')
if (error.value) {
  if (error.value.statusCode === 401) {
    throw navigateTo('/login')
  }
  console.error(error.value, error.value.message)
  throw navigateTo('/')
}

const projects = computed(() =>
  data.value?.projects.toSorted((a, b) => a.week - b.week)
)
const canCreate = computed(() => data.value?.canCreate)

async function onClickProject(project: UserProject) {
  document.body.style.backgroundColor = 'var(--ui-color-error-900)'
  await navigateTo(`/armory/${project.id}`)
}
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">Your projects</h1>
  <div class="mb-4" v-if="canCreate">
    <UButton href="/armory/new" variant="subtle">Create project</UButton>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 align-stretch">
    <ULink
      v-for="project in projects"
      :key="project.title"
      @click="onClickProject(project)"
      as="a"
      class="cursor-pointer"
    >
      <UserProjectCard class="h-full" :project="project" />
    </ULink>
  </div>
</template>
