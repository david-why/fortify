export function canEditProject(project: Pick<Project, 'status' | 'is_self'>) {
  return (
    project.is_self &&
    (project.status === 'building' || project.status === 'submitted')
  )
}

export function canSubmitProject(project: Pick<Project, 'status' | 'is_self'>) {
  return project.is_self && project.status === 'building'
}
