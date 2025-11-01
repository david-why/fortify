<script setup lang="ts">
import { canDestroyProject } from '~~/shared/validation'

defineProps<{
  project: Project
}>()

const emit = defineEmits<{
  confirm: []
}>()

const isDeleting = ref(false)

function onDeleteClicked() {
  emit('confirm')
}
</script>

<template>
  <UModal
    title="Destroy project"
    :ui="{ footer: 'justify-end' }"
    :dismissible="!isDeleting"
    :close="!isDeleting"
  >
    <UButton
      color="error"
      variant="subtle"
      :disabled="!canDestroyProject(project)"
      class="cursor-pointer"
    >
      <UIcon name="i-material-symbols-delete" /> Destroy project
    </UButton>

    <template #body>
      <p>
        Are you sure you want to destroy this project? This action cannot be
        undone.
      </p>
    </template>

    <template #footer="{ close }">
      <UButton color="error" :disabled="isDeleting" @click="onDeleteClicked"
        >Delete</UButton
      >
      <UButton
        color="neutral"
        variant="subtle"
        :disabled="isDeleting"
        @click="close"
        >Cancel</UButton
      >
    </template>
  </UModal>
</template>
