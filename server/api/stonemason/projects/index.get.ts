import { load } from 'cheerio'

export default defineEventHandler(async (event) => {
  const res = await fetch(`https://siege.hackclub.com/review`, {
    headers: {
      Cookie: `_siege_session=${getSessionCookie(event)}`,
    },
    redirect: 'manual',
  })
  if (res.status !== 200) {
    throw createError({
      status: 403,
      message: 'You are not a stonemason',
    })
  }
  const htmlText = await res.text()

  const projects: StonemasonProject[] = []

  const $ = load(htmlText)
  for (const card of $('.project-card')) {
    const projectMatch = card.attribs.onclick?.match(/\/projects\/([0-9]+)/)
    if (!projectMatch) continue
    const [, projectIDString] = projectMatch
    const id = parseInt(projectIDString!)
    const title = $(card).find('.project-title').text()
    const weekString = $(card).find('.project-week').text()
    const week = parseInt(weekString.split(' ')[1])
    const description = $(card).find('.project-description').text().trim()
    const [repo, demo] = $(card)
      .find('.project-links a')
      .map(function () {
        return this.attribs.href
      })
    const userName = $(card).find('.project-owner').text().trim().substring(3)
    const timeText = $(card).find('.hackatime-value').text()
    projects.push({
      id,
      title,
      week,
      description,
      repo,
      demo,
      user: { display_name: userName },
      time_text: timeText,
    })
  }

  return projects
})
