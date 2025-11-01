import { load } from 'cheerio'

export default defineEventHandler(async (event) => {
  const projectID = getRouterParam(event, 'project')!

  const url =
    projectID === 'new'
      ? 'https://siege.hackclub.com/armory/new'
      : `https://siege.hackclub.com/armory/${projectID}/edit`

  const res = await fetch(url, {
    headers: {
      Cookie: `_siege_session=${getSessionCookie(event)}`,
    },
  })
  if (res.status !== 200) {
    throw new Error('Failed to fetch armory project')
  }
  const htmlText = await res.text()

  const $ = load(htmlText)

  const projects = $('.project-hackatime-item')
    .map(function () {
      const name = $(this).find('input').attr('value')!
      return {
        label: name,
        value: name,
        description: $(this).find('.project-hackatime-duration').text(),
      }
    })
    .toArray()
    .filter((s) => s)

  return projects
})
