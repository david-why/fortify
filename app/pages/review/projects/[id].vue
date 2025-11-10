<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { convertAPIProjectToProject } from '~~/shared/convert'
import {
  stonemasonReviewSchema,
  type StonemasonReviewSchema,
} from '~~/shared/schemas'

const route = useRoute()
const toast = useToast()
const loadingIndicator = useLoadingIndicator()

const { id } = route.params as { id: string }

const { data, error, refresh } = await useFetch(
  `/api/stonemason/projects/${id}`
)
if (error.value) {
  const isForbidden = error.value.statusCode === 403
  const message = isForbidden ? 'You are not a stonemason' : error.value.message
  toast.add({
    color: 'error',
    title: 'Failed to fetch project',
    description: message,
  })
  throw navigateTo(isForbidden ? '/' : '/review')
}
const project = computed(() => data.value!)

const detailProject = computed<Project>(() => ({
  ...convertAPIProjectToProject(project.value),
  screenshot: null,
  is_self: false,
  hackatime_projects: project.value.hackatime_projects,
}))

// review stuff

const state = reactive<StonemasonReviewSchema>({
  review_status: 'accept',
  private_notes: '',
  stonemason_feedback: '',
  include_reviewer_handle: true,
  reviewer_video: null,
})

const videoFile = ref<File>()

async function onSubmitReview(event: FormSubmitEvent<StonemasonReviewSchema>) {
  const data = { ...event.data }
  if (videoFile.value) {
    data.reviewer_video = await blobToBase64URL(videoFile.value)
  } else {
    data.reviewer_video = null
  }

  loadingIndicator.start()
  try {
    await $fetch(`/api/stonemason/projects/${id}/submit`, {
      method: 'POST',
      body: data,
    })
    await refresh()
    loadingIndicator.finish()
  } catch (e) {
    loadingIndicator.finish({ error: true })
    toast.add({
      color: 'error',
      title: 'Failed to submit review',
      description: String(e),
    })
  }
}
</script>

<template>
  <ProjectDetailView
    :id="parseInt(id)"
    :project="detailProject"
    prefix="Stonemason Review: "
    :status-prefix="`by ${project.user.display_name}, ${
      project.is_update ? 'Update, ' : ''
    }`"
  />

  <HDivider />

  <h1 class="text-2xl font-bold mb-4">Submit Review</h1>
  <UForm
    class="w-full md:w-1/2 space-y-4"
    :state="state"
    :schema="stonemasonReviewSchema"
    @submit="onSubmitReview"
  >
    <UFormField name="review_status" label="Action">
      <USelect
        v-model="state.review_status"
        :items="[
          { label: 'Accept', value: 'accept' },
          {
            label: 'Accept but not following theme',
            value: 'accept_not_following_theme',
          },
          { label: 'Reject', value: 'reject' },
          { label: 'Add comment', value: 'add_comment' },
        ]"
        class="w-full"
      />
    </UFormField>

    <UFormField
      name="private_notes"
      label="Private notes (optional)"
      help="These notes will be logged in the review history but not shared with the user."
    >
      <UTextarea v-model="state.private_notes" class="w-full" :rows="8" />
    </UFormField>

    <UFormField
      name="stonemason_feedback"
      label="Public feedback"
      help="This feedback will be visible to the user and may trigger a Slack notification."
    >
      <UTextarea v-model="state.stonemason_feedback" class="w-full" :rows="8" />
    </UFormField>

    <UFormField
      name="reviewer_video"
      label="Review video (optional)"
      help="Upload a video file to provide visual feedback to the project creator. Supported formats: MP4, WebM, MOV, etc."
    >
      <UFileUpload
        v-model="videoFile"
        label="Upload a video"
        accept="video/*,image/*"
        class="w-full"
      >
      </UFileUpload>
    </UFormField>

    <UFormField
      name="include_reviewer_handle"
      help="When checked, your Slack handle will be included in the message sent to the user."
    >
      <UCheckbox
        v-model="state.include_reviewer_handle"
        label="Include my Slack @ in the notification"
      />
    </UFormField>

    <UButton type="submit">Submit</UButton>
  </UForm>
</template>
