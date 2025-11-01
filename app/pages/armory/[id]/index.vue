<script setup lang="ts">
import { FetchError } from 'ofetch'
import { canEditProject } from '~~/shared/validation'

const route = useRoute()
const loadingIndicator = useLoadingIndicator()
const { id } = route.params as { id: string }

const {
  error,
  data,
  refresh: refreshData,
} = await useFetch(`/api/projects/${id}`)
if (error.value || !data.value) {
  throw navigateTo('/armory')
}

const project = computed(() => {
  return data.value!
})

const submitCounter = ref(0)

async function submitProject(isUpdate: boolean) {
  loadingIndicator.start()
  try {
    await $fetch(`/api/projects/${id}/submit`, {
      method: 'POST',
      body: { is_update: isUpdate },
    })
  } catch (e) {
    loadingIndicator.finish()
    console.error(e)
    if (e instanceof FetchError) {
      alert(e.message)
    } else {
      alert(String(e))
    }
    return
  } finally {
    submitCounter.value++
  }
  try {
    await refreshData()
  } finally {
    loadingIndicator.finish()
  }
}
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">{{ project.title }}</h1>
  <p class="text-sm mb-4">
    Week {{ project.week }}, {{ project.hours }} hours,
    <ProjectStatus :project="project" />
  </p>
  <div
    class="flex flex-wrap gap-2 mb-4"
    v-if="project.hackatime_projects.length"
  >
    <UBadge
      color="primary"
      variant="subtle"
      v-for="item in project.hackatime_projects"
      ><UIcon name="i-material-symbols-timer" /> {{ item }}</UBadge
    >
  </div>
  <blockquote class="border-l-2 border-gray-400 ps-4 whitespace-pre-wrap mb-4">
    {{ project.description }}
  </blockquote>
  <div class="flex flex-wrap gap-2 mb-4">
    <ProjectLinks :project="project" />
  </div>
  <div class="flex flex-wrap gap-2 mb-4" v-if="project.is_self">
    <UButton
      :href="`/armory/${id}/edit`"
      color="neutral"
      variant="subtle"
      :disabled="!canEditProject(project)"
    >
      <UIcon name="i-material-symbols-edit-square-outline-rounded" /> Edit
      project
    </UButton>

    <SubmitModal
      :key="submitCounter"
      :project="project"
      @submit="submitProject"
    />
  </div>
  <div class="mb-4" v-if="project.screenshot">
    <img :src="project.screenshot" class="max-h-96" />
  </div>
</template>
