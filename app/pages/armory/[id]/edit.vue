<script setup lang="ts">
import { type EditProjectSchema } from '~~/shared/schemas'
import { canEditProject } from '~~/shared/validation'
import { FetchError } from 'ofetch'

const route = useRoute()
const router = useRouter()
const loadingIndicator = useLoadingIndicator()
const { id } = route.params as { id: string }

const { data, error } = await useFetch(`/api/projects/${id}`)
if (error.value || !data.value || !canEditProject(data.value)) {
  throw navigateTo(`/armory/${id}`)
}

async function onSubmit(data: EditProjectSchema) {
  try {
    loadingIndicator.start()
    await $fetch(`/api/projects/${id}`, {
      method: 'PUT',
      body: data,
    })
    loadingIndicator.clear()
    router.push(`/armory/${id}`)
  } catch (e) {
    loadingIndicator.clear()
    if (e instanceof FetchError) {
      alert(e.message)
    } else {
      alert(String(e))
    }
  }
}
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">Edit project</h1>

  <ProjectEditForm
    :project="data"
    :hackatime-path="`/api/projects/${id}/hackatime-projects`"
    @submit="onSubmit"
  />
</template>
