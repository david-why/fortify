export function canEditProject(project: Pick<Project, 'status'>) {
  return project.status === 'building' || project.status === 'submitted'
}
