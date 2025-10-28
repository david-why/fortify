<script setup lang="ts">
const layers = computed(() => [
  { image: '/images/castle/0-sky.webp' },
  { image: '/images/castle/1-mountains.webp' },
  { image: '/images/castle/2-grass.webp' },
  { image: '/images/castle/3-walls.webp' },
  { image: '/images/castle/4-chambers.webp' },
  { image: '/images/castle/5-keep.webp' },
  { image: '/images/castle/6-great-hall.webp' },
  { image: '/images/castle/7-armory.webp' },
  { image: '/images/castle/8-market.webp' },
  { image: '/images/castle/9-fountain.webp' },
  { image: '/images/castle/10-catacombs.webp' },
  { image: '/images/castle/11-foreground.webp' },
  { image: '/images/castle/12-lighting.webp' },
  { image: '/images/castle/logo.webp' },
])
</script>

<template>
  <div class="relative">
    <div class="absolute" v-for="layer in layers" :key="layer.image">
      <img :src="layer.image" />
    </div>
  </div>
</template>

<style scoped></style>
