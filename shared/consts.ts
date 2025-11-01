// keep in sync with https://github.com/hackclub/siege/blob/main/app/models/project.rb#L322
export const ALLOWED_REPO_HOSTS = [
  'github.com',
  'www.github.com',
  'gitlab.com',
  'www.gitlab.com',
  'bitbucket.org',
  'www.bitbucket.org',
  'codeberg.org',
  'www.codeberg.org',
  'sourceforge.net',
  'www.sourceforge.net',
  'dev.azure.com',
  'git.hackclub.app',
]

export const SUBMIT_NOTE = `Before you submit, check that:
- This project isn't shipped to another program
- Your project is usable, not just a tech-demo.
- You added a readme that explains your project!
- Your project is experienceable by any person on any device. This means that if you make something platform-specific, you should add a video or descriptive pictures as part of the readme.`
