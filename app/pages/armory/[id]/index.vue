<script setup lang="ts">
import { canEditProject } from '~~/shared/validation'

const route = useRoute()
const router = useRouter()
const { id } = route.params as { id: string }

const data = await useFetch(`/api/projects/${id}`)

const project = computed(() => {
  return data.data.value!
})

watch(
  data.status,
  (value) => {
    if (value === 'error') {
      router.push('/armory')
    }
  },
  { immediate: true }
)
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">{{ project.title }}</h1>
  <p class="text-sm mb-4">
    Week {{ project.week }}, <ProjectStatus :project="project" />
  </p>
  <blockquote class="border-l-2 border-gray-400 ps-4 whitespace-pre-wrap mb-4">
    {{ project.description }}
  </blockquote>
  <div class="flex flex-wrap gap-2 mb-4">
    <ProjectLinks :project="project" />
  </div>
  <div class="mb-4" v-if="project.is_self">
    <UButton
      :href="`/armory/${id}/edit`"
      color="neutral"
      variant="subtle"
      :disabled="!canEditProject(project)"
    >
      <UIcon name="i-material-symbols-edit-square-outline-rounded" /> Edit
      project
    </UButton>
  </div>
  <div class="mb-4" v-if="project.screenshot">
    <img :src="project.screenshot" class="max-h-96" />
  </div>
</template>
