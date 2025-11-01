<script setup lang="ts">
import { FetchError } from 'ofetch'
import type { EditProjectSchema } from '~~/shared/schemas'

const loadingIndicator = useLoadingIndicator()

async function onSubmit(data: EditProjectSchema) {
  try {
    loadingIndicator.start()
    const { id } = await $fetch(`/api/projects`, {
      method: 'POST',
      body: data,
    })
    loadingIndicator.clear()
    await navigateTo(`/armory/${id}`)
    return
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
  <h1 class="text-3xl font-bold mb-4">New project</h1>
  <ProjectEditForm
    hackatime-path="/api/projects/new/hackatime-projects"
    submit-label="Create"
    @submit="onSubmit"
  />
</template>
