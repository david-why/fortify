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
})

export type EditProjectSchema = z.infer<typeof editProjectSchema>

export const submitProjectSchema = z.object({
  is_update: z.boolean(),
})

export type SubmitProjectSchema = z.infer<typeof submitProjectSchema>
