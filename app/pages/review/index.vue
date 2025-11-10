<script setup lang="ts">
const toast = useToast()

const { data: projects, error } = useFetch('/api/stonemason/projects')
if (error.value) {
  const message =
    error.value.statusCode === 403
      ? 'You are not a stonemason'
      : error.value.message
  toast.add({
    color: 'error',
    title: 'Failed to fetch projects',
    description: message,
  })
  throw navigateTo('/')
}
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">Project Review</h1>

  <ul class="grid grid-cols-1 lg:grid-cols-2 gap-4 align-stretch">
    <li v-for="project in projects" :key="project.id">
      <ULink class="text-default" :href="`/review/projects/${project.id}`">
        <UCard class="h-full" variant="subtle">
          <h2 class="font-bold">{{ project.title }}</h2>
          <h3 class="mb-2">by {{ project.user.display_name }}</h3>
          <p class="mb-4">{{ project.description }}</p>
          <UAlert class="mb-4" color="success" variant="soft">
            <template #title> Total time: {{ project.time_text }} </template>
          </UAlert>
          <div class="flex gap-4">
            <UButton
              variant="subtle"
              color="neutral"
              :href="project.repo"
              target="_blank"
              @click.stop
              >Repository</UButton
            >
            <UButton
              variant="subtle"
              color="neutral"
              :href="project.demo"
              target="_blank"
              @click.stop
              >Demo</UButton
            >
          </div>
        </UCard>
      </ULink>
    </li>
  </ul>
</template>
