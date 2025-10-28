import z from 'zod'

const schema = z.object({
  cookie: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const { cookie } = await readValidatedBody(event, schema.parseAsync)

  setCookie(event, '_siege_session', cookie)

  return { ok: true }
})
