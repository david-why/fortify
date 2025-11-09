<script setup lang="ts">
const route = useRoute()
const toast = useToast()

const { id } = route.params as { id: string }

const { data, error } = await useFetch(`/api/projects/${id}`)
if (error.value) {
  toast.add({
    color: 'error',
    title: 'Failed to fetch project',
    description: error.value.message,
  })
  throw navigateTo('/armory')
}
</script>

<template>
  <ProjectDetailView :id="parseInt(id)" :project="data" />
</template>
