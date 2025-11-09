<script setup lang="ts">
const settings = useFortifySettings()

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
  if (!settings.value.hideJumpscares) {
    document.body.style.backgroundColor = 'var(--ui-color-error-900)'
  }
  await navigateTo(`/armory/${project.id}`)
}
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">Your projects</h1>
  <div class="flex gap-4 mb-4">
    <UButton v-if="canCreate" href="/armory/new" variant="subtle"
      >Create project</UButton
    >
    <UButton href="/armory/explore" color="neutral" variant="subtle">Explore projects</UButton>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 align-stretch">
    <ULink
      v-for="project in projects"
      :key="project.id"
      @click="onClickProject(project)"
      as="div"
      class="cursor-pointer"
    >
      <UserProjectCard class="h-full" :project="project" />
    </ULink>
  </div>
</template>
