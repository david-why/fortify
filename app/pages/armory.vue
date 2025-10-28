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
  <h1 class="text-3xl font-bold">Armory</h1>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <ULink
      :to="`/projects/${project.id}`"
      v-for="project in projects"
      :key="project.title"
    >
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">{{ project.title }}</h2>
          <h3>Week {{ project.week }}</h3>
          <p class="whitespace-pre-wrap">{{ project.description }}</p>
        </template>
      </UCard>
    </ULink>
  </div>
</template>
