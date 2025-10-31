<script setup lang="ts">
defineProps<{
  project: Pick<Project, 'status' | 'value'>
}>()
</script>

<template>
  <span v-if="project.status === 'building'">Building</span>
  <span v-else-if="project.status === 'pending_voting'">Pending voting</span>
  <span v-else-if="project.status === 'waiting_for_review'"
    >Waiting for finalization</span
  >
  <span v-else-if="project.status === 'submitted'">Submitted for review</span>
  <span
    v-else-if="project.status === 'finished'"
    class="inline-flex items-center gap-1"
    >Value: {{ project.value }} <CoinIcon
  /></span>
  <span v-else>Unknown</span>
</template>
