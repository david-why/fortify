export default defineEventHandler(async (event) => {
  const { 'create-new': createNewParam = 'false' } = getQuery(event)
  const createNew = createNewParam === 'true'
  return await getCurrentBallotData(event, { createNew })
})
