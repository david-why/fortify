export function convertAPIProjectToProject(
  project: APIProject
): Omit<Project, 'screenshot' | 'is_self' | 'hackatime_projects'> {
  return {
    id: project.id,
    title: project.name,
    week: parseInt(project.week_badge_text.split(' ')[1]!),
    description: project.description,
    // screenshot: scrapeData.screenshot,
    repo: project.repo_url || null,
    demo: project.demo_url || null,
    status: project.status,
    value: parseFloat(project.coin_value),
    hours: project.hours,
    // is_self: scrapeData.is_self,
    // hackatime_projects: scrapeData.hackatime_projects,
  }
}
