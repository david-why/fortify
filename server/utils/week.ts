import { DateTime } from 'luxon'

const SIEGE_START = DateTime.fromObject(
  {
    year: 2025,
    month: 9,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
  },
  { zone: 'America/New_York' }
)

export function getWeekRange(week: number) {
  return [
    SIEGE_START.plus({ weeks: week - 1 }),
    SIEGE_START.plus({ weeks: week }).minus({ seconds: 1 }),
  ]
}

export function getCurrentWeek() {
  let week = 1
  while (getWeekRange(week)[1].toMillis() < Date.now()) {
    week++
  }
  return week
}
