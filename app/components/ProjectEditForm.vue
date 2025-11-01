<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { editProjectSchema, type EditProjectSchema } from '~~/shared/schemas'
import { FetchError } from 'ofetch'

const { project, hackatimePath } = defineProps<{
  project?: Project
  hackatimePath: string
}>()

const emit = defineEmits<{
  submit: [data: EditProjectSchema]
  error: [error: FetchError]
}>()

const { data: hackatimeData, error: hackatimeError } = await useFetch<
  {
    label: string
    value: string
    description: string
  }[]
>(hackatimePath)
if (hackatimeError.value) {
  emit('error', hackatimeError.value)
}

const state = reactive<EditProjectSchema>({
  title: project?.title || '',
  description: project?.description || '',
  repo: project?.repo || '',
  demo: project?.demo || '',
  hackatime_projects: project?.hackatime_projects || [],
  screenshot: null,
})
const screenshotFile = ref<File | null>(null)

async function onSubmit(event: FormSubmitEvent<EditProjectSchema>) {
  const data: EditProjectSchema = {
    ...event.data,
  }
  if (screenshotFile.value) {
    data.screenshot = await blobToBase64URL(screenshotFile.value)
  }
  emit('submit', data)
}
</script>

<template>
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
      <UInput v-model="state.repo" class="w-full md:w-1/2" />
    </UFormField>

    <UFormField label="Demo URL (optional)" name="demo">
      <UInput v-model="state.demo" class="w-full md:w-1/2" />
    </UFormField>

    <UFormField label="Screenshot" name="screenshot">
      <UFileUpload
        v-model="screenshotFile"
        label="Upload a screenshot"
        accept="image/*"
        class="w-full md:w-1/2"
      />
    </UFormField>

    <UFormField
      label="Hackatime Projects (optional, but recommended)"
      name="hackatime_projects"
    >
      <UCheckboxGroup
        v-model="state.hackatime_projects"
        :items="hackatimeData"
      />
    </UFormField>

    <UButton type="submit">Edit</UButton>
  </UForm>
</template>
