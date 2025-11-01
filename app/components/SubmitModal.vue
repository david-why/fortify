<script setup lang="ts">
import { SUBMIT_NOTE } from '~~/shared/consts'
import { canSubmitProject } from '~~/shared/validation'

const { project } = defineProps<{ project: Project }>()

const emit = defineEmits<{
  submit: [isUpdate: boolean]
}>()

const checkboxItems = computed(() => [
  {
    label: 'Git repo added',
    value: 'git',
  },
  {
    label: 'Demo link added',
    value: 'demo',
  },
  {
    label: 'Demo link live',
    value: 'demo_live',
  },
  {
    label: 'Added a screenshot',
    value: 'screenshot',
  },
  {
    label: 'Hackatime projects added',
    value: 'hackatime',
  },
])

const checkboxState = ref<string[]>([])
const isUpdate = ref(false)
const isSubmitting = ref(false)

const isReady = computed(
  () => checkboxItems.value.length === checkboxState.value.length
)

function onSubmitClicked(close: () => void) {
  emit('submit', isUpdate.value)
  isSubmitting.value = true
}

onMounted(async () => {
  if (project.repo) {
    checkboxState.value.push('git')
  }
  if (project.demo) {
    checkboxState.value.push('demo')
  }
  if (project.screenshot) {
    checkboxState.value.push('screenshot')
  }
  if (project.hackatime_projects?.length) {
    checkboxState.value.push('hackatime')
  }
  if (project.demo) {
    try {
      const res = await fetch(project.demo, { method: 'HEAD' })
      checkboxState.value.push('demo_live')
    } catch {}
  }
})
</script>

<template>
  <UModal
    title="Submit project"
    :ui="{ footer: 'justify-end' }"
    :dismissible="!isSubmitting"
    :close="!isSubmitting"
  >
    <UButton
      color="primary"
      variant="subtle"
      :disabled="!canSubmitProject(project)"
      class="cursor-pointer"
    >
      <UIcon name="i-material-symbols-upload" /> Submit project
    </UButton>

    <template #body>
      <div class="mx-4">
        <UCheckboxGroup
          disabled
          :model-value="checkboxState"
          :items="checkboxItems"
        />
        <div class="border-t border-gray-500 my-4" />
        <div class="mb-1">
          <UCheckbox
            v-model="isUpdate"
            :disabled="isSubmitting"
            label="This is an update to a previously shipped project"
          />
        </div>
        <p class="mb-2 text-sm italic" v-if="isUpdate">
          Make sure your specific changes are in the description
        </p>
        <p class="text-sm whitespace-pre-wrap">{{ SUBMIT_NOTE }}</p>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton
        color="primary"
        :disabled="!isReady || isSubmitting"
        @click="onSubmitClicked(close)"
        >Submit</UButton
      >
      <UButton
        color="neutral"
        variant="subtle"
        :disabled="isSubmitting"
        @click="close"
        >Cancel</UButton
      >
    </template>
  </UModal>
</template>
