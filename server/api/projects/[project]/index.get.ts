import { load } from 'cheerio'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event) => {
  const projectID = parseInt(getRouterParam(event, 'project')!)
  if (isNaN(projectID)) {
    throw createError({
      status: 400,
      message: 'Project ID is not an integer',
    })
  }

  const [apiData, scrapeData] = await Promise.all([
    fetchDataFromAPI(projectID),
    fetchDataFromScraping(event, projectID),
  ])

  return {
    id: apiData.id,
    title: apiData.name,
    week: parseInt(apiData.week_badge_text.split(' ')[1]),
    description: apiData.description,
    screenshot: scrapeData.screenshot,
    repo: apiData.repo_url || null,
    demo: apiData.demo_url || null,
    status: apiData.status,
    value: parseFloat(apiData.coin_value),
    hours: apiData.hours,
    is_self: scrapeData.is_self,
  } satisfies Project
})

async function fetchDataFromAPI(projectID: number) {
  const data = (await fetch(
    `https://siege.hackclub.com/api/public-beta/project/${projectID}`
  ).then((r) => r.json())) as APIProject | { error: string }
  if ('error' in data) {
    if (data.error === 'Project not found') {
      throw createError({ status: 404, message: 'Project not found' })
    }
    throw createError({
      status: 500,
      message: 'Upstream API error',
      data: data,
    })
  }
  return data
}

async function fetchDataFromScraping(event: H3Event, projectID: number) {
  const cookie = getSessionCookie(event, false)
  if (!cookie) {
    return { screenshot: null, is_self: false }
  }

  const res = await fetch(`https://siege.hackclub.com/armory/${projectID}`, {
    headers: {
      Cookie: `_siege_session=${cookie}`,
    },
    redirect: 'manual',
  })
  if (res.status !== 200) {
    throw new Error('Failed to fetch armory project')
  }
  const htmlText = await res.text()

  const $ = load(htmlText)
  const screenshotImgs = $('.project-screenshots img')
    .map(function () {
      return this.attribs['src']
    })
    .toArray()
    .filter((i) => i)
  const isSelf = !!$('.submit-button').length

  return {
    screenshot: screenshotImgs[0] || null,
    is_self: isSelf,
  }
}
