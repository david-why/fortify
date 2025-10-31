<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { editProjectSchema, type EditProjectSchema } from '~~/shared/schemas'
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

const state = reactive<EditProjectSchema>({
  title: data.value.title || '',
  description: data.value.description || '',
  repo: data.value.repo || '',
  demo: data.value.demo || '',
})

async function onSubmit(event: FormSubmitEvent<EditProjectSchema>) {
  try {
    loadingIndicator.start()
    await $fetch(`/api/projects/${id}`, {
      method: 'PUT',
      body: event.data,
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
  <UForm
    :schema="editProjectSchema"
    :state="state"
    class="space-y-2"
    @submit="onSubmit"
  >
    <UFormField label="Project name" name="name">
      <UInput
        autocomplete="off"
        v-model="state.title"
        class="w-full md:w-1/2"
      />
    </UFormField>

    <UFormField label="Description" name="description">
      <UTextarea
        autocomplete="off"
        v-model="state.description"
        class="w-full md:w-1/2"
      />
    </UFormField>

    <UFormField label="Repository URL (optional)" name="repo">
      <UInput autocomplete="off" v-model="state.repo" class="w-full md:w-1/2" />
    </UFormField>

    <UFormField label="Demo URL (optional)" name="demo">
      <UInput autocomplete="off" v-model="state.demo" class="w-full md:w-1/2" />
    </UFormField>

    <UButton type="submit">Edit</UButton>
  </UForm>
</template>
