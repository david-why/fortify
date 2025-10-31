export default defineEventHandler(async (event) => {
  // const userID = getRouterParam(event, 'user')
  const projectID = getRouterParam(event, 'project')

  const apiData = (await fetch(
    `https://siege.hackclub.com/api/public-beta/project/${projectID}`
  ).then((r) => r.json())) as APIProject | { error: string }
  if ('error' in apiData) {
    if (apiData.error === 'Project not found') {
      throw createError({ status: 404, message: 'Project not found' })
    }
    throw createError({
      status: 500,
      message: 'Upstream API error',
      data: apiData,
    })
  }

  return {
    id: apiData.id,
    title: apiData.name,
    week: parseInt(apiData.week_badge_text.split(' ')[1]),
    description: apiData.description,
  } satisfies Project
})
