import z from 'zod'
import { ALLOWED_REPO_HOSTS } from './consts'

export const loginSchema = z.object({
  cookie: z.string().min(1),
})

export type LoginSchema = z.infer<typeof loginSchema>

function checkRepoHost(u: string) {
  try {
    return ALLOWED_REPO_HOSTS.includes(new URL(u).hostname)
  } catch {
    return true
  }
}

export const editProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  repo: z.union([
    z.url().refine(checkRepoHost, {
      error:
        'Repo url must be a repository URL from a supported Git hosting service (GitHub, GitLab, Bitbucket, Codeberg, SourceForge, Azure DevOps, or Hack Club Git)',
    }),
    z.literal(''),
  ]),
  demo: z.union([z.url(), z.literal('')]),
  hackatime_projects: z.array(z.string()),
  screenshot: z.nullable(
    z
      .string()
      .refine((s) => s.startsWith('data:image/'), 'Screenshot must be an image')
  ),
})

export type EditProjectSchema = z.infer<typeof editProjectSchema>

export const submitProjectSchema = z.object({
  is_update: z.boolean(),
})

export type SubmitProjectSchema = z.infer<typeof submitProjectSchema>

export const updateStarsSchema = z.object({
  stars: z.int().min(1).max(5),
})

export type UpdateStarsSchema = z.infer<typeof updateStarsSchema>

export const submitBallotSchema = z.object({
  reasoning: z.string(),
})

export type SubmitBallotSchema = z.infer<typeof submitBallotSchema>

export const purchaseItemSchema = z.object({
  item_name: z.string(),
})

export type PurchaseItemSchema = z.infer<typeof purchaseItemSchema>

export const setMainDeviceSchema = z.object({
  device_id: z.string(),
})

export type SetMainDeviceSchema = z.infer<typeof setMainDeviceSchema>
