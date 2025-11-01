import { editProjectSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const payload = await readValidatedBody(event, editProjectSchema.parseAsync)

  const { csrfToken, authenticityToken } = await getCsrfTokens(
    event,
    'https://siege.hackclub.com/armory/new'
  )
  if (!authenticityToken) {
    throw new Error('Failed to get CSRF token')
  }

  const body = new FormData()
  body.append('authenticity_token', authenticityToken)
  body.append('remove_screenshot', 'false')
  body.append('project[name]', payload.title)
  body.append('project[description]', payload.description)
  body.append('project[repo_url]', payload.repo)
  body.append('project[demo_url]', payload.demo)
  if (payload.screenshot) {
    const blob = await fetch(payload.screenshot).then((r) => r.blob())
    body.append('project[screenshot]', blob, 'image')
  }
  body.append('project[hackatime_projects][]', '')
  for (const project of payload.hackatime_projects) {
    body.append('project[hackatime_projects][]', project)
  }
  const res = await fetch('https://siege.hackclub.com/armory', {
    method: 'POST',
    headers: {
      Cookie: `_siege_session=${getSessionCookie(event)}`,
      'x-csrf-token': csrfToken,
    },
    body,
    redirect: 'manual',
  })
  const location = res.headers.get('Location')
  if (
    res.status !== 302 ||
    !location?.startsWith(`https://siege.hackclub.com/armory/`)
  ) {
    throw new Error('Failed to create project')
  }

  const parts = location.split('/').filter(s => s)
  return { id: parseInt(parts[parts.length - 1]) }
})
