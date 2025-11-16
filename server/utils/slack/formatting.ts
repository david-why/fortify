export function formatProjectStatusSlack(
  project: Pick<Project, 'status' | 'value'>
) {
  // !! keep in sync with app/components/ProjectStatus.vue !!
  if (project.status === 'building') {
    return 'Building'
  } else if (project.status === 'pending_voting') {
    return 'Waiting for votes'
  } else if (project.status === 'waiting_for_review') {
    return 'Waiting for finalization'
  } else if (project.status === 'submitted') {
    return 'Submitted for review'
  } else if (project.status === 'finished') {
    return `Value: ${project.value} :siege-coin:`
  } else {
    return 'Unknown'
  }
}

export function getDomainName(url: string) {
  const hostname = new URL(url).hostname
  const parts = hostname.split('.')
  return parts.slice(parts.length - 2).join('.')
}
