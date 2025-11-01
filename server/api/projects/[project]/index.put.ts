import { getCsrfTokens } from '~~/server/utils/csrf'
import { editProjectSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const projectID = parseInt(getRouterParam(event, 'project')!)
  const payload = await readValidatedBody(event, editProjectSchema.parseAsync)

  const { csrfToken, authenticityToken } = await getCsrfTokens(
    event,
    `https://siege.hackclub.com/armory/${projectID}/edit`
  )
  if (!authenticityToken) {
    throw new Error('Failed to get CSRF token')
  }

  const body = new FormData()
  body.append('_method', 'patch')
  body.append('authenticity_token', authenticityToken)
  body.append('remove_screenshot', 'false')
  body.append('project[name]', payload.title)
  body.append('project[description]', payload.description)
  body.append('project[repo_url]', payload.repo)
  body.append('project[demo_url]', payload.demo)
  if (payload.screenshot) {
    console.log(payload.screenshot.substring(0, 100))
    if (!payload.screenshot.startsWith('data:')) {
      throw createError({
        status: 400,
        message: 'Please specify a data: URL for screenshot',
      })
    }
    const blob = await fetch(payload.screenshot).then((r) => r.blob())
    body.append('project[screenshot]', blob, 'image')
  }
  body.append('project[hackatime_projects][]', '')
  for (const project of payload.hackatime_projects) {
    body.append('project[hackatime_projects][]', project)
  }
  const res = await fetch(`https://siege.hackclub.com/armory/${projectID}`, {
    method: 'POST',
    headers: {
      Cookie: `_siege_session=${getSessionCookie(event)}`,
      'x-csrf-token': csrfToken,
    },
    body,
    redirect: 'manual',
  })
  if (
    res.status !== 302 ||
    res.headers.get('Location') !==
      `https://siege.hackclub.com/armory/${projectID}`
  ) {
    throw new Error('Failed to edit project')
  }

  setResponseStatus(event, 204)
  return {}
})
