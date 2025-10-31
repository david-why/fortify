<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { id } = route.params as { id: string }

const data = await useFetch<Project>(`/api/users/me/projects/${id}`)

const project = computed(() => {
  return data.data.value!
})

watch(
  data.status,
  (value) => {
    if (value === 'error') {
      router.push('/armory')
    }
    console.log(data.data.value)
  },
  { immediate: true }
)
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">{{ project.title }}</h1>
  <p class="text-sm mb-4">Week {{ project.week }}</p>
  <blockquote class="border-l-2 border-gray-500 ps-4 whitespace-pre-wrap mb-4">
    {{ project.description }}
  </blockquote>
  <div class="flex flex-wrap gap-2 mb-4">
    <ProjectLinks :project="project" />
  </div>
  <div v-if="project.screenshot">
    <img :src="project.screenshot" class="max-h-96" />
  </div>
</template>
