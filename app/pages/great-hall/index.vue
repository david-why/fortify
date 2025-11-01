<script setup lang="ts">
const loadingIndicator = useLoadingIndicator()

const createNew = ref(false)

const { data, error, refresh } = await useFetch('/api/ballot', {
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

const ballot = computed(() => data.value!)

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
    <p>
      Voting is WIP because I can't test it (no projects pending voting right
      now) :(
    </p>
  </template>

  <template v-else>
    <p>Unknown state: {{ ballot.votingState }}</p>
  </template>
</template>
