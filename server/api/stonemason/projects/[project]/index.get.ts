import { load } from 'cheerio'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event) => {
  const projectID = parseInt(getRouterParam(event, 'project')!)

  const [scrapeData, apiData] = await Promise.all([
    fetchDataFromScraping(event, projectID),
    fetchDataFromAPI(projectID),
  ])

  return {
    ...apiData,
    hackatime_projects: scrapeData.hackatimeProjects,
    status_date: scrapeData.statusDate,
  } satisfies StonemasonDetailProject
})

async function fetchDataFromScraping(event: H3Event, projectID: number) {
  const res = await fetch(
    `https://siege.hackclub.com/review/projects/${projectID}`,
    {
      headers: {
        Cookie: `_siege_session=${getSessionCookie(event)}`,
      },
      redirect: 'manual',
    }
  )
  if (res.status !== 200) {
    throw createError({
      status: 403,
      message: 'You are not a stonemason',
    })
  }
  const htmlText = await res.text()

  const $ = load(htmlText)
  const statusDate = $('.status-badge')
    .text()
    .trim()
    .split('(on ')[1]
    ?.split(')')[0]
  const hackatimeProjects = $('.hackatime-project')
    .map(function () {
      return $(this).text().trim()
    })
    .toArray()

  // todo: review history, public feedback, etc

  return { statusDate, hackatimeProjects }
}

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
