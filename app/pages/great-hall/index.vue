<script setup lang="ts">
const loadingIndicator = useLoadingIndicator()
const toast = useToast()

const createNew = ref(false)

const { data, error, status, refresh } = await useFetch('/api/ballot', {
  params: {
    'create-new': computed(() => (createNew.value ? 'true' : undefined)),
  },
  watch: false,
})
if (error.value) {
  if (error.value.statusCode === 401) {
    throw navigateTo('/login')
  }
  throw navigateTo('/')
}

const ballot = ref(data.value!)
watch(data, (value) => {
  if (value && status.value === 'success') {
    ballot.value = value
  }
})
const reasoning = ref('')
const totalStars = computed(() =>
  ballot.value.votes.map((v) => v.star_count).reduce((a, b) => a + b, 0)
)

async function createNewVote() {
  createNew.value = true
  loadingIndicator.start()
  await refresh()
  if (error.value) {
    alert(error.value.message)
    throw await navigateTo('/')
  }
  loadingIndicator.finish()
}

const modifyingPromises: Record<number, Promise<unknown>> = {}
const pendingModifyID: Record<number, number> = {}
let pendingIDIncrease = 0

async function modifyStars(vote: Vote, delta: number) {
  vote.star_count += delta
  if (modifyingPromises[vote.id]) {
    const id = (pendingModifyID[vote.id] = pendingIDIncrease++)
    await modifyingPromises[vote.id]
    if (pendingModifyID[vote.id] !== id) {
      return
    }
    delete pendingModifyID[vote.id]
  }
  const promise = (modifyingPromises[vote.id] = $fetch(
    `/api/votes/${vote.id}/stars`,
    {
      method: 'PUT',
      body: { stars: vote.star_count },
    }
  ))
  try {
    await promise
  } finally {
    delete modifyingPromises[vote.id]
  }
}

async function onSubmit() {
  await Promise.all(Object.values(modifyingPromises))
  loadingIndicator.start()
  try {
    await $fetch(`/api/ballot/submit`, {
      method: 'POST',
      body: { reasoning: reasoning.value },
    })
    await refresh()
  } catch (e) {
    toast.add({
      color: 'error',
      title: 'Failed to submit vote',
      description: String(e),
    })
  } finally {
    loadingIndicator.finish()
  }
}
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">Voting</h1>

  <blockquote
    v-if="ballot.meepleMessage"
    class="border-l-2 border-gray-400 ps-4 whitespace-pre-wrap mb-4"
  >
    {{ ballot.meepleMessage }}
  </blockquote>

  <template v-if="ballot.votingState === 'trick_or_treating'">
    <p>
      Trick or treat is not supported yet (since it will only work for a day
      lmao)
    </p>
  </template>

  <template
    v-else-if="
      ['already_voted', 'closed', 'thanks'].includes(ballot.votingState)
    "
  >
    <div v-if="ballot.allowRevote">
      <UButton @click="createNewVote">Vote again</UButton>
    </div>
  </template>

  <template v-else-if="ballot.votingState === 'voting'">
    <blockquote
      class="border-l-2 border-gray-400 ps-4 whitespace-pre-wrap mb-4"
    >
      My liege, there are four diplomats who would like to present their rulers'
      plans!
    </blockquote>

    <UserProjectCard
      class="mb-4"
      :project="vote.project"
      :key="vote.id"
      v-for="vote in ballot.votes"
    />

    <UCard class="my-8">
      <template #header>
        <h2 class="text-xl font-semibold">Cast your ballot</h2>
      </template>

      <p class="mb-4">Total stars allocated: {{ totalStars }} / 12</p>

      <ul class="mb-4">
        <li
          class="mb-2 flex items-center gap-4"
          v-for="vote in ballot.votes"
          :key="vote.id"
        >
          <UButton
            variant="soft"
            icon="i-material-symbols-stat-minus-1"
            :color="vote.star_count <= 1 ? 'neutral' : 'primary'"
            @click="modifyStars(vote, -1)"
            :disabled="vote.star_count <= 1"
          />
          <UIcon class="text-primary" name="i-material-symbols-star-rate" />
          <span class="font-mono">{{ vote.star_count }}/5</span>
          <UButton
            variant="soft"
            icon="i-material-symbols-stat-1"
            :color="
              vote.star_count >= 5 || totalStars >= 12 ? 'neutral' : 'primary'
            "
            @click="modifyStars(vote, 1)"
            :disabled="vote.star_count >= 5 || totalStars >= 12"
          />
          <span>{{ vote.project.title }}</span>
        </li>
      </ul>
      <p class="mb-2">Share your thoughts on the projects:</p>
      <UTextarea
        class="mb-4 w-full"
        v-model="reasoning"
        placeholder="Why did you vote the way you did? Share your thoughts on each project..."
        :rows="6"
      />

      <div>
        <UButton :disabled="totalStars !== 12" @click="onSubmit"
          >Submit</UButton
        >
      </div>
    </UCard>
  </template>

  <template v-else>
    <p>Unknown state: {{ ballot.votingState }}</p>
  </template>
</template>
