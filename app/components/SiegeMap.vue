<script setup lang="ts">
const images = computed(() => [
  '/images/castle/0-sky.webp',
  '/images/castle/1-mountains.webp',
  '/images/castle/2-grass.webp',
  '/images/castle/3-walls.webp',
  '/images/castle/4-chambers.webp',
  '/images/castle/5-keep.webp',
  '/images/castle/6-great-hall.webp',
  '/images/castle/7-armory.webp',
  '/images/castle/8-market.webp',
  '/images/castle/9-fountain.webp',
  '/images/castle/10-catacombs.webp',
  '/images/castle/11-foreground.webp',
  '/images/castle/12-lighting.webp',
])
</script>

<template>
  <div class="relative max-w-1/2">
    <div class="absolute" v-for="image in images" :key="image">
      <img :src="image" />
    </div>
  </div>
</template>

<style scoped></style>
