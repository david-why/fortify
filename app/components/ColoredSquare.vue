<script setup lang="ts">
defineProps<{
  color: string
}>()
</script>

<template>
  <span class="inline-block w-[1em] h-[1em]" :style="{ background: color }" />
</template>
