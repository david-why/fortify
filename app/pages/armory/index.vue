<script setup lang="ts">
const router = useRouter()

const data = await useFetch<UserProject[]>('/api/users/me/projects')

const projects = computed(() =>
  data.data.value?.toSorted((a, b) => a.week - b.week)
)

onMounted(() => {
  if (data.status.value === 'error') {
    return router.push('/login')
  }
})
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">Armory</h1>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 align-stretch">
    <ULink
      :to="`/armory/${project.id}`"
      v-for="project in projects"
      :key="project.title"
    >
      <UCard class="h-full">
        <template #header>
          <h2 class="text-xl font-semibold">{{ project.title }}</h2>
          <h3>Week {{ project.week }}</h3>
        </template>

        <p class="whitespace-pre-wrap mb-4">{{ project.description }}</p>

        <div class="flex flex-wrap gap-2">
          <ProjectLinks :project="project" />
        </div>
      </UCard>
    </ULink>
  </div>
</template>
