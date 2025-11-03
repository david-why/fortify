export default defineEventHandler(async (event) => {
  throw createError({
    status: 501,
  })
})
