<script setup lang="ts">
defineProps<{
  project: Pick<Project, 'demo' | 'repo'>
}>()
</script>

<template>
  <UButton
    :href="project.repo || undefined"
    target="_blank"
    color="neutral"
    variant="subtle"
    :disabled="!project.repo"
    @click.stop
  >
    <span v-if="project.repo" class="flex items-center gap-1">
      <UIcon :name="getIconLink(project.repo)"></UIcon>
      {{ getDomainName(project.repo) }}
    </span>
    <span v-else>No repo link</span>
  </UButton>
  <UButton
    :href="project.demo || undefined"
    target="_blank"
    color="neutral"
    variant="subtle"
    :disabled="!project.demo"
    @click.stop
  >
    <span v-if="project.demo" class="flex items-center gap-1">
      <UIcon :name="getIconLink(project.demo)"></UIcon>
      {{ getDomainName(project.demo) }}
    </span>
    <span v-else>No demo link</span>
  </UButton>
</template>
