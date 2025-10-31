import { loginSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { cookie } = await readValidatedBody(event, loginSchema.parseAsync)

  setCookie(event, '_siege_session', cookie, {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // in a year
  })

  return { ok: true }
})
