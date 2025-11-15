<script setup lang="ts">
import { Chart } from 'chart.js/auto'

const toast = useToast()

const chartCanvas = useTemplateRef('chartCanvas')

const { data: projectsData, error: projectsError } = await useFetch(
  '/api/users/me/projects'
)
if (projectsError.value || !projectsData.value) {
  toast.add({
    color: 'error',
    title: 'Failed to load your projects',
    description: projectsError.value?.message || 'Please try again later',
  })
  throw navigateTo('/')
}

const { data: purchases, error: purchaseError } = await useFetch(
  '/api/users/me/purchases'
)
if (purchaseError.value) {
  toast.add({
    color: 'error',
    title: 'Failed to load your projects',
    description: purchaseError.value.message,
  })
  throw navigateTo('/')
}

const { data: coins, error: coinsError } = await useFetch('/api/users/me/coins')
if (coinsError.value) {
  toast.add({
    color: 'error',
    title: 'Failed to load your coins',
    description: 'Please try again later',
  })
  throw navigateTo('/')
}

const { data: leaderboard, error: leaderboardError } = await useFetch(
  '/api/leaderboard'
)
if (leaderboardError.value) {
  toast.add({
    color: 'error',
    title: 'Failed to load leaderboard',
    description: 'Please try again later',
  })
  throw navigateTo('/')
}

const currentProject = computed(() =>
  projectsData.value!.canCreate
    ? null
    : projectsData.value!.projects.toSorted((a, b) => b.week - a.week)[0]!
)

onMounted(() => {
  if (chartCanvas.value) {
    const sortedProjects = projectsData.value!.projects.toSorted(
      (a, b) => a.week - b.week
    )
    const maxWeek = sortedProjects.length
      ? sortedProjects[sortedProjects.length - 1]!.week
      : 0
    const labels = Array.from({ length: maxWeek }).map((_, i) => i + 1)
    const values = labels.map(
      (i) => sortedProjects.find((p) => p.week === i)?.value ?? 0
    )
    new Chart(chartCanvas.value, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Coins received',
            data: values,
          },
        ],
      },
    })
  }
})
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">Your space</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
    <UCard variant="soft" class="bg-primary/20 md:col-span-2">
      <h2 class="text-xl font-semibold text-primary mb-4">Your project</h2>
      <div v-if="currentProject">
        <ULink
          as="div"
          class="cursor-pointer text-default"
          :href="`/armory/${currentProject.id}`"
        >
          <UserProjectCard :project="currentProject" />
        </ULink>
      </div>
      <p v-else>
        No project yet.
        <ULink class="text-primary" to="/armory/new">Create one now!</ULink>
      </p>
    </UCard>
    <UCard variant="soft" class="bg-secondary/20">
      <h2 class="text-xl font-semibold mb-4">Your coins</h2>
      <p>
        You have {{ coins }} <CoinIcon />.
        <ULink class="text-primary" href="/market">Go buy something!</ULink>
      </p>
      <div v-if="purchases?.purchases.length">
        <p class="mt-2">Your purchases:</p>
        <ul class="list-disc ml-6">
          <li v-for="purchase in purchases.purchases" :key="purchase.item_name">
            {{ purchase.quantity }}x {{ purchase.item_name }} ({{
              purchase.total_coins_spent
            }}
            <CoinIcon />)
          </li>
        </ul>
      </div>
    </UCard>
    <UCard variant="soft" class="bg-secondary/20">
      <h2 class="text-xl font-semibold mb-4">Time leaderboard</h2>
      <ol>
        <li
          v-for="(person, index) in leaderboard"
          :key="person.user_name"
          class="my-2"
        >
          {{ index + 1 }}. <b>{{ person.user_name }}</b> -
          {{ person.time_text }}
        </li>
      </ol>
    </UCard>
    <UCard variant="soft" class="md:col-span-2 bg-primary/20">
      <h2 class="text-xl font-semibold mb-4">Your stats</h2>
      <canvas ref="chartCanvas"></canvas>
    </UCard>
  </div>
</template>
