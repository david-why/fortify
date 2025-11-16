import { loginSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { cookie } = await readValidatedBody(event, loginSchema.parseAsync)

  if (!(await validateCookie(cookie))) {
    throw createError({
      status: 400,
      message: 'Invalid _siege_session token',
    })
  }

  setCookie(event, '_siege_session', cookie, {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // in a year
  })

  return { ok: true }
})
