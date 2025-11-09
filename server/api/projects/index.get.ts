export default defineEventHandler(async () => {
  const data = await fetch(
    'https://siege.hackclub.com/api/public-beta/projects'
  ).then((r) => r.json())

  return data.projects as APIProject[]
})
