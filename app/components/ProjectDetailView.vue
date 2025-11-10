<script setup lang="ts">
import { FetchError } from 'ofetch'
import { canEditProject } from '~~/shared/validation'

const settings = useFortifySettings()
const loadingIndicator = useLoadingIndicator()
const toast = useToast()

const {
  id,
  project: defaultProject,
  prefix = '',
  statusPrefix = '',
} = defineProps<{
  id: number
  project?: Project
  prefix?: string
  statusPrefix?: string
}>()
const emit = defineEmits<{
  error: []
}>()

const project = ref<Project>()

const isJumpscareOpen = ref(false)
const submitCounter = ref(0)
const deleteCounter = ref(0)

async function refreshData() {
  loadingIndicator.start()
  try {
    project.value = undefined
    const data = await $fetch(`/api/projects/${id}`)
    project.value = data
    loadingIndicator.finish()
  } catch (e) {
    loadingIndicator.finish({ error: true })
    toast.add({
      color: 'error',
      title: 'Failed to fetch project',
      description: String(e),
    })
    emit('error')
  }
}

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

async function deleteProject() {
  loadingIndicator.start()
  try {
    await $fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    })
    await navigateTo('/armory')
    return
  } catch (e) {
    loadingIndicator.finish()
    console.error(e)
    if (e instanceof FetchError) {
      alert(e.message)
    } else {
      alert(String(e))
    }
    return
  }
}

async function editClicked() {
  if (!settings.value.hideJumpscares) {
    isJumpscareOpen.value = true
    await new Promise((resolve) => setTimeout(resolve, 1000))
    isJumpscareOpen.value = false
  }
  await navigateTo(`/armory/${id}/edit`)
}

watch(
  () => defaultProject,
  (value) => {
    if (value) {
      project.value = value
    }
  }
)

onMounted(async () => {
  if (defaultProject) {
    project.value = defaultProject
  } else {
    await refreshData()
  }
})
</script>

<template>
  <template v-if="project">
    <h1 class="text-3xl font-bold mb-4">{{ prefix }}{{ project.title }}</h1>
    <p class="text-sm mb-4">
      {{ statusPrefix }}Week {{ project.week }}, {{ project.hours }} hours,
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
    <blockquote
      class="border-l-2 border-gray-400 ps-4 whitespace-pre-wrap mb-4"
    >
      {{ project.description }}
    </blockquote>
    <div class="flex flex-wrap gap-2 mb-4">
      <ProjectLinks :project="project" />
    </div>
    <div class="flex flex-wrap gap-2 mb-4" v-if="project.is_self">
      <UButton
        @click="editClicked"
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

      <DeleteModal
        :key="deleteCounter"
        :project="project"
        @confirm="deleteProject"
      />
    </div>
    <div class="mb-4" v-if="project.screenshot">
      <img :src="project.screenshot" class="max-h-96" />
    </div>

    <UModal fullscreen :open="isJumpscareOpen">
      <template #content>
        <img src="/images/jumpscare.jpeg" />
      </template>
    </UModal>
  </template>
  <template v-else>
    <p>Loading project...</p>
  </template>
</template>
