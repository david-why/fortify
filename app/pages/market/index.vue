<script setup lang="ts">
const toast = useToast()

const { data, error } = useFetch('/api/shop')
if (error.value) {
  toast.add({
    color: 'error',
    title: 'Failed to get shop data',
    description: 'Please try again later',
  })
  throw navigateTo('/')
}

const shop = computed(() => data.value!)
</script>

<template>
  <pre>{{ shop }}</pre>
</template>
