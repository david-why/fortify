<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { editProjectSchema, type EditProjectSchema } from '~~/shared/schemas'
import { canEditProject } from '~~/shared/validation'

const route = useRoute()
const router = useRouter()
const { id } = route.params as { id: string }

const { data, error } = await useFetch<Project>(`/api/users/me/projects/${id}`)
if (
  error.value ||
  !data.value ||
  !data.value.is_self ||
  !canEditProject(data.value)
) {
  throw navigateTo(`/armory/${id}`)
}

const state = reactive<EditProjectSchema>({
  title: data.value.title || '',
  repo: data.value.repo || '',
  demo: data.value.demo || '',
})

async function onSubmit(event: FormSubmitEvent<EditProjectSchema>) {
  // console.log(event.data)
  const res = await $fetch(`/api/users/me/projects/${id}`, {
    method: 'PUT',
    body: event.data,
  })
  console.log(res)
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

    <UFormField label="Repository URL (optional)" name="repo">
      <UInput autocomplete="off" v-model="state.repo" class="w-full md:w-1/2" />
    </UFormField>

    <UFormField label="Demo URL (optional)" name="demo">
      <UInput autocomplete="off" v-model="state.demo" class="w-full md:w-1/2" />
    </UFormField>

    <UButton type="submit">Edit</UButton>
  </UForm>
</template>
